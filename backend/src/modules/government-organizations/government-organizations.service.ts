import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import {
  matchReason,
  normalizeCompanyName,
  similarityScore,
} from '../../common/utils/company-match.util';
import { slugify, uniqueSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGovernmentOrganizationDto } from './dto/create-government-organization.dto';
import { UpdateGovernmentOrganizationDto } from './dto/update-government-organization.dto';
import { GOVERNMENT_ORG_INCLUDE } from './government-organization.constants';

export type GovernmentOrganizationSuggestion = {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  shortName?: string | null;
  district?: string | null;
  province?: string | null;
  logoUrl?: string | null;
  parent?: {
    id: string;
    name: string;
    organizationType: string;
    shortName?: string | null;
  } | null;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'phonetic';
};

@Injectable()
export class GovernmentOrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private mapEntity<
    T extends {
      logoUrl?: string | null;
      parent?: Record<string, unknown> | null;
    },
  >(entity: T): T {
    return {
      ...entity,
      logoUrl: this.imageStorage.resolvePublicUrl(entity.logoUrl),
      ...(entity.parent
        ? {
            parent: {
              ...entity.parent,
              logoUrl: this.imageStorage.resolvePublicUrl(
                entity.parent.logoUrl as string | null | undefined,
              ),
            },
          }
        : {}),
    };
  }

  async findAll(search?: string) {
    const where: Prisma.GovernmentOrganizationWhereInput = search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim(), mode: 'insensitive' } },
            { shortName: { contains: search.trim(), mode: 'insensitive' } },
          ],
        }
      : {};

    const items = await this.prisma.governmentOrganization.findMany({
      where,
      include: GOVERNMENT_ORG_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return items.map((item) => this.mapEntity(item));
  }

  async suggest(query: string, limit = 10): Promise<GovernmentOrganizationSuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const candidates = await this.prisma.governmentOrganization.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { shortName: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            organizationType: true,
            shortName: true,
          },
        },
      },
      take: 50,
      orderBy: { name: 'asc' },
    });

    const scored = candidates
      .map((org) => {
        const nameScore = similarityScore(trimmed, org.name);
        const shortScore = org.shortName
          ? similarityScore(trimmed, org.shortName)
          : 0;
        const score = Math.max(nameScore, shortScore);
        return {
          ...org,
          score,
          matchType: matchReason(trimmed, org.name),
        };
      })
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, limit);

    return scored.map(
      (org): GovernmentOrganizationSuggestion => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        organizationType: org.organizationType,
        shortName: org.shortName,
        district: org.district,
        province: org.province,
        logoUrl: this.imageStorage.resolvePublicUrl(org.logoUrl),
        parent: org.parent,
        score: org.score,
        matchType:
          org.matchType === 'domain' ? 'fuzzy' : org.matchType,
      }),
    );
  }

  async findSimilar(name: string) {
    const trimmed = name.trim();
    if (trimmed.length < 2) return [];

    const candidates = await this.prisma.governmentOrganization.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            organizationType: true,
            shortName: true,
          },
        },
      },
      take: 200,
      orderBy: { name: 'asc' },
    });

    return candidates
      .map((org) => ({
        ...org,
        score: similarityScore(trimmed, org.name),
        matchType: matchReason(trimmed, org.name),
      }))
      .filter((org) => org.score >= 0.75)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((org) => this.mapEntity(org));
  }

  async findById(id: string) {
    const org = await this.prisma.governmentOrganization.findUnique({
      where: { id },
      include: GOVERNMENT_ORG_INCLUDE,
    });
    if (!org) throw new NotFoundException('Government organization not found');
    return this.mapEntity(org);
  }

  async findByIdOrThrow(id: string) {
    const org = await this.prisma.governmentOrganization.findUnique({
      where: { id },
    });
    if (!org) {
      throw new BadRequestException('Selected government organization was not found.');
    }
    return org;
  }

  private async assertUniqueName(name: string, excludeId?: string) {
    const normalized = normalizeCompanyName(name);
    const existing = await this.prisma.governmentOrganization.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: { id: true, name: true },
    });

    const duplicate = existing.find(
      (org) => normalizeCompanyName(org.name) === normalized,
    );
    if (duplicate) {
      throw new ConflictException(
        `A government organization named "${duplicate.name}" already exists.`,
      );
    }
  }

  private resolveParentOrganizationId(value?: string | null): string | null {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed || null;
  }

  private async assertValidParent(parentOrganizationId: string | undefined, selfId?: string) {
    if (!parentOrganizationId) return;

    if (selfId && parentOrganizationId === selfId) {
      throw new BadRequestException('An organization cannot be its own parent.');
    }

    const parent = await this.prisma.governmentOrganization.findUnique({
      where: { id: parentOrganizationId },
    });
    if (!parent) {
      throw new BadRequestException('Selected parent organization was not found.');
    }
  }

  private async buildUniqueSlug(name: string) {
    const base = slugify(name);
    let slug = base;
    let attempt = 0;

    while (await this.prisma.governmentOrganization.findUnique({ where: { slug } })) {
      attempt += 1;
      slug = uniqueSlug(base, `${Date.now()}-${attempt}`);
    }

    return slug;
  }

  async createForAdmin(userId: string, dto: CreateGovernmentOrganizationDto) {
    const name = dto.name.trim();
    const parentOrganizationId = this.resolveParentOrganizationId(
      dto.parentOrganizationId,
    );
    await this.assertUniqueName(name);
    await this.assertValidParent(parentOrganizationId ?? undefined);

    const logoPath = await this.imageStorage.saveGovernmentOrgLogo(dto.logoUrl);

    const org = await this.prisma.governmentOrganization.create({
      data: {
        name,
        slug: await this.buildUniqueSlug(name),
        organizationType: dto.organizationType,
        parentOrganizationId,
        shortName: dto.shortName?.trim() || null,
        description: dto.description?.trim() || null,
        website: dto.website?.trim() || null,
        email: dto.email?.trim() || null,
        contactNumber: dto.contactNumber?.trim() || null,
        headOfficeAddress: dto.headOfficeAddress?.trim() || null,
        district: dto.district?.trim() || null,
        province: dto.province?.trim() || null,
        logoUrl: logoPath,
        createdById: userId,
      },
      include: GOVERNMENT_ORG_INCLUDE,
    });

    return this.mapEntity(org);
  }

  async updateForAdmin(id: string, dto: UpdateGovernmentOrganizationDto) {
    const existing = await this.prisma.governmentOrganization.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Government organization not found');

    const parentOrganizationId =
      dto.parentOrganizationId !== undefined
        ? this.resolveParentOrganizationId(dto.parentOrganizationId)
        : undefined;

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name.length < 2) {
        throw new BadRequestException('Organization name must be at least 2 characters.');
      }
      await this.assertUniqueName(name, id);
    }

    if (dto.parentOrganizationId !== undefined) {
      await this.assertValidParent(parentOrganizationId ?? undefined, id);
    }

    let logoUrl: string | null | undefined;
    if (dto.logoUrl !== undefined) {
      logoUrl = await this.imageStorage.saveOrKeepGovernmentOrgLogo(dto.logoUrl);
    }

    const org = await this.prisma.governmentOrganization.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.organizationType !== undefined && {
          organizationType: dto.organizationType,
        }),
        ...(parentOrganizationId !== undefined && { parentOrganizationId }),
        ...(dto.shortName !== undefined && {
          shortName: dto.shortName.trim() || null,
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim() || null,
        }),
        ...(dto.website !== undefined && { website: dto.website.trim() || null }),
        ...(dto.email !== undefined && { email: dto.email.trim() || null }),
        ...(dto.contactNumber !== undefined && {
          contactNumber: dto.contactNumber.trim() || null,
        }),
        ...(dto.headOfficeAddress !== undefined && {
          headOfficeAddress: dto.headOfficeAddress.trim() || null,
        }),
        ...(dto.district !== undefined && { district: dto.district.trim() || null }),
        ...(dto.province !== undefined && { province: dto.province.trim() || null }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
      include: GOVERNMENT_ORG_INCLUDE,
    });

    return this.mapEntity(org);
  }
}
