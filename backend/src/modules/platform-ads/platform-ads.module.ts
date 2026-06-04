import { Module } from '@nestjs/common';
import { ImageStorageModule } from '../../common/storage/image-storage.module';
import { PlatformAdsController } from './platform-ads.controller';
import { PlatformAdsService } from './platform-ads.service';

@Module({
  imports: [ImageStorageModule],
  controllers: [PlatformAdsController],
  providers: [PlatformAdsService],
  exports: [PlatformAdsService],
})
export class PlatformAdsModule {}
