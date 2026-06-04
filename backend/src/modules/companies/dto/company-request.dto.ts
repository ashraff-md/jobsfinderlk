import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  companyName!: string;

  @ApiProperty()
  @IsString()
  industry!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty()
  @IsString()
  companyType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description:
      'Company logo as base64 data URL; stored on disk under UPLOAD_ROOT, path saved in DB',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Life-at photos as base64 data URLs; stored on disk, paths saved in DB',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lifeAtCompanyImages?: string[];
}

export class RejectCompanyRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class UpdateCompanyRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lifeAtCompanyImages?: string[];
}

export class MergeCompanyRequestDto {
  @ApiProperty()
  @IsString()
  companyId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
