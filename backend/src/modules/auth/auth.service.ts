import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole, VerificationTokenType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateAdminProfileDto,
  UpdateEmployerProfileDto,
} from './dto/auth.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { VerificationService } from './verification.service';
import { EmployerPurchasesService } from './employer-purchases.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly verification: VerificationService,
    private readonly employerPurchases: EmployerPurchasesService,
    private readonly imageStorage: ImageStorageService,
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role === UserRole.ADMIN || dto.role === UserRole.MODERATOR) {
      throw new ForbiddenException('Administrator accounts cannot be created via public registration');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
      },
      select: { id: true, email: true, role: true, emailVerified: true },
    });

    if (dto.role === UserRole.SEEKER) {
      await this.prisma.seekerProfile.create({
        data: { userId: user.id, fullName: dto.fullName ?? null },
      });
    }

    if (dto.role === UserRole.EMPLOYER) {
      await this.verification.sendEmailVerification(user.id);
    }

    return {
      user,
      ...this.issueTokens(user.id, user.email, user.role),
    };
  }

  async login(dto: LoginDto, allowedRoles?: UserRole[]) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      throw new ForbiddenException('This account is not authorized for the admin portal');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      ...this.issueTokens(user.id, user.email, user.role),
    };
  }

  adminLogin(dto: LoginDto) {
    return this.login(dto, [UserRole.ADMIN, UserRole.MODERATOR]);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<AuthUser>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException();

      return this.issueTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        adminProfile: true,
        seekerProfile: true,
        employerUsers: { include: { company: true } },
      },
    });
    if (!user) throw new UnauthorizedException();

    const listingAllowance =
      user.role === UserRole.EMPLOYER
        ? await this.employerPurchases.getListingAllowance(userId)
        : undefined;

    return {
      ...user,
      listingAllowance,
      employerUsers: user.employerUsers.map((link) => ({
        ...link,
        photoUrl: this.imageStorage.resolvePublicUrl(link.photoUrl),
        company: this.imageStorage.withPublicUrls(link.company),
      })),
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  async updateEmployerProfile(userId: string, dto: UpdateEmployerProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });
    if (!user) throw new UnauthorizedException();

    const link = await this.resolveEmployerLink(
      userId,
      dto.companyId,
      dto.companyName,
    );

    const fullName = dto.fullName?.trim();
    const title = dto.title?.trim();
    const contactNo = dto.contactNo?.trim();
    const billingAddress = dto.billingAddress?.trim();

    if (dto.contactNo !== undefined) {
      await this.verification.assertPhoneVerifiedForProfileSave(
        userId,
        link,
        contactNo || null,
      );
    }

    let photoUrl: string | null | undefined;
    if (dto.photoUrl !== undefined) {
      if (!dto.photoUrl.trim()) {
        photoUrl = null;
      } else {
        photoUrl = await this.imageStorage.saveOrKeepRecruiterPhoto(dto.photoUrl);
      }
    }

    const nextEmail = dto.email?.trim().toLowerCase();
    if (nextEmail !== undefined) {
      if (user.emailVerified) {
        throw new BadRequestException('Verified email cannot be changed');
      }
      if (nextEmail !== user.email.toLowerCase()) {
        const existing = await this.prisma.user.findUnique({
          where: { email: nextEmail },
        });
        if (existing) {
          throw new ConflictException('Email is already in use');
        }
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: userId },
            data: { email: nextEmail, emailVerified: false },
          }),
          this.prisma.verificationToken.deleteMany({
            where: { userId, type: VerificationTokenType.EMAIL },
          }),
        ]);
      }
    }

    const updated = await this.prisma.employerUser.update({
      where: { id: link.id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: fullName || null } : {}),
        ...(dto.title !== undefined ? { title: title || null } : {}),
        ...(dto.contactNo !== undefined
          ? {
              contactNo: contactNo || null,
              ...this.verification.resetPhoneVerificationIfContactChanged(
                link.contactNo,
                contactNo || null,
              ),
            }
          : {}),
        ...(dto.billingAddress !== undefined
          ? { billingAddress: billingAddress || null }
          : {}),
        ...(photoUrl !== undefined ? { photoUrl } : {}),
      },
      include: { company: true },
    });

    return {
      ...updated,
      photoUrl: this.imageStorage.resolvePublicUrl(updated.photoUrl),
      company: this.imageStorage.withPublicUrls(updated.company),
    };
  }

  private async resolveEmployerLink(
    userId: string,
    companyId?: string,
    companyName?: string,
  ) {
    let link = await this.prisma.employerUser.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    let resolvedCompanyId = companyId;

    if (!resolvedCompanyId && companyName?.trim()) {
      const trimmedName = companyName.trim();
      const matched = await this.prisma.company.findFirst({
        where: { name: { equals: trimmedName, mode: 'insensitive' } },
        select: { id: true },
      });
      resolvedCompanyId = matched?.id;

      if (!resolvedCompanyId) {
        const similar = await this.companiesService.findSimilar({
          name: trimmedName,
        });
        const strongMatch = similar.find((item) => item.score >= 0.92);
        if (strongMatch) {
          throw new BadRequestException(
            `A similar company already exists: ${strongMatch.name}. Select it from the suggestions.`,
          );
        }

        if (link) {
          const renamed = await this.companiesService.renameOwnedPlaceholderCompany(
            userId,
            link.companyId,
            trimmedName,
          );
          if (renamed) {
            return link;
          }
        }

        throw new BadRequestException(
          'We could not find that company. Select an existing company from the suggestions or register a new company.',
        );
      }
    }

    if (resolvedCompanyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: resolvedCompanyId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (!link) {
        return this.prisma.employerUser.create({
          data: { userId, companyId: resolvedCompanyId },
        });
      }

      if (link.companyId === resolvedCompanyId) {
        return link;
      }

      await this.prisma.employerUser.deleteMany({
        where: {
          userId,
          companyId: resolvedCompanyId,
          id: { not: link.id },
        },
      });

      return this.prisma.employerUser.update({
        where: { id: link.id },
        data: { companyId: resolvedCompanyId },
      });
    }

    if (!link) {
      throw new BadRequestException('Enter your company name.');
    }

    return link;
  }

  async updateAdminProfile(userId: string, role: UserRole, dto: UpdateAdminProfileDto) {
    if (role !== UserRole.ADMIN && role !== UserRole.MODERATOR) {
      throw new ForbiddenException('Admin profile is only available for administrators');
    }

    const firstName = dto.firstName?.trim() || undefined;
    const lastName = dto.lastName?.trim() || undefined;
    const email = dto.email?.trim().toLowerCase() || undefined;
    const contactNo = dto.contactNo?.trim() || undefined;

    return this.prisma.adminProfile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        email: email ?? null,
        contactNo: contactNo ?? null,
      },
      update: {
        ...(dto.firstName !== undefined ? { firstName: firstName ?? null } : {}),
        ...(dto.lastName !== undefined ? { lastName: lastName ?? null } : {}),
        ...(dto.email !== undefined ? { email: email ?? null } : {}),
        ...(dto.contactNo !== undefined ? { contactNo: contactNo ?? null } : {}),
      },
    });
  }

  private issueTokens(userId: string, email: string, role: UserRole) {
    const payload: AuthUser = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { accessToken, refreshToken };
  }
}
