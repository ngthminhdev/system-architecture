import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { kafkaConfig } from './config';

async function bootstrap() {
  const logger = new Logger('Server', {
    timestamp: true,
  });
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(kafkaConfig);
  await app.startAllMicroservices();

  await app.listen(3000, '0.0.0.0').then(() => {
    logger.log('Server is running at 3000');
  });
}
bootstrap();
