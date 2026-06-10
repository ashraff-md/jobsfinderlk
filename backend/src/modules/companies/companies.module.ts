import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompaniesController } from './companies.controller';
import { CompanyRequestsController } from './company-requests.controller';
import { CompaniesService } from './companies.service';
import { CompanyRequestsService } from './company-requests.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [CompaniesController, CompanyRequestsController],
  providers: [CompaniesService, CompanyRequestsService],
  exports: [CompaniesService, CompanyRequestsService],
})
export class CompaniesModule {}
