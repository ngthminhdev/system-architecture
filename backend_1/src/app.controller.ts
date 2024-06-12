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

  @Get('/logs')
  async getLogs(@Req() req: Request | any, @Res() res: Response) {
    try {
      global.logger.info('calling api logs backend_1');
      // global.logger.error('error calling api logs backend_1');
      throw new HttpException('Error 400', HttpStatus.BAD_REQUEST);

      return res.status(HttpStatus.OK).json({ message: 'OK' });
    } catch (error) {
      global.logger.error(JSON.stringify(error));
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/continue')
  async getContinue(@Req() req: Request | any, @Res() res: Response) {
    try {
      global.logger.info('calling api backend_1');
      const data = await global.sdk.get('http://backend_2:3000/continue', req);
      // const data2 = await axios.get('http://backend_3:3000/continue', {
      //   headers: req.headers,
      // });
      return res.send(data);
      // return res.send(data);
    } catch (error) {
      global.logger.error(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
