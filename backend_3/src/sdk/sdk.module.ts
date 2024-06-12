import { Module } from '@nestjs/common';
import { SdkService } from './sdk.service';
import { SdkController } from './sdk.controller';

@Module({
  controllers: [SdkController],
  providers: [SdkService],
})
export class SdkModule {}
