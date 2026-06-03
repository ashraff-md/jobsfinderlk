import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const items = (Array.isArray(value) ? value : [value])
    .map((item) => String(item).trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ description: 'Existing company UUID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Company name when requesting new company' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestedCompanyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recruiterRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  positionsCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workArrangement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: ['Fixed', 'Range', 'Negotiable'] })
  @IsOptional()
  @IsString()
  salaryType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ enum: ['LKR', 'USD'] })
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  educationRequirement?: string;

  @ApiPropertyOptional({ description: 'Minimum candidate age in years' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(16)
  ageMin?: number;

  @ApiPropertyOptional({ description: 'Maximum candidate age in years' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(16)
  ageMax?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niceToHaveSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  applyViaEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  applyViaExternalLink?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  applyViaWalkIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  applyViaOneClick?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  applicationEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationExternalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  walkInDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDocumentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vacancyArtworkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  publish?: boolean;

  @ApiPropertyOptional({ example: 'GOVERNMENT' })
  @IsOptional()
  @IsString()
  jobSourceType?: string;

  @ApiPropertyOptional({ example: 'GOVT_CERTIFIED' })
  @IsOptional()
  @IsString()
  verificationLevel?: string;
}

export class JobQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @ApiPropertyOptional({ type: [String], description: 'One or more categories' })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @ApiPropertyOptional({ type: [String], description: 'One or more districts' })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  city?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workArrangement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  educationRequirement?: string;

  @ApiPropertyOptional({
    description: 'Candidate age — returns jobs whose vacancy age range includes this age',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(16)
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaryMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'When true, only featured published jobs' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;
}
