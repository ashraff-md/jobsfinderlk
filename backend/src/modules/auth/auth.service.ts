import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateAdminProfileDto,
  UpdateEmployerProfileDto,
} from './dto/auth.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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
    return user;
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
    const link = await this.prisma.employerUser.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!link) {
      throw new ForbiddenException(
        'No company is linked to your account. Complete company registration first.',
      );
    }

    const fullName = dto.fullName?.trim();
    const title = dto.title?.trim();
    const contactNo = dto.contactNo?.trim();

    return this.prisma.employerUser.update({
      where: { id: link.id },
      data: {
        ...(dto.fullName !== undefined ? { fullName: fullName || null } : {}),
        ...(dto.title !== undefined ? { title: title || null } : {}),
        ...(dto.contactNo !== undefined ? { contactNo: contactNo || null } : {}),
      },
      include: { company: true },
    });
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
