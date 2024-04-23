import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';
import { User } from 'src/module/user/entities/user.entity';

export class LoginRequestDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'User password' })
  @MinLength(8)
  readonly password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Status' })
  @ApiResponseProperty({ example: 'OK' })
  status: 'OK';

  @ApiProperty({ description: 'User', type: User })
  @ApiResponseProperty({ type: User })
  user: User;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  tokenExpiresIn: number;

  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({
    description: 'ID token. This is the token that needs to be sent in the request headers.',
  })
  idToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}
