import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';

async function bootstrap() {
  const ServerLogger = new Logger('Server', {
    timestamp: true,
  });
  const app = await NestFactory.create(AppModule);

  const logger = app.get(LoggerService);
  global.logger = logger;

  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  await app.listen(3000, '0.0.0.0').then(() => {
    ServerLogger.log('Server is running at 3000');
  });
}
bootstrap();
