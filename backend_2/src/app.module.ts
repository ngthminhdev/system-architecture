import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { JeagerModule } from './jeager/jeager.module';
import { SdkModule } from './sdk/sdk.module';

@Module({
  imports: [LoggerModule, JeagerModule, SdkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
