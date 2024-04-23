import { Controller, Post, UseGuards, Body, UseInterceptors, Get } from '@nestjs/common';
import { AdminAuthGuard } from 'src/guards/cognito.guard';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RegisterResponseDto } from '../auth/dto/register.dto';
import { AdminLogInterceptor } from 'src/interceptor/admin-log.interceptor';
import { User } from '../user/entities/user.entity';

@ApiTags('Admin')
@Controller('admin')
@ApiSecurity('JWT Token')
@UseInterceptors(AdminLogInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create admin', description: 'Create a new admin' })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createAdminDto: CreateAdminDto): Promise<RegisterResponseDto> {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  // @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Get admins', description: 'Get all admins' })
  @ApiResponse({
    status: 200,
    description: 'Admins fetched successfully',
    type: [User],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  getAdmins(): Promise<User[]> {
    return this.adminService.getAdmins();
  }

  @Post('make-admin')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Make a user admin', description: 'Make a user admin' })
  @ApiResponse({ status: 200, description: 'User made admin successfully', type: Boolean })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  makeAUserAdmin(@Body('email') email: string): Promise<boolean> {
    return this.adminService.makeAUserAdmin(email);
  }
}
