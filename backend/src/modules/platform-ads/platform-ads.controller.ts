import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BannerAspectRatio } from '@prisma/client';
import { PlatformAdsService } from './platform-ads.service';
import { ListBannerSlotsQueryDto } from './dto/platform-ads.dto';

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
  sponsored(@Query('limit') limit?: string) {
    const parsed = limit ? Math.min(Number(limit) || 3, 12) : 3;
    return this.platformAdsService.listPublicSponsored(parsed);
  }
}
