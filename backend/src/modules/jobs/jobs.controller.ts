import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JobsService } from './jobs.service';
import { CreateJobDto, JobQueryDto } from './dto/job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  search(@Query() query: JobQueryDto) {
    return this.jobsService.search(query);
  }

  @Get('suggest')
  suggest(@Query('q') q?: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? Math.min(Number(limit) || 8, 12) : 8;
    return this.jobsService.suggest(q ?? '', parsedLimit);
  }

  @Get('employer/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  mine(@CurrentUser() user: AuthUser) {
    return this.jobsService.listForEmployer(user.sub);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.jobsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.sub, dto, user.role);
  }
}
