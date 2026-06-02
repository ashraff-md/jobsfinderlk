import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.companiesService.findAll(search);
  }

  @Get('suggest')
  suggest(@Query('q') q?: string) {
    return this.companiesService.suggest(q ?? '');
  }

  @Get('check-duplicates')
  checkDuplicates(
    @Query('name') name?: string,
    @Query('website') website?: string,
    @Query('emailDomain') emailDomain?: string,
  ) {
    return this.companiesService.findSimilar({
      name: name ?? '',
      website,
      emailDomain,
    });
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.companiesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
  @ApiBearerAuth()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCompanyDto) {
    return this.companiesService.createForEmployer(user.sub, dto);
  }
}
