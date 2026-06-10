import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Min, MinLength } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiProperty({ enum: ['job-listings', 'sponsored-jobs', 'banner-advertising'] })
  @IsIn(['job-listings', 'sponsored-jobs', 'banner-advertising'])
  product!: 'job-listings' | 'sponsored-jobs' | 'banner-advertising';

  @ApiProperty({ description: 'Subtotal in LKR before VAT and promo discount' })
  @IsInt()
  @Min(0)
  subtotal!: number;
}
