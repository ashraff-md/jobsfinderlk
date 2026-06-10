import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyRequestDto,
  MergeCompanyRequestDto,
  RejectCompanyRequestDto,
  UpdateCompanyRequestDto,
} from './dto/company-request.dto';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { reviewedByAdminSelect } from '../../common/utils/reviewed-by-admin.select';

function formatCompanyLocation(address?: string, city?: string): string | null {
  const parts = [address?.trim(), city?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

@Injectable()
export class CompanyRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private reviewMeta(reviewerId?: string) {
    const reviewedAt = new Date();
    return reviewerId
      ? { reviewedById: reviewerId, reviewedAt }
      : { reviewedAt };
  }

  private async markRecruiterReviewed(
    recruiterUserId: string,
    reviewerId?: string,
  ) {
    if (!reviewerId) return;
    await this.prisma.user.update({
      where: { id: recruiterUserId },
      data: this.reviewMeta(reviewerId),
    });
  }

  async create(userId: string, dto: CreateCompanyRequestDto) {
    const duplicates = await this.companiesService.findSimilar({
      name: dto.companyName,
      website: dto.website,
      emailDomain: dto.emailDomain,
    });

    const strongMatch = duplicates.find((item) => item.score >= 0.92);
    if (strongMatch) {
      throw new BadRequestException(
        `A similar company already exists: ${strongMatch.name}. Select it from the list or merge with admin help.`,
      );
    }

    const existingMine = await this.prisma.companyRequest.findFirst({
      where: {
        requestedById: userId,
        companyName: { equals: dto.companyName.trim(), mode: 'insensitive' },
        status: CompanyRequestStatus.PENDING,
      },
      include: {
        requestedBy: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
        placeholderCompany: true,
      },
    });
    if (existingMine) {
      return this.imageStorage.withPublicUrls(existingMine);
    }

    const pendingDuplicate = await this.prisma.companyRequest.findFirst({
      where: {
        companyName: { equals: dto.companyName.trim(), mode: 'insensitive' },
        status: CompanyRequestStatus.PENDING,
        requestedById: { not: userId },
      },
    });
    if (pendingDuplicate) {
      throw new BadRequestException(
        'A pending request for this company name already exists.',
      );
    }

    const logoPath = await this.imageStorage.saveCompanyLogo(dto.logoUrl);
    const lifeAtPaths = await this.imageStorage.saveLifeAtCompanyImages(
      dto.lifeAtCompanyImages,
    );
    const location = formatCompanyLocation(dto.address, dto.city);

    const placeholderCompany = await this.companiesService.createFromRequest(
      userId,
      {
        name: dto.companyName.trim(),
        website: dto.website?.trim() || undefined,
        description: dto.description?.trim() || undefined,
        logoUrl: logoPath ?? undefined,
        industry: dto.industry.trim(),
        address: dto.address?.trim() || undefined,
        city: dto.city.trim(),
        location: location ?? undefined,
        companyType: dto.companyType,
        emailDomain: dto.emailDomain?.trim().toLowerCase() || undefined,
        lifeAtCompanyImages: lifeAtPaths,
        verified: false,
      },
    );

    const created = await this.prisma.companyRequest.create({
      data: {
        companyName: dto.companyName.trim(),
        industry: dto.industry.trim(),
        website: dto.website?.trim() || null,
        emailDomain: dto.emailDomain?.trim().toLowerCase() || null,
        address: dto.address?.trim() || null,
        city: dto.city.trim(),
        location,
        companyType: dto.companyType,
        description: dto.description?.trim() || null,
        logoUrl: logoPath,
        lifeAtCompanyImages: lifeAtPaths,
        requestedById: userId,
        placeholderCompanyId: placeholderCompany.id,
      },
      include: {
        requestedBy: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
        placeholderCompany: true,
      },
    });

    return this.imageStorage.withPublicUrls(created);
  }

  async listMine(userId: string) {
    const rows = await this.prisma.companyRequest.findMany({
      where: { requestedById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        mergedInto: { select: { id: true, name: true, slug: true, verified: true } },
      },
    });
    return rows.map((row) => this.imageStorage.withPublicUrls(row));
  }

  async findByIdForAdmin(id: string) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
      include: {
        requestedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            employerUsers: {
              include: { company: { select: { id: true, name: true, verified: true } } },
            },
          },
        },
        mergedInto: { select: { id: true, name: true, slug: true, verified: true } },
        reviewedBy: reviewedByAdminSelect,
      },
    });
    if (!request) throw new NotFoundException('Company request not found');

    return {
      ...this.imageStorage.withPublicUrls(request),
      similarCompanies: await this.companiesService.findSimilar({
        name: request.companyName,
        website: request.website,
        emailDomain: request.emailDomain,
      }),
    };
  }

  async listForAdmin(filters?: { status?: CompanyRequestStatus; q?: string }) {
    const q = filters?.q?.trim();
    const requests = await this.prisma.companyRequest.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(q
          ? {
              OR: [
                { companyName: { contains: q, mode: 'insensitive' } },
                { industry: { contains: q, mode: 'insensitive' } },
                { emailDomain: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: {
          select: { id: true, email: true },
        },
        mergedInto: { select: { id: true, name: true, slug: true, verified: true } },
        reviewedBy: reviewedByAdminSelect,
      },
    });

    return requests.map((request) => this.imageStorage.withPublicUrls(request));
  }

  async listPending() {
    const requests = await this.prisma.companyRequest.findMany({
      where: { status: CompanyRequestStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: {
        requestedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            employerUsers: {
              include: { company: { select: { id: true, name: true, verified: true } } },
            },
          },
        },
        mergedInto: { select: { id: true, name: true, slug: true } },
      },
    });

    return Promise.all(
      requests.map(async (request) => ({
        ...this.imageStorage.withPublicUrls(request),
        similarCompanies: await this.companiesService.findSimilar({
          name: request.companyName,
          website: request.website,
          emailDomain: request.emailDomain,
        }),
      })),
    );
  }

  async updateForAdmin(id: string, dto: UpdateCompanyRequestDto) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Company request not found');
    if (
      request.status !== CompanyRequestStatus.PENDING &&
      request.status !== CompanyRequestStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Only pending or approved requests can be edited',
      );
    }

    const address =
      dto.address !== undefined ? dto.address?.trim() || null : request.address;
    const city =
      dto.city !== undefined ? dto.city?.trim() || null : request.city;

    const data: Parameters<typeof this.prisma.companyRequest.update>[0]['data'] =
      {};

    if (dto.companyName !== undefined) {
      data.companyName = dto.companyName.trim();
    }
    if (dto.industry !== undefined) {
      data.industry = dto.industry.trim() || null;
    }
    if (dto.website !== undefined) {
      data.website = dto.website?.trim() || null;
    }
    if (dto.emailDomain !== undefined) {
      data.emailDomain = dto.emailDomain?.trim().toLowerCase() || null;
    }
    if (dto.address !== undefined) {
      data.address = address;
    }
    if (dto.city !== undefined) {
      data.city = city;
    }
    if (dto.address !== undefined || dto.city !== undefined) {
      data.location = formatCompanyLocation(
        address ?? undefined,
        city ?? undefined,
      );
    }
    if (dto.companyType !== undefined) {
      data.companyType = dto.companyType?.trim() || null;
    }
    if (dto.description !== undefined) {
      data.description = dto.description?.trim() || null;
    }
    if (dto.logoUrl !== undefined) {
      data.logoUrl = await this.imageStorage.saveOrKeepCompanyLogo(dto.logoUrl);
    }
    if (dto.lifeAtCompanyImages !== undefined) {
      data.lifeAtCompanyImages =
        await this.imageStorage.saveOrKeepLifeAtCompanyImages(
          dto.lifeAtCompanyImages,
        );
    }

    if (Object.keys(data).length === 0) {
      return this.findByIdForAdmin(id);
    }

    await this.prisma.companyRequest.update({
      where: { id },
      data,
    });

    const companyId =
      request.status === CompanyRequestStatus.APPROVED
        ? request.mergedIntoId ?? request.placeholderCompanyId
        : request.status === CompanyRequestStatus.PENDING
          ? request.placeholderCompanyId
          : null;

    if (companyId) {
      const updated = await this.prisma.companyRequest.findUnique({
        where: { id },
      });
      if (updated) {
        await this.companiesService.syncFromApprovedRequest(companyId, updated);
      }
    }

    return this.findByIdForAdmin(id);
  }

  async approve(id: string, reviewerId?: string) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Company request not found');
    if (request.status !== CompanyRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    let companyId: string;
    if (request.placeholderCompanyId) {
      const company = await this.prisma.company.update({
        where: { id: request.placeholderCompanyId },
        data: {
          name: request.companyName,
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
      companyId = company.id;
      await this.companiesService.linkEmployerToCompany(
        request.requestedById,
        company.id,
      );
    } else {
      const company = await this.companiesService.createFromRequest(
        request.requestedById,
        {
          name: request.companyName,
          website: request.website ?? undefined,
          description: request.description ?? undefined,
          logoUrl: request.logoUrl ?? undefined,
          industry: request.industry ?? undefined,
          address: request.address ?? undefined,
          city: request.city ?? undefined,
          location: request.location ?? undefined,
          companyType: request.companyType ?? undefined,
          emailDomain: request.emailDomain ?? undefined,
          lifeAtCompanyImages: request.lifeAtCompanyImages,
          verified: true,
        },
      );
      companyId = company.id;
    }

    await this.markRecruiterReviewed(request.requestedById, reviewerId);

    const updated = await this.prisma.companyRequest.update({
      where: { id },
      data: {
        status: CompanyRequestStatus.APPROVED,
        mergedIntoId: companyId,
        ...this.reviewMeta(reviewerId),
      },
      include: {
        mergedInto: true,
        placeholderCompany: true,
        requestedBy: { select: { id: true, email: true } },
        reviewedBy: reviewedByAdminSelect,
      },
    });
    return {
      ...this.imageStorage.withPublicUrls(updated),
      mergedInto: updated.mergedInto
        ? this.imageStorage.withPublicUrls(updated.mergedInto)
        : null,
    };
  }

  async merge(id: string, dto: MergeCompanyRequestDto, reviewerId?: string) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Company request not found');
    if (request.status !== CompanyRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be merged');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('Target company not found');

    await this.companiesService.linkEmployerToCompany(
      request.requestedById,
      company.id,
    );

    if (request.placeholderCompanyId) {
      await this.prisma.job.updateMany({
        where: { companyId: request.placeholderCompanyId },
        data: { companyId: dto.companyId },
      });
      await this.prisma.employerUser.deleteMany({
        where: { companyId: request.placeholderCompanyId },
      });
      await this.prisma.company.delete({
        where: { id: request.placeholderCompanyId },
      });
    }

    await this.markRecruiterReviewed(request.requestedById, reviewerId);

    return this.prisma.companyRequest.update({
      where: { id },
      data: {
        status: CompanyRequestStatus.MERGED,
        mergedIntoId: company.id,
        reviewNotes: dto.reviewNotes?.trim() || null,
        ...this.reviewMeta(reviewerId),
      },
      include: {
        mergedInto: true,
        requestedBy: { select: { id: true, email: true } },
        reviewedBy: reviewedByAdminSelect,
      },
    });
  }

  async reject(id: string, dto: RejectCompanyRequestDto, reviewerId?: string) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Company request not found');
    if (request.status !== CompanyRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    await this.markRecruiterReviewed(request.requestedById, reviewerId);

    return this.prisma.companyRequest.update({
      where: { id },
      data: {
        status: CompanyRequestStatus.REJECTED,
        reviewNotes: dto.reviewNotes?.trim() || null,
        ...this.reviewMeta(reviewerId),
      },
      include: {
        requestedBy: { select: { id: true, email: true } },
        reviewedBy: reviewedByAdminSelect,
      },
    });
  }
}
