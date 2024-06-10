import { Global, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as Syslog from 'winston-syslog';

@Global()
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const transport = new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        }),
      ),
      transports: [
        transport,
        new winston.transports.Console(),
        new Syslog.Syslog({
          host: 'udp',
          port: 3000,
          protocol: 'udp4',
          facility: 'local0',
        }),
      ],
    });
  }

  log(level: string, message: string) {
    this.logger.log(level, message);
  }

  info(message: string) {
    this.log('info', message);
  }

  error(message: string) {
    this.log('error', message);
  }

  warn(message: string) {
    this.log('warn', message);
  }
}
