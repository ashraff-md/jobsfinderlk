import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JobsService } from '../jobs/jobs.service';
import { CompanyRequestsService } from '../companies/company-requests.service';
import {
  MergeCompanyRequestDto,
  RejectCompanyRequestDto,
  UpdateCompanyRequestDto,
} from '../companies/dto/company-request.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminListCompanyRequestsQueryDto } from './dto/admin-list-company-requests-query.dto';
import { AdminListRecruitersQueryDto } from './dto/admin-list-recruiters-query.dto';
import { AdminRecruitersService } from './admin-recruiters.service';
import { AdminListJobsQueryDto } from './dto/admin-list-jobs-query.dto';
import { UpdateJobDto } from '../jobs/dto/job.dto';
import { PartnersService } from '../partners/partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from '../partners/dto/partner.dto';
import { PlatformAdsService } from '../platform-ads/platform-ads.service';
import {
  CreateBannerCampaignDto,
  CreateSponsoredAdDto,
  ListBannerSlotsQueryDto,
  ReorderSponsoredAdsDto,
  UpdateBannerCampaignDto,
  UpdateBannerSlotDto,
  UpdateSponsoredAdDto,
} from '../platform-ads/dto/platform-ads.dto';
import {
  CreateJobCategoryDto,
  UpdateJobCategoryDto,
} from '../jobs/dto/job-category.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly companyRequestsService: CompanyRequestsService,
    private readonly adminRecruitersService: AdminRecruitersService,
    private readonly platformAdsService: PlatformAdsService,
    private readonly partnersService: PartnersService,
  ) {}

  @Get('partners')
  listPartners() {
    return this.partnersService.listForAdmin();
  }

  @Post('partners')
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Patch('partners/:id')
  updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(id, dto);
  }

  @Get('job-categories')
  listJobCategories() {
    return this.jobsService.listCategoriesForAdmin();
  }

  @Post('job-categories')
  createJobCategory(@Body() dto: CreateJobCategoryDto) {
    return this.jobsService.createCategory(dto);
  }

  @Patch('job-categories/:id')
  updateJobCategory(
    @Param('id') id: string,
    @Body() dto: UpdateJobCategoryDto,
  ) {
    return this.jobsService.updateCategory(id, dto);
  }

  @Delete('job-categories/:id')
  deleteJobCategory(@Param('id') id: string) {
    return this.jobsService.deleteCategory(id);
  }

  @Get('jobs/stats')
  adminJobStats() {
    return this.jobsService.adminJobStats();
  }

  @Get('jobs')
  listJobs(@Query() query: AdminListJobsQueryDto) {
    return this.jobsService.listForAdmin(query);
  }

  @Get('jobs/pending')
  pendingJobs() {
    return this.jobsService.listPending();
  }

  @Get('jobs/government')
  governmentJobs() {
    return this.jobsService.listGovernmentJobs();
  }

  @Get('jobs/:id')
  jobForReview(@Param('id') id: string) {
    return this.jobsService.findByIdForModeration(id);
  }

  @Patch('jobs/:id')
  updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateForAdmin(id, dto);
  }

  @Patch('jobs/:id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.jobsService.moderate(id, 'approve', user.sub);
  }

  @Patch('jobs/:id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.jobsService.moderate(id, 'reject', user.sub);
  }

  @Get('recruiters')
  listRecruiters(@Query() query: AdminListRecruitersQueryDto) {
    return this.adminRecruitersService.listForAdmin(query);
  }

  @Get('recruiters/:userId')
  recruiterForReview(@Param('userId') userId: string) {
    return this.adminRecruitersService.findByIdForAdmin(userId);
  }

  @Get('company-requests/pending')
  pendingCompanyRequests() {
    return this.companyRequestsService.listPending();
  }

  @Get('company-requests')
  listCompanyRequests(@Query() query: AdminListCompanyRequestsQueryDto) {
    return this.companyRequestsService.listForAdmin(query);
  }

  @Get('company-requests/:id')
  companyRequestForReview(@Param('id') id: string) {
    return this.companyRequestsService.findByIdForAdmin(id);
  }

  @Patch('company-requests/:id')
  updateCompanyRequest(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyRequestDto,
  ) {
    return this.companyRequestsService.updateForAdmin(id, dto);
  }

  @Patch('company-requests/:id/approve')
  approveCompanyRequest(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.companyRequestsService.approve(id, user.sub);
  }

  @Patch('company-requests/:id/merge')
  mergeCompanyRequest(
    @Param('id') id: string,
    @Body() dto: MergeCompanyRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.companyRequestsService.merge(id, dto, user.sub);
  }

  @Patch('company-requests/:id/reject')
  rejectCompanyRequest(
    @Param('id') id: string,
    @Body() dto: RejectCompanyRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.companyRequestsService.reject(id, dto, user.sub);
  }

  @Patch('recruiters/:userId/approve')
  approveRecruiter(@Param('userId') userId: string, @CurrentUser() user: AuthUser) {
    return this.adminRecruitersService.moderate(userId, 'approve', user.sub);
  }

  @Patch('recruiters/:userId/reject')
  rejectRecruiter(@Param('userId') userId: string, @CurrentUser() user: AuthUser) {
    return this.adminRecruitersService.moderate(userId, 'reject', user.sub);
  }

  @Get('platform-ads/banner-campaigns')
  listBannerCampaigns(@Query() query: ListBannerSlotsQueryDto) {
    return this.platformAdsService.listBannerCampaignsForAdmin(query.aspectRatio);
  }

  @Post('platform-ads/banner-campaigns')
  createBannerCampaign(@Body() dto: CreateBannerCampaignDto) {
    return this.platformAdsService.createBannerCampaign(dto);
  }

  @Get('platform-ads/banner-campaigns/:id')
  bannerCampaignForAdmin(@Param('id') id: string) {
    return this.platformAdsService.getBannerCampaignForAdmin(id);
  }

  @Patch('platform-ads/banner-campaigns/:id')
  updateBannerCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateBannerCampaignDto,
  ) {
    return this.platformAdsService.updateBannerCampaign(id, dto);
  }

  @Delete('platform-ads/banner-campaigns/:id')
  deleteBannerCampaign(@Param('id') id: string) {
    return this.platformAdsService.deleteBannerCampaign(id);
  }

  @Post('platform-ads/banner-slots/sync')
  syncBannerSlots() {
    return this.platformAdsService.syncAllBannerSlots();
  }

  @Get('platform-ads/banner-slots')
  listBannerSlots(@Query() query: ListBannerSlotsQueryDto) {
    return this.platformAdsService.listBannerSlotsForAdmin(query.aspectRatio);
  }

  @Get('platform-ads/banner-slots/:id')
  bannerSlotForAdmin(@Param('id') id: string) {
    return this.platformAdsService.getBannerSlotForAdmin(id);
  }

  @Patch('platform-ads/banner-slots/:id')
  updateBannerSlot(@Param('id') id: string, @Body() dto: UpdateBannerSlotDto) {
    return this.platformAdsService.updateBannerSlot(id, dto);
  }

  @Get('platform-ads/sponsored')
  listSponsoredAds() {
    return this.platformAdsService.listSponsoredForAdmin();
  }

  @Post('platform-ads/sponsored')
  createSponsoredAd(@Body() dto: CreateSponsoredAdDto) {
    return this.platformAdsService.createSponsoredAd(dto);
  }

  @Patch('platform-ads/sponsored/reorder')
  reorderSponsoredAds(@Body() dto: ReorderSponsoredAdsDto) {
    return this.platformAdsService.reorderSponsoredAds(dto);
  }

  @Patch('platform-ads/sponsored/:id')
  updateSponsoredAd(@Param('id') id: string, @Body() dto: UpdateSponsoredAdDto) {
    return this.platformAdsService.updateSponsoredAd(id, dto);
  }

  @Delete('platform-ads/sponsored/:id')
  deleteSponsoredAd(@Param('id') id: string) {
    return this.platformAdsService.deleteSponsoredAd(id);
  }
}
