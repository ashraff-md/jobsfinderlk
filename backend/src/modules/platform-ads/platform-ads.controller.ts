import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  RecordBannerClicksDto,
  RecordBannerImpressionsDto,
  RecordSponsoredClicksDto,
  RecordSponsoredImpressionsDto,
  SetEmployerCampaignActiveDto,
} from './dto/platform-ads.dto';

@ApiTags('platform-ads')
@Controller('platform-ads')
export class PlatformAdsController {
  constructor(private readonly platformAdsService: PlatformAdsService) {}

  @Get('banners')
  listBanners(@Query() query: ListBannerSlotsQueryDto) {
    return this.platformAdsService.listPublicBanners(query.aspectRatio);
  }

  @Post('banners/impressions')
  recordBannerImpressions(@Body() dto: RecordBannerImpressionsDto) {
    return this.platformAdsService.recordBannerImpressions(dto.campaignIds);
  }

  @Post('sponsored/impressions')
  recordSponsoredImpressions(@Body() dto: RecordSponsoredImpressionsDto) {
    return this.platformAdsService.recordSponsoredImpressions(dto.sponsoredAdIds);
  }

  @Post('banners/clicks')
  recordBannerClicks(@Body() dto: RecordBannerClicksDto) {
    return this.platformAdsService.recordBannerClicks(dto.campaignIds);
  }

  @Post('sponsored/clicks')
  recordSponsoredClicks(@Body() dto: RecordSponsoredClicksDto) {
    return this.platformAdsService.recordSponsoredClicks(dto.sponsoredAdIds);
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

  @Patch('employer/sponsored/:id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  employerSetSponsoredActive(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SetEmployerCampaignActiveDto,
  ) {
    return this.platformAdsService.setEmployerSponsoredActive(
      user.sub,
      id,
      dto.active,
    );
  }

  @Patch('employer/banner-campaigns/:id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  employerSetBannerActive(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SetEmployerCampaignActiveDto,
  ) {
    return this.platformAdsService.setEmployerBannerActive(
      user.sub,
      id,
      dto.active,
    );
  }
}
