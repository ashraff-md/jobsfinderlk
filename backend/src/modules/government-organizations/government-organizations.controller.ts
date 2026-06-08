import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateGovernmentOrganizationDto } from './dto/create-government-organization.dto';
import { UpdateGovernmentOrganizationDto } from './dto/update-government-organization.dto';
import { GovernmentOrganizationsService } from './government-organizations.service';

@ApiTags('government-organizations')
@Controller('government-organizations')
export class GovernmentOrganizationsController {
  constructor(
    private readonly governmentOrganizationsService: GovernmentOrganizationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  findAll(@Query('search') search?: string) {
    return this.governmentOrganizationsService.findAll(search);
  }

  @Get('suggest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  suggest(@Query('q') q: string | undefined) {
    return this.governmentOrganizationsService.suggest(q ?? '');
  }

  @Get('check-duplicates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  checkDuplicates(@Query('name') name?: string) {
    return this.governmentOrganizationsService.findSimilar(name ?? '');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  findById(@Param('id') id: string) {
    return this.governmentOrganizationsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateGovernmentOrganizationDto,
  ) {
    return this.governmentOrganizationsService.createForAdmin(user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateGovernmentOrganizationDto) {
    return this.governmentOrganizationsService.updateForAdmin(id, dto);
  }
}
