import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('log')
  handleNewLog(data: any) {
    console.log('Received UDP message:', data);
    return { status: 'OK', message: 'Message received' };
  }
}
