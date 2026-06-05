import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { VerificationService } from './verification.service';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateAdminProfileDto,
  UpdateEmployerProfileDto,
} from './dto/auth.dto';
import { ConfirmPhoneOtpDto, SendPhoneOtpDto } from './dto/verification.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.sub);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Patch('admin-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  updateAdminProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateAdminProfileDto) {
    return this.authService.updateAdminProfile(user.sub, user.role, dto);
  }

  @Patch('employer-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  updateEmployerProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateEmployerProfileDto) {
    return this.authService.updateEmployerProfile(user.sub, dto);
  }

  @Get('verification-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  verificationStatus(@CurrentUser() user: AuthUser) {
    return this.verificationService.getRecruiterVerificationStatus(user.sub);
  }

  @Post('verify-email/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  sendEmailVerification(@CurrentUser() user: AuthUser) {
    return this.verificationService.sendEmailVerification(user.sub);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.verificationService.verifyEmailToken(token);
  }

  @Post('verify-phone/send-otp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  sendPhoneOtp(@CurrentUser() user: AuthUser, @Body() dto: SendPhoneOtpDto) {
    return this.verificationService.sendPhoneOtp(user.sub, dto.contactNo);
  }

  @Post('verify-phone/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  confirmPhoneOtp(@CurrentUser() user: AuthUser, @Body() dto: ConfirmPhoneOtpDto) {
    return this.verificationService.confirmPhoneOtp(user.sub, dto.code);
  }
}
