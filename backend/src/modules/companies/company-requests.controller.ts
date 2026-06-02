import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CompanyRequestsService } from './company-requests.service';
import { CreateCompanyRequestDto } from './dto/company-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('company-requests')
@Controller('company-requests')
export class CompanyRequestsController {
  constructor(private readonly companyRequestsService: CompanyRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCompanyRequestDto) {
    return this.companyRequestsService.create(user.sub, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  listMine(@CurrentUser() user: AuthUser) {
    return this.companyRequestsService.listMine(user.sub);
  }
}
