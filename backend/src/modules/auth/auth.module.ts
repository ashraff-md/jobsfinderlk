import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageStorageModule } from '../../common/storage/image-storage.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationService } from './verification.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
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
  providers: [AuthService, VerificationService, JwtStrategy],
  exports: [AuthService, VerificationService, JwtModule],
})
export class AuthModule {}
