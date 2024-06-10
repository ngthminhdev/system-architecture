import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule as KafkaConfigModule } from 'ngthminhdev-nestjs-kafka';
import { kafkaConfig } from './config';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [KafkaConfigModule.register(kafkaConfig), LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
