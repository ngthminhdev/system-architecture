import { Global, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Global()
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const transport = new winston.transports.DailyRotateFile({
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    });

    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
      transports: [
        transport,
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  formatLog(payload: any, source: string) {
    return {
      url: null,
      method: null,
      ip: null,
      body: null,
      query: null,
      headers: null,
      statusCode: null,
      responseTime: null,
      service: 'backend_1',
      span: null,
      payload: payload,
      source,
    };
  }

  log(level: string, message: string) {
    this.logger.log(level, message);
  }

  trace(message: string) {
    this.log('info', `[JAEGER-LOG] ${message}`);
  }

  http(message: string) {
    this.log('info', `[API-LOG] ${message}`);
  }

  info(message: string) {
    this.log(
      'info',
      `[DEV-LOG] ${JSON.stringify(this.formatLog(message, 'dev'))}`,
    );
  }

  error(message: string) {
    this.log(
      'error',
      `[DEV-LOG] ${JSON.stringify(this.formatLog(message, 'dev'))}`,
    );
  }

  warn(message: string) {
    this.log(
      'warn',
      `[DEV-LOG] ${JSON.stringify(this.formatLog(message, 'dev'))}`,
    );
  }
}
