import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompanyRequestsController } from './company-requests.controller';
import { CompaniesService } from './companies.service';
import { CompanyRequestsService } from './company-requests.service';

@Module({
  controllers: [CompaniesController, CompanyRequestsController],
  providers: [CompaniesService, CompanyRequestsService],
  exports: [CompaniesService, CompanyRequestsService],
})
export class CompaniesModule {}
