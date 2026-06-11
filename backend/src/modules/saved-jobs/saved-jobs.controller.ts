import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { SavedJobsService } from './saved-jobs.service';

@ApiTags('saved-jobs')
@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SEEKER)
@ApiBearerAuth()
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.savedJobsService.listForSeeker(user.sub);
  }

  @Get('ids')
  listIds(@CurrentUser() user: AuthUser) {
    return this.savedJobsService.listIds(user.sub);
  }

  @Post(':jobId')
  save(@CurrentUser() user: AuthUser, @Param('jobId') jobId: string) {
    return this.savedJobsService.save(user.sub, jobId);
  }

  @Delete(':jobId')
  remove(@CurrentUser() user: AuthUser, @Param('jobId') jobId: string) {
    return this.savedJobsService.remove(user.sub, jobId);
  }
}
