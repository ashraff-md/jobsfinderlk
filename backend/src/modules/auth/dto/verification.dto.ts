import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';

export class SendPhoneOtpDto {
  @ApiProperty({ example: '+94771234567' })
  @IsString()
  @MinLength(9)
  @Matches(/^\+?[0-9\s-]{9,15}$/, {
    message: 'Enter a valid phone number',
  })
  contactNo!: string;
}

export class ConfirmPhoneOtpDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  code!: string;
}
