import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { GOVERNMENT_ORGANIZATION_TYPES } from '../government-organization.constants';

export class CreateGovernmentOrganizationDto {
  @ApiProperty({ example: 'Ministry of Education' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'Ministry' })
  @IsString()
  @IsIn([...GOVERNMENT_ORGANIZATION_TYPES])
  organizationType!: string;

  @ApiPropertyOptional({ example: 'uuid-of-parent-ministry', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  parentOrganizationId?: string;

  @ApiPropertyOptional({ example: 'MOE' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://www.moe.gov.lk' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'info@moe.gov.lk' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+94 11 278 4811' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headOfficeAddress?: string;

  @ApiPropertyOptional({ example: 'Colombo' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Western' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Base64 data URL for logo upload' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
