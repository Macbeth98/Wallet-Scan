import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { RegisterResponseDto } from '../auth/dto/register.dto';
import { logger } from 'src/utils/logger.config';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<RegisterResponseDto> {
    createAdminDto.role = UserRole.ADMIN;
    return this.authService.register(createAdminDto);
  }

  async getAdmins(): Promise<User[]> {
    return this.userService.findAll({ role: UserRole.ADMIN });
  }

  async makeAUserAdmin(email: string): Promise<boolean> {
    return this.authService.updateUserRole(email, UserRole.ADMIN);
  }

  async createAdminLog(log: any): Promise<void> {
    logger.info('AdminService', log);
    return log;
  }
}
