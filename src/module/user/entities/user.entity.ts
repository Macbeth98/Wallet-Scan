import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

@Entity()
@Index(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn('increment')
  @ApiProperty({ description: 'The id of the User' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty({ description: 'The username of the User' })
  @IsString()
  @Length(4, 20)
  username: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'The first name of the User' })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'The last name of the User' })
  lastName: string;

  @Column({ type: 'varchar', default: 'https://i.imgur.com/6VBx3io.png' })
  @ApiPropertyOptional({
    description: 'The profile image of the User',
    default: 'https://i.imgur.com/6VBx3io.png',
  })
  profile_img: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'The date of when the user signed Up!' })
  signedup_date: Date;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  @ApiProperty({ description: 'The status of the User', default: AccountStatus.ACTIVE })
  @IsEnum(AccountStatus)
  account_status: AccountStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @ApiProperty({ description: 'The role of the User', default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
