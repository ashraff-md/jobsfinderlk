import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CompaniesModule } from '../companies/companies.module';
import { AuthModule } from '../auth/auth.module';
import { ImageStorageModule } from '../../common/storage/image-storage.module';

@Module({
  imports: [CompaniesModule, AuthModule, ImageStorageModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
