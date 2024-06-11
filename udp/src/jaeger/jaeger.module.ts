import { Module } from '@nestjs/common';
import { JaegerService } from './jaeger.service';
import { JaegerController } from './jaeger.controller';

@Module({
  controllers: [JaegerController],
  providers: [JaegerService],
})
export class JaegerModule {}
