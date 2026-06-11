import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminRecruitersService } from './admin-recruiters.service';
import { AdminTalentService } from './admin-talent.service';
import { JobsModule } from '../jobs/jobs.module';
import { CompaniesModule } from '../companies/companies.module';
import { PlatformAdsModule } from '../platform-ads/platform-ads.module';
import { PartnersModule } from '../partners/partners.module';
import { BlogPostsModule } from '../blog-posts/blog-posts.module';

@Module({
  imports: [JobsModule, CompaniesModule, PlatformAdsModule, PartnersModule, BlogPostsModule],
  controllers: [AdminController],
  providers: [AdminRecruitersService, AdminTalentService],
})
export class AdminModule {}
