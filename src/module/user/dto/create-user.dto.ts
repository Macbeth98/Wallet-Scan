import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsNotEmpty, IsDefined, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsOptional()
  id?: number;

  @ApiProperty({ description: 'The email of the User', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The username of the User', required: true })
  @IsString()
  @Length(4, 20)
  username: string;

  @ApiProperty({ description: 'The first name of the User', required: true })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The last name of the User', required: true })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'The profile image of the User',
    required: true,
    default: 'https://i.imgur.com/6VBx3io.png',
  })
  @IsString()
  @IsDefined()
  profile_img: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'The date of when the user signed Up!',
    required: false,
    default: new Date(),
  })
  signedup_date?: Date;

  @Transform(({ value }) => (value === UserRole.USER ? value : UserRole.USER))
  @IsOptional()
  role?: UserRole;
}
