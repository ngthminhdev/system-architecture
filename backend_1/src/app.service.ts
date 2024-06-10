import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    global.logger.info('minh test loginfo udp');
    // global.logger.error('Test Log Error');
    // global.logger.warn('Test Log warn');
    return 'Hello World!';
  }
}
