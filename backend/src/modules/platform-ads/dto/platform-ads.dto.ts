import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerAspectRatio } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const PROMOTION_PERIOD_DAYS = [3, 5, 7, 14, 30, 60] as const;
export const BANNER_PROMOTION_PERIOD_DAYS = [7, 14, 30, 60] as const;
export type PromotionPeriodDays = (typeof PROMOTION_PERIOD_DAYS)[number];

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ enum: PROMOTION_PERIOD_DAYS })
  @IsOptional()
  @IsInt()
  @IsIn(PROMOTION_PERIOD_DAYS)
  promotionDays?: PromotionPeriodDays;

  @ApiPropertyOptional({ type: [BannerSlideDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerSlideDto)
  slides?: BannerSlideDto[];
}

export class CreateBannerCampaignDto {
  @ApiProperty({ enum: BannerAspectRatio })
  @IsEnum(BannerAspectRatio)
  aspectRatio!: BannerAspectRatio;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  href!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  imageUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @ApiProperty({ description: 'Promotion start date (YYYY-MM-DD)' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ enum: PROMOTION_PERIOD_DAYS })
  @Type(() => Number)
  @IsInt()
  @IsIn(PROMOTION_PERIOD_DAYS)
  promotionDays!: PromotionPeriodDays;
}

export class UpdateBannerCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  href?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ enum: PROMOTION_PERIOD_DAYS })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(PROMOTION_PERIOD_DAYS)
  promotionDays?: PromotionPeriodDays;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateSponsoredAdDto {
  @ApiProperty()
  @IsUUID()
  jobId!: string;

  @ApiProperty({ description: 'Promotion start date (YYYY-MM-DD)' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ enum: PROMOTION_PERIOD_DAYS })
  @IsInt()
  @IsIn(PROMOTION_PERIOD_DAYS)
  promotionDays!: PromotionPeriodDays;
}

export class UpdateSponsoredAdDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ enum: PROMOTION_PERIOD_DAYS })
  @IsOptional()
  @IsInt()
  @IsIn(PROMOTION_PERIOD_DAYS)
  promotionDays?: PromotionPeriodDays;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ReorderSponsoredAdsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  jobIds!: string[];
}

export class ListBannerSlotsQueryDto {
  @ApiPropertyOptional({ enum: BannerAspectRatio })
  @IsOptional()
  @IsEnum(BannerAspectRatio)
  aspectRatio?: BannerAspectRatio;
}

export class ListPublicSponsoredQueryDto {
  @ApiPropertyOptional({ default: 3, description: 'Jobs per batch (max 12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number;

  @ApiPropertyOptional({
    default: 0,
    description: 'Start index in the active sponsored list (wraps for rotation)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
