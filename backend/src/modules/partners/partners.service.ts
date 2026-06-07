import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeWebsite(website?: string | null) {
    const trimmed = website?.trim();
    return trimmed || null;
  }

  async listForAdmin() {
    return this.prisma.platformPartner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async listPublic() {
    return this.prisma.platformPartner.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        screenText: true,
        website: true,
        sortOrder: true,
      },
    });
  }

  async create(dto: CreatePartnerDto) {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Partner name is required.');
    }

    const maxSort = await this.prisma.platformPartner.aggregate({
      _max: { sortOrder: true },
    });

    return this.prisma.platformPartner.create({
      data: {
        name,
        screenText: dto.screenText?.trim() || null,
        website: this.normalizeWebsite(dto.website),
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        active: true,
      },
    });
  }

  async update(id: string, dto: UpdatePartnerDto) {
    const partner = await this.prisma.platformPartner.findUnique({ where: { id } });
    if (!partner) {
      throw new NotFoundException('Partner not found.');
    }

    const data: Prisma.PlatformPartnerUpdateInput = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException('Partner name is required.');
      }
      data.name = name;
    }

    if (dto.screenText !== undefined) {
      data.screenText = dto.screenText.trim() || null;
    }

    if (dto.website !== undefined) {
      data.website = this.normalizeWebsite(dto.website);
    }

    if (dto.active !== undefined) {
      data.active = dto.active;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    return this.prisma.platformPartner.update({
      where: { id },
      data,
    });
  }
}
