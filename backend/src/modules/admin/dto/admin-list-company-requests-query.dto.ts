import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AdminListCompanyRequestsQueryDto {
  @ApiPropertyOptional({ enum: CompanyRequestStatus })
  @IsOptional()
  @IsEnum(CompanyRequestStatus)
  status?: CompanyRequestStatus;

  @ApiPropertyOptional({ description: 'Search company name, industry, email domain, or city' })
  @IsOptional()
  @IsString()
  q?: string;
}
