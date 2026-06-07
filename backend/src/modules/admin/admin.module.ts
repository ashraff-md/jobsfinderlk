import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminRecruitersService } from './admin-recruiters.service';
import { JobsModule } from '../jobs/jobs.module';
import { CompaniesModule } from '../companies/companies.module';
import { PlatformAdsModule } from '../platform-ads/platform-ads.module';
import { PartnersModule } from '../partners/partners.module';

@Module({
  imports: [JobsModule, CompaniesModule, PlatformAdsModule, PartnersModule],
  controllers: [AdminController],
  providers: [AdminRecruitersService],
})
export class AdminModule {}
