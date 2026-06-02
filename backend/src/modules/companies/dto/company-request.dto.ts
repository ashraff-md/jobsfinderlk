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

  @ApiProperty()
  @IsString()
  location!: string;

  @ApiProperty()
  @IsString()
  companyType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
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

export class MergeCompanyRequestDto {
  @ApiProperty()
  @IsString()
  companyId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
