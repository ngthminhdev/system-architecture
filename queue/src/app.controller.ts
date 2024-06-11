import { Controller, Inject, Logger, OnModuleInit } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import * as dgram from 'dgram';
import { IncomingMessage } from 'http';
import { KAFKA_MODULE } from 'ngthminhdev-nestjs-kafka';
import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from 'winston-elasticsearch';
import * as winston from 'winston';

@Controller()
export class AppController implements OnModuleInit {
  constructor(@Inject(KAFKA_MODULE) private readonly client: ClientKafka) {}
  private udpServer: dgram.Socket;
  UDPLogger = new Logger('UDP-Server', {
    timestamp: true,
  });
  private elasticLogger: winston.Logger;

  async onModuleInit() {
    this.initUDPServer();
    this.initElasticLoggers();
    const requestPatterns = ['jaeger.log', 'dev.log', 'http.log'];

    requestPatterns.forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
  }

  initUDPServer() {
    this.udpServer = dgram.createSocket('udp4');

    this.udpServer.on('message', (msg) => {
      this.handleUDPMessage(msg.toString());
    });

    this.udpServer.on('error', (err) => {
      console.log(`Server error:\n${err.stack}`);
      this.udpServer.close();
    });

    this.udpServer.bind(514, () => {
      this.UDPLogger.log('UDP server is listening on port 514');
    });
  }

  initElasticLoggers() {
    // Http log
    const esTransportOpts: ElasticsearchTransportOptions = {
      level: 'info',
      clientOpts: { node: 'http://elasticsearch:9200' },
      indexPrefix: 'team3-logs',
      transformer: (logData) => {
        logData['@timestamp'] = new Date().toISOString();
        return logData;
      },
    };
    this.elasticLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new ElasticsearchTransport(esTransportOpts)],
    });
  }

  handleUDPMessage(message: string) {
    if (message.includes('API-LOG')) {
      const logData = JSON.parse(message.split('[API-LOG] ')[1]);
      this.enqueueHandleLog('http.log', logData);
    } else if (message.includes('DEV-LOG')) {
      const logData = JSON.parse(message.split('[DEV-LOG] ')[1]);
      this.enqueueHandleLog('dev.log', logData);
    }
  }

  enqueueHandleLog(queueName: string, payload: any) {
    switch (queueName) {
      case 'dev.log':
        this.client.emit<string>('dev.log', payload);
        break;
      case 'http.log':
        this.client.emit<string>('http.log', payload);
        break;
      case 'jaeger.log':
        this.client.emit<string>('jaeger.log', payload);
        break;
    }
  }

  @EventPattern('http.log')
  async handleHttpLogs(
    @Payload() payload: IncomingMessage,
    @Ctx() context: KafkaContext,
  ) {
    const { offset, value } = context.getMessage();
    this.elasticLogger.info(value);

    const partition = context.getPartition();
    const topic = context.getTopic();
    await this.client.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern('dev.log')
  async handleDevLogs(
    @Payload() payload: IncomingMessage,
    @Ctx() context: KafkaContext,
  ) {
    const { offset, value } = context.getMessage();
    this.elasticLogger.info(value);

    const partition = context.getPartition();
    const topic = context.getTopic();
    await this.client.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern('jaeger.log')
  async handleJaegerLogs(
    @Payload() payload: IncomingMessage,
    @Ctx() context: KafkaContext,
  ) {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    console.log(JSON.stringify(payload) + ' created');
    const { offset, value } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    console.log({ topic, partition, offset, value });
    await this.client.commitOffsets([{ topic, partition, offset }]);
  }
}
