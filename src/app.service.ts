import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { status: string; message: string; timestamp: string } {
    return {
      status: 'Ok',
      message: 'Hello World, From EMS!',
      timestamp: new Date().toISOString(),
    };
  }
}
