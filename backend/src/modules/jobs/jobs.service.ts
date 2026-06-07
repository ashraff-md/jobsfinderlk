import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CompaniesService } from '../companies/companies.service';
import {
  matchReason,
  similarityScore,
} from '../../common/utils/company-match.util';
import { detectScamContent, slugify, uniqueSlug } from '../../common/utils/slug.util';
import { assertValidApplicationDeadline } from '../../common/utils/application-deadline.util';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { VerificationService } from '../auth/verification.service';
import { CreateJobDto, JobQueryDto, UpdateJobDto } from './dto/job.dto';
import {
  CreateJobCategoryDto,
  UpdateJobCategoryDto,
} from './dto/job-category.dto';

function buildJobSlug(
  dto: CreateJobDto,
  companySlug: string,
  fallbackSuffix: string,
): string {
  const parts = [dto.title, dto.city, companySlug].filter(Boolean);
  const base = slugify(parts.join('-'));
  return base || uniqueSlug(dto.title, fallbackSuffix);
}

function buildJobKeywords(
  dto: CreateJobDto,
  companyName: string,
): string[] {
  const tokens = new Set<string>();

  const addPhrase = (value?: string | null) => {
    if (!value?.trim()) return;
    value
      .split(/[\s,•\-/|]+/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 2)
      .forEach((part) => tokens.add(part));
  };

  addPhrase(dto.title);
  addPhrase(dto.category);
  addPhrase(dto.sector);
  addPhrase(dto.city);
  addPhrase(dto.employmentType);
  addPhrase(dto.workArrangement);
  addPhrase(dto.experienceLevel);
  addPhrase(dto.responsibilities);
  addPhrase(dto.requirements);
  if (dto.ageMin != null) tokens.add(String(dto.ageMin));
  if (dto.ageMax != null) tokens.add(String(dto.ageMax));
  addPhrase(companyName);

  for (const skill of [...(dto.requiredSkills ?? []), ...(dto.niceToHaveSkills ?? [])]) {
    addPhrase(skill);
  }

  return [...tokens].slice(0, 30);
}

export type JobSearchSuggestion = {
  text: string;
  type: 'title' | 'category' | 'city' | 'keyword';
  score: number;
  matchType: 'exact' | 'fuzzy' | 'phonetic' | 'domain';
};

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
    private readonly imageStorage: ImageStorageService,
    private readonly verification: VerificationService,
  ) {}

  private mapJobForPublic<
    T extends {
      vacancyArtworkUrl?: string | null;
      company: { logoUrl?: string | null; lifeAtCompanyImages?: string[] };
    },
  >(job: T): T {
    return {
      ...job,
      vacancyArtworkUrl: this.imageStorage.resolvePublicUrl(job.vacancyArtworkUrl),
      company: this.imageStorage.withPublicUrls(job.company),
    };
  }

  async search(query: JobQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      status: JobStatus.PUBLISHED,
      ...(query.q && {
        OR: [
          { title: { contains: query.q, mode: 'insensitive' } },
          { description: { contains: query.q, mode: 'insensitive' } },
          { keywords: { hasSome: [query.q] } },
        ],
      }),
      ...(query.location && {
        OR: [
          { location: { contains: query.location, mode: 'insensitive' } },
          { city: { contains: query.location, mode: 'insensitive' } },
        ],
      }),
      ...(query.employmentType && { employmentType: query.employmentType }),
      ...(query.experienceLevel && { experienceLevel: query.experienceLevel }),
      ...(query.category?.length && {
        OR: query.category.map((category) => ({
          category: { equals: category, mode: 'insensitive' as const },
        })),
      }),
      ...(query.city?.length && {
        OR: query.city.map((city) => ({
          city: { equals: city, mode: 'insensitive' as const },
        })),
      }),
      ...(query.workArrangement && { workArrangement: query.workArrangement }),
      ...(query.educationRequirement && {
        educationRequirement: query.educationRequirement,
      }),
      ...(query.age != null && {
        AND: [
          { OR: [{ ageMin: null }, { ageMin: { lte: query.age } }] },
          { OR: [{ ageMax: null }, { ageMax: { gte: query.age } }] },
        ],
      }),
      ...(query.salaryMin && { salaryMax: { gte: query.salaryMin } }),
      ...(query.salaryMax && { salaryMin: { lte: query.salaryMax } }),
      ...(query.featured && { isFeatured: true }),
    };

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      items: items.map((job) => this.mapJobForPublic(job)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async suggest(query: string, limit = 8): Promise<JobSearchSuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const jobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.PUBLISHED,
        OR: [
          { title: { contains: trimmed, mode: 'insensitive' } },
          { category: { contains: trimmed, mode: 'insensitive' } },
          { city: { contains: trimmed, mode: 'insensitive' } },
          { keywords: { has: trimmed.toLowerCase() } },
        ],
      },
      select: { title: true, category: true, city: true, keywords: true },
      take: 40,
      orderBy: { publishedAt: 'desc' },
    });

    const seen = new Set<string>();
    const candidates: JobSearchSuggestion[] = [];

    const add = (text: string | null | undefined, type: JobSearchSuggestion['type']) => {
      const value = text?.trim();
      if (!value || seen.has(value.toLowerCase())) return;
      const score = similarityScore(trimmed, value);
      if (score < 0.35) return;
      seen.add(value.toLowerCase());
      candidates.push({
        text: value,
        type,
        score,
        matchType: matchReason(trimmed, value),
      });
    };

    for (const job of jobs) {
      add(job.title, 'title');
      add(job.category, 'category');
      add(job.city, 'city');
      for (const keyword of job.keywords) {
        if (keyword.toLowerCase().includes(trimmed.toLowerCase())) {
          add(keyword, 'keyword');
        }
      }
    }

    return candidates
      .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text))
      .slice(0, limit);
  }

  async findBySlug(slug: string) {
    const job = await this.prisma.job.findFirst({
      where: { slug, status: JobStatus.PUBLISHED },
      include: { company: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    await this.prisma.job.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    });

    return this.mapJobForPublic({ ...job, viewCount: job.viewCount + 1 });
  }

  async create(userId: string, dto: CreateJobDto, userRole?: UserRole) {
    assertValidApplicationDeadline(dto.applicationDeadline);

    if (userRole === UserRole.EMPLOYER) {
      await this.verification.assertRecruiterCanPostJobs(userId);
    }

    const company = await this.companiesService.resolveForJob(
      userId,
      {
        companyId: dto.companyId,
      },
      userRole,
    );

    const bodyText = [
      dto.title,
      dto.description,
      dto.responsibilities,
      dto.requirements,
      ...(dto.requiredSkills ?? []),
    ].join(' ');
    const isScam = detectScamContent(bodyText);

    let slug = buildJobSlug(dto, company.slug, Date.now().toString(36));
    if (await this.prisma.job.findUnique({ where: { slug } })) {
      slug = uniqueSlug(slug, Date.now().toString(36));
    }

    const status = isScam
      ? JobStatus.PENDING_REVIEW
      : dto.publish
        ? JobStatus.PENDING_REVIEW
        : JobStatus.DRAFT;

    const location =
      dto.location?.trim() ||
      [dto.city, dto.workArrangement].filter(Boolean).join(' • ') ||
      undefined;

    return this.prisma.job.create({
      data: {
        companyId: company.id,
        title: dto.title.trim(),
        slug,
        description: dto.description.trim(),
        responsibilities: dto.responsibilities?.trim() || null,
        requirements: dto.requirements?.trim() || null,
        location,
        city: dto.city?.trim() || null,
        salaryMin: dto.salaryType === 'Negotiable' ? null : dto.salaryMin,
        salaryMax: dto.salaryType === 'Negotiable' ? null : dto.salaryMax,
        salaryType: dto.salaryType,
        salaryCurrency: dto.salaryCurrency ?? 'LKR',
        employmentType: dto.employmentType,
        workArrangement: dto.workArrangement,
        experienceLevel: dto.experienceLevel,
        educationRequirement: dto.educationRequirement,
        ageMin: dto.ageMin ?? null,
        ageMax: dto.ageMax ?? null,
        industry: dto.sector ?? null,
        category: dto.category,
        sector: dto.sector ?? null,
        positionsCount: dto.positionsCount,
        requiredSkills: dto.requiredSkills ?? [],
        niceToHaveSkills: dto.niceToHaveSkills ?? [],
        keywords: buildJobKeywords(dto, company.name),
        recruiterRole: dto.recruiterRole,
        requestedCompanyName: dto.requestedCompanyName?.trim() || null,
        applicationDeadline: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : null,
        applyViaEmail: dto.applyViaEmail ?? false,
        applyViaExternalLink: dto.applyViaExternalLink ?? false,
        applyViaWalkIn: dto.applyViaWalkIn ?? false,
        applyViaOneClick: dto.applyViaOneClick ?? true,
        applicationEmail: dto.applicationEmail,
        applicationExternalUrl: dto.applicationExternalUrl,
        walkInDetails: dto.walkInDetails,
        jobDocumentUrl: dto.jobDocumentUrl,
        vacancyArtworkUrl: dto.vacancyArtworkUrl,
        jobSourceType: dto.jobSourceType?.trim() || 'DIRECT_EMPLOYER',
        verificationLevel: dto.verificationLevel?.trim() || null,
        status,
        publishedAt: null,
        expiresAt: dto.applicationDeadline
          ? new Date(dto.applicationDeadline)
          : null,
      },
      include: { company: true },
    });
  }

  async listPending() {
    return this.prisma.job.findMany({
      where: { status: JobStatus.PENDING_REVIEW },
      include: { company: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  private buildAdminJobsWhere(filters?: {
    status?: JobStatus;
    q?: string;
    source?: string;
  }) {
    const where: {
      status?: JobStatus;
      jobSourceType?: string;
      OR?: Array<Record<string, unknown>>;
    } = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const source = filters?.source?.trim();
    if (source && source !== 'all') {
      where.jobSourceType = source;
    }

    const q = filters?.q?.trim();
    if (q) {
      const or: Array<Record<string, unknown>> = [
        { title: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { company: { name: { contains: q, mode: 'insensitive' } } },
      ];
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q)) {
        or.push({ id: q });
      }
      where.OR = or;
    }

    return where;
  }

  async adminJobStats() {
    const [total, pending, published] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: JobStatus.PENDING_REVIEW } }),
      this.prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
    ]);
    return { total, pending, published };
  }

  async listForAdmin(filters?: {
    status?: JobStatus;
    q?: string;
    source?: string;
    page?: number;
    limit?: number;
  }) {
    const where = this.buildAdminJobsWhere(filters);
    const page = Math.max(filters?.page ?? 1, 1);
    const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const include = {
      company: true,
      _count: { select: { applications: true } },
      reviewedBy: {
        select: {
          id: true,
          email: true,
          adminProfile: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    } as const;

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: total > 0 ? Math.ceil(total / limit) : 1,
    };
  }

  async listGovernmentJobs() {
    return this.prisma.job.findMany({
      where: { jobSourceType: 'GOVERNMENT' },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdForModeration(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async updateForAdmin(id: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    if (dto.applicationDeadline) {
      assertValidApplicationDeadline(dto.applicationDeadline);
    }

    const title = dto.title?.trim() ?? job.title;
    const description = dto.description?.trim() ?? job.description;
    const city = dto.city !== undefined ? dto.city.trim() || null : job.city;
    const workArrangement =
      dto.workArrangement !== undefined ? dto.workArrangement : job.workArrangement;
    const salaryType = dto.salaryType !== undefined ? dto.salaryType : job.salaryType;

    const location =
      dto.location !== undefined
        ? dto.location.trim() || null
        : dto.city !== undefined || dto.workArrangement !== undefined
          ? [city, workArrangement].filter(Boolean).join(' • ') || job.location
          : job.location;

    const keywordDto: CreateJobDto = {
      title,
      description,
      responsibilities:
        dto.responsibilities !== undefined
          ? dto.responsibilities
          : job.responsibilities ?? undefined,
      requirements:
        dto.requirements !== undefined ? dto.requirements : job.requirements ?? undefined,
      category: dto.category !== undefined ? dto.category : job.category ?? undefined,
      city: city ?? undefined,
      employmentType:
        dto.employmentType !== undefined
          ? dto.employmentType
          : job.employmentType ?? undefined,
      workArrangement: workArrangement ?? undefined,
      experienceLevel:
        dto.experienceLevel !== undefined
          ? dto.experienceLevel
          : job.experienceLevel ?? undefined,
      ageMin: job.ageMin ?? undefined,
      ageMax: job.ageMax ?? undefined,
      requiredSkills: job.requiredSkills,
      niceToHaveSkills: job.niceToHaveSkills,
    };

    return this.prisma.job.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title }),
        ...(dto.description !== undefined && { description }),
        ...(dto.responsibilities !== undefined && {
          responsibilities: dto.responsibilities.trim() || null,
        }),
        ...(dto.requirements !== undefined && {
          requirements: dto.requirements.trim() || null,
        }),
        ...(dto.category !== undefined && { category: dto.category.trim() || null }),
        ...(dto.employmentType !== undefined && { employmentType: dto.employmentType }),
        ...(dto.workArrangement !== undefined && { workArrangement: dto.workArrangement }),
        ...(dto.experienceLevel !== undefined && { experienceLevel: dto.experienceLevel }),
        ...(dto.educationRequirement !== undefined && {
          educationRequirement: dto.educationRequirement,
        }),
        ...(dto.city !== undefined && { city }),
        ...(dto.location !== undefined ||
        dto.city !== undefined ||
        dto.workArrangement !== undefined
          ? { location }
          : {}),
        ...(dto.salaryType !== undefined && { salaryType: dto.salaryType }),
        ...(dto.salaryCurrency !== undefined && { salaryCurrency: dto.salaryCurrency }),
        ...(dto.salaryType !== undefined || dto.salaryMin !== undefined || dto.salaryMax !== undefined
          ? {
              salaryMin:
                (dto.salaryType ?? salaryType) === 'Negotiable'
                  ? null
                  : dto.salaryMin !== undefined
                    ? dto.salaryMin
                    : job.salaryMin,
              salaryMax:
                (dto.salaryType ?? salaryType) === 'Negotiable'
                  ? null
                  : dto.salaryMax !== undefined
                    ? dto.salaryMax
                    : job.salaryMax,
            }
          : {}),
        ...(dto.applicationDeadline !== undefined && {
          applicationDeadline: dto.applicationDeadline
            ? new Date(dto.applicationDeadline)
            : null,
          expiresAt: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
        }),
        keywords: buildJobKeywords(keywordDto, job.company.name),
      },
      include: { company: true },
    });
  }

  async moderate(
    jobId: string,
    action: 'approve' | 'reject',
    reviewerId?: string,
  ) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const reviewedAt = new Date();
    const reviewMeta = reviewerId
      ? { reviewedById: reviewerId, reviewedAt }
      : { reviewedAt };

    if (action === 'approve') {
      return this.prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.PUBLISHED,
          publishedAt: new Date(),
          ...reviewMeta,
        },
        include: {
          company: true,
          reviewedBy: {
            select: {
              id: true,
              email: true,
              adminProfile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.REJECTED,
        ...reviewMeta,
      },
      include: {
        company: true,
        reviewedBy: {
          select: {
            id: true,
            email: true,
            adminProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async listForEmployer(userId: string) {
    const links = await this.prisma.employerUser.findMany({
      where: { userId },
      select: { companyId: true },
    });
    const companyIds = links.map((l) => l.companyId);
    if (!companyIds.length) return [];

    return this.prisma.job.findMany({
      where: { companyId: { in: companyIds } },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listCategories() {
    const [categories, counts] = await Promise.all([
      this.prisma.jobCategory.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          sortOrder: true,
        },
      }),
      this.buildCategoryJobCounts(),
    ]);

    return categories.map((category) => {
      const key = counts.normalizeKey(category.name);
      return {
        ...category,
        totalJobs: counts.totalByCategory.get(key) ?? 0,
      };
    });
  }

  private async buildCategoryJobCounts() {
    const [totalGroups, activeGroups] = await Promise.all([
      this.prisma.job.groupBy({
        by: ['category'],
        _count: { _all: true },
        where: { category: { not: null } },
      }),
      this.prisma.job.groupBy({
        by: ['category'],
        _count: { _all: true },
        where: {
          category: { not: null },
          status: JobStatus.PUBLISHED,
        },
      }),
    ]);

    const normalizeKey = (value: string | null) => value?.trim().toLowerCase() ?? '';

    const totalByCategory = new Map<string, number>();
    for (const row of totalGroups) {
      const key = normalizeKey(row.category);
      if (!key) continue;
      totalByCategory.set(key, row._count._all);
    }

    const activeByCategory = new Map<string, number>();
    for (const row of activeGroups) {
      const key = normalizeKey(row.category);
      if (!key) continue;
      activeByCategory.set(key, row._count._all);
    }

    return { totalByCategory, activeByCategory, normalizeKey };
  }

  async listCategoriesForAdmin() {
    const [categories, counts] = await Promise.all([
      this.prisma.jobCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.buildCategoryJobCounts(),
    ]);

    return categories.map((category) => {
      const key = counts.normalizeKey(category.name);
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        active: category.active,
        totalJobs: counts.totalByCategory.get(key) ?? 0,
        activeJobs: counts.activeByCategory.get(key) ?? 0,
        updatedAt: category.updatedAt,
      };
    });
  }

  async createCategory(dto: CreateJobCategoryDto) {
    const name = dto.name.trim();
    const slug = slugify(name);
    if (!slug) {
      throw new BadRequestException('Category name is invalid.');
    }

    const existing = await this.prisma.jobCategory.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug },
        ],
      },
    });
    if (existing) {
      throw new ConflictException('A category with this name already exists.');
    }

    const maxSort = await this.prisma.jobCategory.aggregate({
      _max: { sortOrder: true },
    });

    return this.prisma.jobCategory.create({
      data: {
        name,
        slug,
        description: dto.description?.trim() || null,
        icon: dto.icon?.trim() || 'work',
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        active: true,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateJobCategoryDto) {
    const category = await this.prisma.jobCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    const data: Prisma.JobCategoryUpdateInput = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const slug = slugify(name);
      if (!slug) {
        throw new BadRequestException('Category name is invalid.');
      }

      const duplicate = await this.prisma.jobCategory.findFirst({
        where: {
          id: { not: id },
          OR: [
            { name: { equals: name, mode: 'insensitive' } },
            { slug },
          ],
        },
      });
      if (duplicate) {
        throw new ConflictException('A category with this name already exists.');
      }

      data.name = name;
      data.slug = slug;
    }

    if (dto.description !== undefined) {
      data.description = dto.description.trim() || null;
    }
    if (dto.icon !== undefined) {
      data.icon = dto.icon.trim() || 'work';
    }
    if (dto.active !== undefined) {
      data.active = dto.active;
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    return this.prisma.jobCategory.update({
      where: { id },
      data,
    });
  }

  async deleteForAdmin(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.jobCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    const linkedJobs = await this.prisma.job.count({
      where: {
        category: { equals: category.name, mode: 'insensitive' },
      },
    });
    if (linkedJobs > 0) {
      throw new ConflictException(
        'Cannot delete a category that is assigned to existing job listings.',
      );
    }

    await this.prisma.jobCategory.delete({ where: { id } });
    return { deleted: true };
  }
}
