import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { ImageStorageService } from '../../common/storage/image-storage.service';
import { PrismaService } from '../../prisma/prisma.service';

const JOB_INCLUDE = {
  company: true,
  governmentOrganization: {
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
  },
} as const;

@Injectable()
export class SavedJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private mapGovernmentOrganization<
    T extends { logoUrl?: string | null; parent?: Record<string, unknown> | null },
  >(org: T | null): T | null {
    if (!org) return org;
    return {
      ...org,
      logoUrl: this.imageStorage.resolvePublicUrl(org.logoUrl),
      ...(org.parent
        ? {
            parent: {
              ...org.parent,
              logoUrl: this.imageStorage.resolvePublicUrl(
                org.parent.logoUrl as string | null | undefined,
              ),
            },
          }
        : {}),
    };
  }

  private mapJob<
    T extends {
      jobDocumentUrl?: string | null;
      vacancyArtworkUrl?: string | null;
      company: { logoUrl?: string | null; lifeAtCompanyImages?: string[] };
      governmentOrganization?: {
        logoUrl?: string | null;
        parent?: Record<string, unknown> | null;
      } | null;
    },
  >(job: T): T {
    return {
      ...job,
      jobDocumentUrl: this.imageStorage.resolvePublicUrl(job.jobDocumentUrl),
      vacancyArtworkUrl: this.imageStorage.resolvePublicUrl(job.vacancyArtworkUrl),
      company: this.imageStorage.withPublicUrls(job.company),
      ...(job.governmentOrganization !== undefined
        ? {
            governmentOrganization: this.mapGovernmentOrganization(
              job.governmentOrganization,
            ),
          }
        : {}),
    };
  }

  async listIds(userId: string) {
    const rows = await this.prisma.savedJob.findMany({
      where: { userId },
      select: { jobId: true },
    });
    return rows.map((row) => row.jobId);
  }

  async listForSeeker(userId: string) {
    const rows = await this.prisma.savedJob.findMany({
      where: { userId },
      include: { job: { include: JOB_INCLUDE } },
      orderBy: { createdAt: 'desc' },
    });

    return rows
      .filter((row) => row.job.status === JobStatus.PUBLISHED)
      .map((row) => ({
        id: row.id,
        savedAt: row.createdAt.toISOString(),
        job: this.mapJob(row.job),
      }));
  }

  async save(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job not available');
    }

    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) throw new ConflictException('Job already saved');

    const saved = await this.prisma.savedJob.create({
      data: { userId, jobId },
      include: { job: { include: JOB_INCLUDE } },
    });

    return {
      id: saved.id,
      savedAt: saved.createdAt.toISOString(),
      job: this.mapJob(saved.job),
    };
  }

  async remove(userId: string, jobId: string) {
    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (!existing) throw new NotFoundException('Saved job not found');

    await this.prisma.savedJob.delete({
      where: { userId_jobId: { userId, jobId } },
    });

    return { removed: true };
  }
}
