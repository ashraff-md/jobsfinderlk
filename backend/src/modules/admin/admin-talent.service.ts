import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AdminTalentStatus =
  | 'COMPLETE'
  | 'ACTIVE'
  | 'VERIFIED'
  | 'INCOMPLETE';

export type AdminTalentListItem = {
  id: string;
  email: string;
  fullName: string | null;
  headline: string | null;
  resumeUrl: string | null;
  emailVerified: boolean;
  applicationCount: number;
  profileStatus: AdminTalentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminTalentStats = {
  total: number;
  completeProfiles: number;
  activeApplicants: number;
  emailVerified: number;
  joinedThisMonth: number;
  growthPercent: number;
  monthlySignups: Array<{ month: string; count: number }>;
  distribution: Array<{ label: string; count: number; percent: number }>;
};

type SeekerUserRow = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  seekerProfile: {
    fullName: string | null;
    headline: string | null;
    resumeUrl: string | null;
  } | null;
  _count: { applications: number };
};

@Injectable()
export class AdminTalentService {
  constructor(private readonly prisma: PrismaService) {}

  private isProfileComplete(profile: SeekerUserRow['seekerProfile']) {
    return Boolean(profile?.fullName?.trim() && profile?.headline?.trim());
  }

  private resolveProfileStatus(user: SeekerUserRow): AdminTalentStatus {
    if (user._count.applications > 0) return 'ACTIVE';
    if (this.isProfileComplete(user.seekerProfile)) return 'COMPLETE';
    if (user.emailVerified) return 'VERIFIED';
    return 'INCOMPLETE';
  }

  private mapSeeker(user: SeekerUserRow): AdminTalentListItem {
    return {
      id: user.id,
      email: user.email,
      fullName: user.seekerProfile?.fullName ?? null,
      headline: user.seekerProfile?.headline ?? null,
      resumeUrl: user.seekerProfile?.resumeUrl ?? null,
      emailVerified: user.emailVerified,
      applicationCount: user._count.applications,
      profileStatus: this.resolveProfileStatus(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async listForAdmin(filters?: { status?: string; q?: string }) {
    const q = filters?.q?.trim();
    const status = filters?.status?.trim().toUpperCase();

    const where: Prisma.UserWhereInput = {
      role: UserRole.SEEKER,
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' as const } },
              {
                seekerProfile: {
                  is: {
                    OR: [
                      { fullName: { contains: q, mode: 'insensitive' as const } },
                      { headline: { contains: q, mode: 'insensitive' as const } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const users = await this.prisma.user.findMany({
      where,
      include: {
        seekerProfile: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = users.map((user) => this.mapSeeker(user as SeekerUserRow));

    if (!status || status === 'ALL') return mapped;

    return mapped.filter((item) => item.profileStatus === status);
  }

  async getStats(): Promise<AdminTalentStats> {
    const seekers = await this.prisma.user.findMany({
      where: { role: UserRole.SEEKER },
      include: {
        seekerProfile: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const rows = seekers.map((user) => this.mapSeeker(user as SeekerUserRow));
    const total = rows.length;

    const completeProfiles = rows.filter((r) => r.profileStatus === 'COMPLETE' || r.profileStatus === 'ACTIVE').length;
    const activeApplicants = rows.filter((r) => r.applicationCount > 0).length;
    const emailVerified = rows.filter((r) => r.emailVerified).length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const joinedThisMonth = rows.filter((r) => new Date(r.createdAt) >= startOfMonth).length;
    const joinedLastMonth = rows.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= startOfLastMonth && created < startOfMonth;
    }).length;

    const growthPercent =
      joinedLastMonth === 0
        ? joinedThisMonth > 0
          ? 100
          : 0
        : Math.round(((joinedThisMonth - joinedLastMonth) / joinedLastMonth) * 1000) / 10;

    const monthlySignups: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i -= 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = rows.filter((r) => {
        const created = new Date(r.createdAt);
        return created >= monthStart && created < monthEnd;
      }).length;
      monthlySignups.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        count,
      });
    }

    let completeOnly = 0;
    let verifiedOnly = 0;
    let incomplete = 0;

    for (const row of rows) {
      if (row.applicationCount > 0) continue;
      if (this.isProfileCompleteFromItem(row)) completeOnly += 1;
      else if (row.emailVerified) verifiedOnly += 1;
      else incomplete += 1;
    }

    const buckets = [
      { label: 'Active Applicants', count: activeApplicants },
      { label: 'Complete Profiles', count: completeOnly },
      { label: 'Email Verified', count: verifiedOnly },
      { label: 'Basic Registration', count: incomplete },
    ];

    const distribution = buckets.map((bucket) => ({
      ...bucket,
      percent: total === 0 ? 0 : Math.round((bucket.count / total) * 100),
    }));

    return {
      total,
      completeProfiles,
      activeApplicants,
      emailVerified,
      joinedThisMonth,
      growthPercent,
      monthlySignups,
      distribution,
    };
  }

  private isProfileCompleteFromItem(item: AdminTalentListItem) {
    return Boolean(item.fullName?.trim() && item.headline?.trim());
  }
}
