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
} from './dto/company-request.dto';
import {
  sanitizeLifeAtCompanyImages,
  sanitizeLogoDataUrl,
} from '../../common/utils/image-data.util';

function formatCompanyLocation(address?: string, city?: string): string | null {
  const parts = [address?.trim(), city?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

@Injectable()
export class CompanyRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companiesService: CompaniesService,
  ) {}

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

    const pendingDuplicate = await this.prisma.companyRequest.findFirst({
      where: {
        companyName: { equals: dto.companyName.trim(), mode: 'insensitive' },
        status: CompanyRequestStatus.PENDING,
      },
    });
    if (pendingDuplicate) {
      throw new BadRequestException(
        'A pending request for this company name already exists.',
      );
    }

    return this.prisma.companyRequest.create({
      data: {
        companyName: dto.companyName.trim(),
        industry: dto.industry.trim(),
        website: dto.website?.trim() || null,
        emailDomain: dto.emailDomain?.trim().toLowerCase() || null,
        address: dto.address?.trim() || null,
        city: dto.city.trim(),
        location: formatCompanyLocation(dto.address, dto.city),
        companyType: dto.companyType,
        description: dto.description?.trim() || null,
        logoUrl: sanitizeLogoDataUrl(dto.logoUrl),
        lifeAtCompanyImages: sanitizeLifeAtCompanyImages(dto.lifeAtCompanyImages),
        requestedById: userId,
      },
      include: {
        requestedBy: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
      },
    });
  }

  async listMine(userId: string) {
    return this.prisma.companyRequest.findMany({
      where: { requestedById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        mergedInto: { select: { id: true, name: true, slug: true, verified: true } },
      },
    });
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
        ...request,
        similarCompanies: await this.companiesService.findSimilar({
          name: request.companyName,
          website: request.website,
          emailDomain: request.emailDomain,
        }),
      })),
    );
  }

  async approve(id: string) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Company request not found');
    if (request.status !== CompanyRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

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

    return this.prisma.companyRequest.update({
      where: { id },
      data: {
        status: CompanyRequestStatus.APPROVED,
        mergedIntoId: company.id,
      },
      include: {
        mergedInto: true,
        requestedBy: { select: { id: true, email: true } },
      },
    });
  }

  async merge(id: string, dto: MergeCompanyRequestDto) {
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

    return this.prisma.companyRequest.update({
      where: { id },
      data: {
        status: CompanyRequestStatus.MERGED,
        mergedIntoId: company.id,
        reviewNotes: dto.reviewNotes?.trim() || null,
      },
      include: {
        mergedInto: true,
        requestedBy: { select: { id: true, email: true } },
      },
    });
  }

  async reject(id: string, dto: RejectCompanyRequestDto) {
    const request = await this.prisma.companyRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Company request not found');
    if (request.status !== CompanyRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    return this.prisma.companyRequest.update({
      where: { id },
      data: {
        status: CompanyRequestStatus.REJECTED,
        reviewNotes: dto.reviewNotes?.trim() || null,
      },
      include: {
        requestedBy: { select: { id: true, email: true } },
      },
    });
  }
}
