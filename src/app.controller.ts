import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('PING')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Ping', description: 'Ping the server' })
  @ApiSecurity('JWT Token')
  @ApiResponse({ status: 200, description: 'Ping successful' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getHello(): { status: string; message: string; timestamp: string } {
    return this.appService.getHello();
  }
}
