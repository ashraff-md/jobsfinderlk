import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminListRecruitersQueryDto {
  @ApiPropertyOptional({
    description: 'VERIFIED, PENDING, UNLINKED, or omit for all',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search name, email, or company' })
  @IsOptional()
  @IsString()
  q?: string;
}
