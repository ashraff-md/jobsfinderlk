import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
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

  @Get('employer/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  employerMine(@CurrentUser() user: AuthUser) {
    return this.platformAdsService.listForEmployer(user.sub);
  }
}
