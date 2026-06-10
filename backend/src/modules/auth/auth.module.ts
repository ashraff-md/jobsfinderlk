import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageStorageModule } from '../../common/storage/image-storage.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployerPurchasesService } from './employer-purchases.service';
import { PromoCodesService } from './promo-codes.service';
import { VerificationService } from './verification.service';
import { JwtStrategy } from './jwt.strategy';
import { CompaniesModule } from '../companies/companies.module';
import { PlatformAdsModule } from '../platform-ads/platform-ads.module';

@Module({
  imports: [
    forwardRef(() => CompaniesModule),
    PlatformAdsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ImageStorageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmployerPurchasesService,
    PromoCodesService,
    VerificationService,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    EmployerPurchasesService,
    PromoCodesService,
    VerificationService,
    JwtModule,
  ],
})
export class AuthModule {}
