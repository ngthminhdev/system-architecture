import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
// import axios from 'axios';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/continue')
  async getContinue(@Req() req: Request, @Res() res: Response) {
    try {
      global.logger.info('calling api backend_3');
      throw new Error('error in backend 3');
      // throw new HttpException('error in backend 3', HttpStatus.BAD_REQUEST);

      return res.status(200).json({ message: 'data backend_3' });
    } catch (error) {
      global.logger.error(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
