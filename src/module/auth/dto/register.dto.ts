import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import { User } from 'src/module/user/entities/user.entity';
import { IAuthRegisterResponse } from '../interfaces/auth.interface';

export class RegisterRequestDto extends CreateUserDto {
  @ApiProperty({ description: 'User password' })
  @MinLength(8)
  readonly password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'Status' })
  status: 'OK';

  @ApiProperty({ description: 'User', type: User })
  user: User;

  @ApiProperty({ description: 'Cognito result' })
  message: string;

  codeDeliveryDetails: IAuthRegisterResponse['codeDeliveryDetails'];
}
