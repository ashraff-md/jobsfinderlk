import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AdminListJobsQueryDto {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Search title, company, or location' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'GOVERNMENT', description: 'GOVERNMENT, DIRECT_EMPLOYER, or omit for all' })
  @IsOptional()
  @IsString()
  source?: string;
}
