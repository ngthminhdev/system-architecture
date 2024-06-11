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
import axios from 'axios';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/continue')
  async getContinue(@Req() req: Request | any, @Res() res: Response) {
    try {
      global.logger.info('calling api backend_1');
      global.jaeger.tracer.inject(
        req.span.context(),
        FORMAT_HTTP_HEADERS,
        req.headers,
      );

      const data = await axios.get('http://backend_2:3000/continue', {
        headers: req.headers,
      });
      // const data2 = await axios.get('http://backend_3:3000/continue', {
      //   headers: req.headers,
      // });
      return res.send(data.data);
      // return res.send(data);
    } catch (error) {
      global.logger.error(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
