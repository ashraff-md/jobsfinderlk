import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRequestStatus, UserRole } from '@prisma/client';
import { reviewedByAdminSelect } from '../../common/utils/reviewed-by-admin.select';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { PrismaService } from '../../prisma/prisma.service';

export type AdminRecruiterVerificationStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'UNLINKED';

export type ReviewedByAdmin = {
  id: string;
  email: string;
  adminProfile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type AdminRecruiterListItem = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  title: string | null;
  contactNo: string | null;
  companyName: string | null;
  companyId: string | null;
  companyLogoUrl: string | null;
  companyVerified: boolean;
  emailVerified: boolean;
  verificationStatus: AdminRecruiterVerificationStatus;
  reviewedAt: Date | null;
  reviewedBy: ReviewedByAdmin | null;
  createdAt: Date;
};

type EmployerUserWithCompany = {
  id: string;
  fullName: string | null;
  title: string | null;
  contactNo: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    verified: boolean;
  };
};

type RecruiterUserRow = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: ReviewedByAdmin | null;
  employerUsers: EmployerUserWithCompany[];
  companyRequests: Array<{ companyName: string }>;
};

@Injectable()
export class AdminRecruitersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private resolveVerificationStatus(
    user: RecruiterUserRow,
  ): AdminRecruiterVerificationStatus {
    if (user.employerUsers.some((link) => link.company.verified)) {
      return 'VERIFIED';
    }
    if (
      user.companyRequests.length > 0 ||
      user.employerUsers.length > 0
    ) {
      return 'PENDING';
    }
    return 'UNLINKED';
  }

  private mapRecruiter(user: RecruiterUserRow): AdminRecruiterListItem {
    const primaryLink = user.employerUsers[0];
    const pendingRequest = user.companyRequests[0];
    const company = primaryLink?.company;

    return {
      id: primaryLink?.id ?? user.id,
      userId: user.id,
      email: user.email,
      fullName: primaryLink?.fullName ?? null,
      title: primaryLink?.title ?? null,
      contactNo: primaryLink?.contactNo ?? null,
      companyName: company?.name ?? pendingRequest?.companyName ?? null,
      companyId: company?.id ?? null,
      companyLogoUrl: this.imageStorage.resolvePublicUrl(company?.logoUrl),
      companyVerified: company?.verified ?? false,
      emailVerified: user.emailVerified,
      verificationStatus: this.resolveVerificationStatus(user),
      reviewedAt: user.reviewedAt,
      reviewedBy: user.reviewedBy,
      createdAt: user.createdAt,
    };
  }

  async listForAdmin(filters?: { status?: string; q?: string }) {
    const q = filters?.q?.trim();

    const users = await this.prisma.user.findMany({
      where: {
        role: UserRole.EMPLOYER,
        ...(q
          ? {
              OR: [
                { email: { contains: q, mode: 'insensitive' } },
                {
                  employerUsers: {
                    some: { fullName: { contains: q, mode: 'insensitive' } },
                  },
                },
                {
                  employerUsers: {
                    some: {
                      company: { name: { contains: q, mode: 'insensitive' } },
                    },
                  },
                },
                {
                  companyRequests: {
                    some: {
                      companyName: { contains: q, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        reviewedBy: reviewedByAdminSelect,
        employerUsers: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        companyRequests: {
          where: { status: CompanyRequestStatus.PENDING },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let items = users.map((user) => this.mapRecruiter(user));

    const status = filters?.status?.trim();
    if (status && status !== 'all') {
      items = items.filter((item) => item.verificationStatus === status);
    }

    return items;
  }

  async findByIdForAdmin(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, role: UserRole.EMPLOYER },
      include: {
        reviewedBy: reviewedByAdminSelect,
        employerUsers: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
                website: true,
                industry: true,
                city: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        companyRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { reviewedBy: reviewedByAdminSelect },
        },
      },
    });
    if (!user) throw new NotFoundException('Recruiter not found');
    return this.mapRecruiter(user as RecruiterUserRow);
  }

  async moderate(
    userId: string,
    _action: 'approve' | 'reject',
    reviewerId: string,
  ) {
    const recruiter = await this.prisma.user.findFirst({
      where: { id: userId, role: UserRole.EMPLOYER },
    });
    if (!recruiter) throw new NotFoundException('Recruiter not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        reviewedBy: reviewedByAdminSelect,
        employerUsers: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        companyRequests: {
          where: { status: CompanyRequestStatus.PENDING },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { companyName: true },
        },
      },
    });

    return this.mapRecruiter(updated as RecruiterUserRow);
  }
}
