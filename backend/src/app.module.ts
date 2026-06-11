import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AdminModule } from './modules/admin/admin.module';
import { PlatformAdsModule } from './modules/platform-ads/platform-ads.module';
import { PartnersModule } from './modules/partners/partners.module';
import { GovernmentOrganizationsModule } from './modules/government-organizations/government-organizations.module';
import { ImageStorageModule } from './common/storage/image-storage.module';
import { SavedJobsModule } from './modules/saved-jobs/saved-jobs.module';
import { BlogPostsModule } from './modules/blog-posts/blog-posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ImageStorageModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,
    AdminModule,
    PlatformAdsModule,
    PartnersModule,
    GovernmentOrganizationsModule,
    SavedJobsModule,
    BlogPostsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
