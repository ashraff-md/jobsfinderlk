import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyJobDto, UpdateApplicationStatusDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: ApplyJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job || job.status !== JobStatus.PUBLISHED) {
      throw new NotFoundException('Job not available');
    }

    const existing = await this.prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId: dto.jobId } },
    });
    if (existing) throw new ConflictException('Already applied');

    return this.prisma.application.create({
      data: { userId, jobId: dto.jobId, status: 'submitted' },
      include: {
        job: { include: { company: true } },
      },
    });
  }

  async applyBySlug(userId: string, slug: string) {
    const job = await this.prisma.job.findFirst({
      where: { slug, status: JobStatus.PUBLISHED },
    });
    if (!job) throw new NotFoundException('Job not found');
    return this.apply(userId, { jobId: job.id });
  }

  async listForSeeker(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForJob(userId: string, jobId: string) {
    await this.assertEmployerOwnsJob(userId, jobId);
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            seekerProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    userId: string,
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException();

    await this.assertEmployerOwnsJob(userId, application.jobId);

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
      include: {
        user: { select: { id: true, email: true, seekerProfile: true } },
        job: true,
      },
    });
  }

  private async assertEmployerOwnsJob(userId: string, jobId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role === UserRole.ADMIN) return;

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    if (job.postedById) {
      if (job.postedById !== userId) {
        throw new ForbiddenException('Not authorized for this job');
      }
      return;
    }

    const link = await this.prisma.employerUser.findFirst({
      where: { userId, companyId: job.companyId },
    });
    if (!link) throw new ForbiddenException('Not authorized for this job');
  }
}
