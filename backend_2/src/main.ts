import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Server', {
    timestamp: true,
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(3000, '0.0.0.0').then(() => {
    logger.log('Server is running at 3000');
  });
}
bootstrap();
