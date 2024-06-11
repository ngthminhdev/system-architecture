import { Module } from '@nestjs/common';
import { JeagerService } from './jeager.service';
import { JeagerController } from './jeager.controller';

@Module({
  controllers: [JeagerController],
  providers: [JeagerService],
})
export class JeagerModule {}
