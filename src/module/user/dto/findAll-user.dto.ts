import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FindAllUserDto {
  @ApiPropertyOptional({ description: 'The page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'The limit of items per page', default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'The id of the User' })
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({ description: 'The username of the User' })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'The email of the User' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'The first name of the User' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'The last name of the User' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The account status of the user',
    type: 'enum',
    enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
  })
  @IsOptional()
  account_status?: string;

  @ApiPropertyOptional({
    description: 'The role of the user',
    type: 'enum',
    enum: ['USER', 'ADMIN', 'MODERATOR'],
  })
  @IsOptional()
  role?: string;
}
