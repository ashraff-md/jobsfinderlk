import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { CreateGovernmentOrganizationDto } from './create-government-organization.dto';

export class UpdateGovernmentOrganizationDto extends PartialType(
  OmitType(CreateGovernmentOrganizationDto, ['parentOrganizationId'] as const),
) {
  @ApiPropertyOptional({ example: 'uuid-of-parent-ministry', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID()
  parentOrganizationId?: string | null;
}
