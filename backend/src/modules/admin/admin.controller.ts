import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JobsService } from '../jobs/jobs.service';
import { CompanyRequestsService } from '../companies/company-requests.service';
import {
  MergeCompanyRequestDto,
  RejectCompanyRequestDto,
} from '../companies/dto/company-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly companyRequestsService: CompanyRequestsService,
  ) {}

  @Get('jobs/pending')
  pendingJobs() {
    return this.jobsService.listPending();
  }

  @Patch('jobs/:id/approve')
  approve(@Param('id') id: string) {
    return this.jobsService.moderate(id, 'approve');
  }

  @Patch('jobs/:id/reject')
  reject(@Param('id') id: string) {
    return this.jobsService.moderate(id, 'reject');
  }

  @Get('company-requests/pending')
  pendingCompanyRequests() {
    return this.companyRequestsService.listPending();
  }

  @Patch('company-requests/:id/approve')
  approveCompanyRequest(@Param('id') id: string) {
    return this.companyRequestsService.approve(id);
  }

  @Patch('company-requests/:id/merge')
  mergeCompanyRequest(
    @Param('id') id: string,
    @Body() dto: MergeCompanyRequestDto,
  ) {
    return this.companyRequestsService.merge(id, dto);
  }

  @Patch('company-requests/:id/reject')
  rejectCompanyRequest(
    @Param('id') id: string,
    @Body() dto: RejectCompanyRequestDto,
  ) {
    return this.companyRequestsService.reject(id, dto);
  }
}
