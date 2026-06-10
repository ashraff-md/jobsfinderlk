import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerAspectRatio } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PROMOTION_PERIOD_DAYS } from '../../platform-ads/dto/platform-ads.dto';

export class RecordEmployerAdCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ enum: BannerAspectRatio })
  @IsOptional()
  @IsEnum(BannerAspectRatio)
  aspectRatio?: BannerAspectRatio;

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

  @ApiPropertyOptional({ enum: PROMOTION_PERIOD_DAYS })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(PROMOTION_PERIOD_DAYS)
  promotionDays?: (typeof PROMOTION_PERIOD_DAYS)[number];

  @ApiPropertyOptional({ description: 'Promotion start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;
}

export class RecordEmployerPurchaseDto {
  @ApiProperty({ enum: ['job-listings', 'sponsored-jobs', 'banner-advertising'] })
  @IsIn(['job-listings', 'sponsored-jobs', 'banner-advertising'])
  product!: 'job-listings' | 'sponsored-jobs' | 'banner-advertising';

  @ApiProperty()
  @IsString()
  @MinLength(1)
  plan!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ description: 'Subtotal in LKR before VAT and promo discount' })
  @IsInt()
  @Min(0)
  subtotal!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  total!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  promoCode?: string;

  @ApiProperty({ enum: ['card', 'bank', 'po'] })
  @IsIn(['card', 'bank', 'po'])
  paymentMethod!: 'card' | 'bank' | 'po';

  @ApiPropertyOptional({ type: RecordEmployerAdCampaignDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecordEmployerAdCampaignDto)
  adCampaign?: RecordEmployerAdCampaignDto;
}
