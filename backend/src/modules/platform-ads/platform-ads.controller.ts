import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BannerAspectRatio } from '@prisma/client';
import { PlatformAdsService } from './platform-ads.service';
import {
  ListBannerSlotsQueryDto,
  ListPublicSponsoredQueryDto,
} from './dto/platform-ads.dto';

@ApiTags('platform-ads')
@Controller('platform-ads')
export class PlatformAdsController {
  constructor(private readonly platformAdsService: PlatformAdsService) {}

  @Get('banners')
  listBanners(@Query() query: ListBannerSlotsQueryDto) {
    return this.platformAdsService.listPublicBanners(query.aspectRatio);
  }

  @Get('banners/:key')
  bannerByKey(@Param('key') key: string) {
    return this.platformAdsService.getPublicBannerByKey(key);
  }

  @Get('sponsored')
  sponsored(@Query() query: ListPublicSponsoredQueryDto) {
    const limit = query.limit ?? 3;
    return this.platformAdsService.listPublicSponsored(limit, query.offset);
  }
}
