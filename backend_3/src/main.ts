import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';
import { JeagerService } from './jeager/jeager.service';
import { SdkService } from './sdk/sdk.service';

async function bootstrap() {
  const ServerLogger = new Logger('Server', {
    timestamp: true,
  });
  const app = await NestFactory.create(AppModule);

  const logger = app.get(LoggerService);
  global.logger = logger;

  const jaeger = app.get(JeagerService);
  global.jaeger = jaeger;

  const sdk = app.get(SdkService);
  global.sdk = sdk;

  // app.use(jaeger.tracing());

  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  await app.listen(3000, '0.0.0.0').then(() => {
    ServerLogger.log('Server is running at 3000');
  });
}
bootstrap();
