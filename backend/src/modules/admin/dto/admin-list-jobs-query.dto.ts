import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

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

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
