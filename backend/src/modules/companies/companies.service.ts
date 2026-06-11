import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRequestStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { slugify, uniqueSlug } from '../../common/utils/slug.util';
import {
  extractDomain,
  matchReason,
  similarityScore,
} from '../../common/utils/company-match.util';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ImageStorageService } from '../../common/storage/image-storage.service';

export type CompanySuggestion = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  pendingReview?: boolean;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'phonetic' | 'domain';
};

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  async findAll(search?: string) {
    const companies = await this.prisma.company.findMany({
      where: {
        verified: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            jobs: { where: { status: 'PUBLISHED' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return companies.map((company) => this.imageStorage.withPublicUrls(company));
  }

  async suggest(
    query: string,
    userId?: string,
    userRole?: UserRole,
    limit = 10,
  ): Promise<CompanySuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const isAdmin =
      userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR;

    const verifiedCandidates = await this.prisma.company.findMany({
      where: {
        verified: true,
        name: { contains: trimmed, mode: 'insensitive' },
      },
      take: 50,
      orderBy: { name: 'asc' },
    });

    let pendingCandidates: typeof verifiedCandidates = [];
    if (userId && !isAdmin) {
      pendingCandidates = await this.prisma.company.findMany({
        where: {
          verified: false,
          name: { contains: trimmed, mode: 'insensitive' },
          placeholderRequest: {
            requestedById: userId,
            status: CompanyRequestStatus.PENDING,
          },
        },
        take: 20,
        orderBy: { name: 'asc' },
      });
    }

    const seen = new Set<string>();
    const candidates = [...pendingCandidates, ...verifiedCandidates].filter(
      (company) => {
        if (seen.has(company.id)) return false;
        seen.add(company.id);
        return true;
      },
    );

    const scored = candidates
      .map((company) => {
        const withUrls = this.imageStorage.withPublicUrls(company);
        const pendingReview = !company.verified;
        return {
          ...withUrls,
          pendingReview,
          score: similarityScore(trimmed, company.name),
          matchType: matchReason(trimmed, company.name),
        };
      })
      .filter((item) => item.score >= 0.45)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return scored.slice(0, limit);
  }

  async findSimilar(input: {
    name: string;
    website?: string | null;
    emailDomain?: string | null;
  }): Promise<CompanySuggestion[]> {
    const trimmed = input.name.trim();
    if (!trimmed) return [];

    const domain = extractDomain(input.emailDomain) ?? extractDomain(input.website);
    const candidates = await this.prisma.company.findMany({
      where: {
        verified: true,
        OR: [
          { name: { contains: trimmed.slice(0, Math.max(3, trimmed.length)), mode: 'insensitive' } },
          ...(domain
            ? [
                { emailDomain: { equals: domain, mode: 'insensitive' as const } },
                { website: { contains: domain, mode: 'insensitive' as const } },
              ]
            : []),
        ],
      },
      take: 50,
    });

    const scored = candidates
      .map((company) => {
        let score = similarityScore(trimmed, company.name);
        const companyDomain =
          extractDomain(company.emailDomain) ?? extractDomain(company.website);

        if (domain && companyDomain && domain === companyDomain) {
          score = Math.max(score, 0.95);
        }

        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          verified: company.verified,
          website: company.website,
          industry: company.industry,
          location: company.location,
          score,
          matchType:
            domain && companyDomain && domain === companyDomain
              ? ('domain' as const)
              : matchReason(trimmed, company.name),
        };
      })
      .filter((item) => item.score >= 0.55)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 8);
  }

  async findBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            city: true,
            employmentType: true,
            workArrangement: true,
            salaryMin: true,
            salaryMax: true,
            publishedAt: true,
            applicationDeadline: true,
          },
        },
        _count: {
          select: {
            jobs: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });
    if (!company || !company.verified) {
      throw new NotFoundException('Company not found');
    }

    const { jobs, _count, ...rest } = company;
    return {
      ...this.imageStorage.withPublicUrls(rest),
      _count,
      jobs,
    };
  }

  async createForEmployer(userId: string, dto: CreateCompanyDto) {
    const company = await this.createCompanyRecord(dto);

    await this.prisma.employerUser.create({
      data: { userId, companyId: company.id },
    });

    return this.imageStorage.withPublicUrls(company);
  }

  async createFromRequest(
    userId: string,
    dto: CreateCompanyDto & {
      industry?: string;
      address?: string;
      city?: string;
      location?: string;
      companyType?: string;
      emailDomain?: string;
      lifeAtCompanyImages?: string[];
      verified?: boolean;
    },
  ) {
    const company = await this.createCompanyRecord(dto, {
      industry: dto.industry,
      address: dto.address,
      city: dto.city,
      location: dto.location,
      companyType: dto.companyType,
      emailDomain: dto.emailDomain,
      lifeAtCompanyImages: dto.lifeAtCompanyImages,
      verified: dto.verified ?? false,
    });

    await this.linkEmployerToCompany(userId, company.id);
    return this.imageStorage.withPublicUrls(company);
  }

  private async createCompanyRecord(
    dto: CreateCompanyDto,
    extra?: {
      industry?: string;
      address?: string;
      city?: string;
      location?: string;
      companyType?: string;
      emailDomain?: string;
      lifeAtCompanyImages?: string[];
      verified?: boolean;
    },
  ) {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let attempt = 0;
    while (await this.prisma.company.findUnique({ where: { slug } })) {
      attempt += 1;
      slug = uniqueSlug(dto.name, String(attempt));
    }

    return this.prisma.company.create({
      data: {
        name: dto.name,
        slug,
        website: dto.website,
        description: dto.description,
        logoUrl: this.imageStorage.normalizeStoredPath(dto.logoUrl),
        industry: extra?.industry,
        address: extra?.address,
        city: extra?.city,
        location: extra?.location,
        companyType: extra?.companyType,
        emailDomain: extra?.emailDomain,
        lifeAtCompanyImages: (extra?.lifeAtCompanyImages ?? [])
          .map((item) => this.imageStorage.normalizeStoredPath(item))
          .filter((item): item is string => Boolean(item)),
        verified: extra?.verified ?? false,
      },
    });
  }

  async linkEmployerToCompany(userId: string, companyId: string) {
    await this.prisma.employerUser.upsert({
      where: {
        userId_companyId: { userId, companyId },
      },
      update: {},
      create: { userId, companyId },
    });
  }

  async findOrCreateGovernmentPlaceholder() {
    const name = 'Government of Sri Lanka';
    const slug = 'government-of-sri-lanka';
    const existing = await this.prisma.company.findUnique({ where: { slug } });
    if (existing) return this.imageStorage.withPublicUrls(existing);

    const created = await this.prisma.company.create({
      data: {
        name,
        slug,
        verified: true,
        industry: 'Government',
        companyType: 'Government',
      },
    });
    return this.imageStorage.withPublicUrls(created);
  }

  async resolveForJob(
    userId: string,
    input: { companyId?: string },
    userRole?: UserRole,
  ) {
    if (!input.companyId) {
      throw new BadRequestException(
        'Select an existing company or submit a new company request before posting a job.',
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: input.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const isAdmin =
      userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR;
    if (!company.verified && !isAdmin) {
      const allowed = await this.canUsePendingCompany(userId, company.id);
      if (!allowed) {
        throw new ForbiddenException(
          'This company is pending review and can only be used by the recruiter who submitted it.',
        );
      }
    }

    await this.linkEmployerToCompany(userId, company.id);
    return this.imageStorage.withPublicUrls(company);
  }

  async canUsePendingCompany(userId: string, companyId: string): Promise<boolean> {
    const request = await this.prisma.companyRequest.findFirst({
      where: {
        placeholderCompanyId: companyId,
        requestedById: userId,
        status: CompanyRequestStatus.PENDING,
      },
    });
    return Boolean(request);
  }

  async renameOwnedPlaceholderCompany(
    userId: string,
    companyId: string,
    newName: string,
  ): Promise<boolean> {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    const allowed = await this.canUsePendingCompany(userId, companyId);
    if (!allowed) return false;

    const baseSlug = slugify(trimmed);
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const conflict = await this.prisma.company.findFirst({
        where: { slug, NOT: { id: companyId } },
      });
      if (!conflict) break;
      attempt += 1;
      slug = uniqueSlug(trimmed, String(attempt));
    }

    await this.prisma.$transaction([
      this.prisma.company.update({
        where: { id: companyId },
        data: { name: trimmed, slug },
      }),
      this.prisma.companyRequest.updateMany({
        where: {
          placeholderCompanyId: companyId,
          requestedById: userId,
          status: CompanyRequestStatus.PENDING,
        },
        data: { companyName: trimmed },
      }),
    ]);

    return true;
  }

  async syncFromApprovedRequest(
    companyId: string,
    request: {
      companyName: string;
      website: string | null;
      description: string | null;
      logoUrl: string | null;
      industry: string | null;
      address: string | null;
      city: string | null;
      location: string | null;
      companyType: string | null;
      emailDomain: string | null;
      lifeAtCompanyImages: string[];
    },
  ) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found');

    const trimmedName = request.companyName.trim();
    let slug = company.slug;
    if (trimmedName !== company.name) {
      const baseSlug = slugify(trimmedName);
      slug = baseSlug;
      let attempt = 0;
      while (true) {
        const conflict = await this.prisma.company.findFirst({
          where: { slug, NOT: { id: companyId } },
        });
        if (!conflict) break;
        attempt += 1;
        slug = uniqueSlug(trimmedName, String(attempt));
      }
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: trimmedName,
        slug,
        website: request.website,
        description: request.description,
        logoUrl: request.logoUrl,
        industry: request.industry,
        address: request.address,
        city: request.city,
        location: request.location,
        companyType: request.companyType,
        emailDomain: request.emailDomain,
        lifeAtCompanyImages: request.lifeAtCompanyImages,
        verified: true,
      },
    });
  }
}
