import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ description: 'The first name of the User', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'The last name of the User', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'The profile image of the User',
    required: false,
    default: 'https://i.imgur.com/6VBx3io.png',
  })
  @IsString()
  @IsOptional()
  profile_img?: string;

  @IsOptional()
  @Transform(({ value }) => (value === UserRole.USER ? value : UserRole.USER))
  role?: UserRole;
}
