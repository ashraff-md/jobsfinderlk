import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyJobDto {
  @ApiProperty()
  @IsString()
  jobId!: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty()
  @IsString()
  status!: string;
}
