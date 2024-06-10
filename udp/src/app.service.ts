import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as dgram from 'dgram';
import * as glossy from 'glossy';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class AppService implements OnModuleInit {
  private server: dgram.Socket;
  private syslogProducer: glossy.Produce;
  ServerLogger = new Logger('UDP-Server', {
    timestamp: true,
  });
  private logger: winston.Logger;

  initLogger({ service }) {
    const transport = new winston.transports.DailyRotateFile({
      filename: `logs/${service}/%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    });

    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.printf(({ message }) => {
        return message;
      }),
      transports: [transport],
    });
  }

  onModuleInit() {
    this.server = dgram.createSocket('udp4');

    this.server.on('message', (msg) => {
      const { serviceName, formattedMessage } = this.formatLogMessage(
        msg.toString(),
      );
      this.initLogger({
        service: serviceName,
      });
      this.logger.info(formattedMessage);
    });

    this.server.on('error', (err) => {
      console.log(`Server error:\n${err.stack}`);
      this.server.close();
    });

    this.server.bind(3000, () => {
      this.ServerLogger.log('UDP server is listening on port 3000');
    });
  }

  private extractServiceName(logString: string) {
    const serviceNamePrefix = 'service_name:';
    const startIndex = logString.indexOf(serviceNamePrefix);

    if (startIndex === -1) {
      return null;
    }

    const serviceNameStart = startIndex + serviceNamePrefix.length;
    const serviceNameEnd = logString.indexOf(' ', serviceNameStart);

    if (serviceNameEnd === -1) {
      return logString.slice(serviceNameStart);
    }

    return logString.slice(serviceNameStart, serviceNameEnd);
  }
  private formatLogMessage(message: string) {
    const serviceName = this.extractServiceName(message);
    let finalMessage = message.split(']: ')[1];
    if (message.includes('url:')) {
      finalMessage = '[API-LOG] ' + finalMessage;
    } else {
      finalMessage = '[DEV-LOG] ' + finalMessage;
    }

    return {
      serviceName,
      formattedMessage: `[${serviceName}] ${finalMessage}`,
    };
  }
}
