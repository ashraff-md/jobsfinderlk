import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerAspectRatio } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BannerSlideDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  href!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  alt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  active?: boolean;
}

export class UpdateBannerSlotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ type: [BannerSlideDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerSlideDto)
  slides?: BannerSlideDto[];
}

export class CreateSponsoredAdDto {
  @ApiProperty()
  @IsUUID()
  jobId!: string;
}

export class ReorderSponsoredAdsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  jobIds!: string[];
}

export class PatchSponsoredAdDto {
  @ApiProperty()
  @IsBoolean()
  active!: boolean;
}

export class ListBannerSlotsQueryDto {
  @ApiPropertyOptional({ enum: BannerAspectRatio })
  @IsOptional()
  @IsEnum(BannerAspectRatio)
  aspectRatio?: BannerAspectRatio;
}
