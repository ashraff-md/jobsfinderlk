import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { JobsModule } from '../jobs/jobs.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [JobsModule, CompaniesModule],
  controllers: [AdminController],
})
export class AdminModule {}
