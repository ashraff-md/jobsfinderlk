import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PlatformAdsService } from '../src/modules/platform-ads/platform-ads.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const platformAds = app.get(PlatformAdsService);
    const slots = await platformAds.syncAllBannerSlots();
    console.log(`Synced ${slots.length} banner slot(s) with 3 rotating creatives each.`);
  } finally {
    await app.close();
  }
}

void main();
