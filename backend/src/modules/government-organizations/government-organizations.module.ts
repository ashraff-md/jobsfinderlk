import { Module } from '@nestjs/common';
import { ImageStorageModule } from '../../common/storage/image-storage.module';
import { GovernmentOrganizationsController } from './government-organizations.controller';
import { GovernmentOrganizationsService } from './government-organizations.service';

@Module({
  imports: [ImageStorageModule],
  controllers: [GovernmentOrganizationsController],
  providers: [GovernmentOrganizationsService],
  exports: [GovernmentOrganizationsService],
})
export class GovernmentOrganizationsModule {}
