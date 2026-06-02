import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { ApplyJobDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER, UserRole.ADMIN)
  @ApiBearerAuth()
  apply(@CurrentUser() user: AuthUser, @Body() dto: ApplyJobDto) {
    return this.applicationsService.apply(user.sub, dto);
  }

  @Post('by-slug/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER, UserRole.ADMIN)
  @ApiBearerAuth()
  applyBySlug(@CurrentUser() user: AuthUser, @Param('slug') slug: string) {
    return this.applicationsService.applyBySlug(user.sub, slug);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEEKER, UserRole.ADMIN)
  @ApiBearerAuth()
  mine(@CurrentUser() user: AuthUser) {
    return this.applicationsService.listForSeeker(user.sub);
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  forJob(@CurrentUser() user: AuthUser, @Param('jobId') jobId: string) {
    return this.applicationsService.listForJob(user.sub, jobId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user.sub, id, dto);
  }
}
