import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CodeDeliveryDetailsDto {
  @ApiProperty({ description: 'Attribute name' })
  AttributeName: string;

  @ApiProperty({ description: 'Delivery medium' })
  DeliveryMedium: string;

  @ApiProperty({ description: 'Destination' })
  Destination: string;
}

export class EmailDto {
  @ApiProperty({ description: 'User email', example: 'userxx@gmxx.com', required: true })
  @IsEmail()
  email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({ description: 'Status' })
  status: 'OK';

  @ApiProperty({ description: 'Message about the verification code' })
  message: string;

  @ApiProperty({ description: 'verification Code delivery details', type: CodeDeliveryDetailsDto })
  codeDeliveryDetails: CodeDeliveryDetailsDto;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Verification code' })
  code: string;

  @ApiProperty({ description: 'New password' })
  newPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ description: 'Status', example: 'OK' })
  status: 'OK';
  @ApiProperty({ description: 'Message about the verification code & reset of Password.' })
  message: string;
}
