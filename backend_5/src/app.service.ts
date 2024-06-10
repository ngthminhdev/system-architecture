import { Injectable, OnModuleInit } from '@nestjs/common';
import * as dgram from 'dgram';

@Injectable()
export class AppService implements OnModuleInit {
  private server: dgram.Socket;
  onModuleInit() {
    console.log(124);
    this.server = dgram.createSocket('udp4');

    this.server.on('message', (msg, rinfo) => {
      console.log(
        `Server received: ${msg} from ${rinfo.address}:${rinfo.port}`,
      );
      const response = Buffer.from('Message received');
      this.server.send(
        response,
        0,
        response.length,
        rinfo.port,
        rinfo.address,
        (err) => {
          if (err) console.log(err);
        },
      );
    });

    this.server.on('error', (err) => {
      console.log(`Server error:\n${err.stack}`);
      this.server.close();
    });

    this.server.bind(3006, () => {
      console.log('UDP server is listening on port 3006');
    });
  }
  getHello(): string {
    return 'Hello World!';
  }
}
