import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { JeagerModule } from './jeager/jeager.module';

@Module({
  imports: [LoggerModule, JeagerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
