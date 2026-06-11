import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminListTalentQueryDto {
  @ApiPropertyOptional({
    description: 'COMPLETE, ACTIVE, VERIFIED, INCOMPLETE, or omit for all',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search name, email, or headline' })
  @IsOptional()
  @IsString()
  q?: string;
}
