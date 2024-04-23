import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { ICurrentUser, UserAuthGuard } from 'src/guards/cognito.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user', description: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users found', type: [User] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findAll(@Query() query: FindAllUserDto): Promise<User[]> {
    console.log(query);
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user', description: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: number): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update a user by id' })
  @ApiSecurity('JWT Token')
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(UserAuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: ICurrentUser },
  ): Promise<User> {
    if (req.user.id !== id) {
      throw new UnauthorizedException('Unauthorized: Not allowed to update this user');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user by id' })
  @ApiResponse({ status: 200, description: 'User deleted successfully', type: Boolean })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: number): Promise<boolean> {
    const deleted = await this.userService.remove(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return deleted;
  }
}
