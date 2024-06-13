import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/continue')
  async getContinue(@Req() req: Request | any, @Res() res: Response) {
    try {
      global.logger.info('calling api backend_2');
      const data = await global.sdk.get('http://backend_3:3000/continue', req);
      throw new HttpException(
        'error in backend 2 errorrrrrrrrrrr',
        HttpStatus.BAD_REQUEST,
      );

      return res.send(data);
    } catch (error) {
      global.logger.error(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
