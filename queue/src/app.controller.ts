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
import * as tracer from 'jaeger-client';
import { KAFKA_MODULE } from 'ngthminhdev-nestjs-kafka';
import * as winston from 'winston';
import {
  ElasticsearchTransport,
  ElasticsearchTransportOptions,
} from 'winston-elasticsearch';

@Controller()
export class AppController implements OnModuleInit {
  constructor(@Inject(KAFKA_MODULE) private readonly client: ClientKafka) {}
  private udpServer: dgram.Socket;
  private elasticLogger: winston.Logger;
  tracer: tracer.JaegerTracer;
  UDPLogger = new Logger('UDP-Server', {
    timestamp: true,
  });

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
        // logData['payload'] = JSON.stringify(logData['payload']);
        // typeof logData['payload'] == 'string'
        //   ? logData['payload']
        //   : ;
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

  initTracer(serviceName: string) {
    const config = {
      serviceName,
      traceId128bit: true,
      reporter: {
        collectorEndpoint: 'http://jaeger:14268/api/traces',
      },
      sampler: {
        type: 'const',
        param: 1,
      },
    };

    const options = {};
    this.tracer = tracer.initTracer(config, options);
  }

  handleUDPMessage(message: string) {
    if (message.includes('API-LOG')) {
      const logData = JSON.parse(message.split('[API-LOG] ')[1]);
      this.enqueueHandleLog('http.log', logData);
    } else if (message.includes('DEV-LOG')) {
      const logData = JSON.parse(message.split('[DEV-LOG] ')[1]);
      this.enqueueHandleLog('dev.log', logData);
    } else if (message.includes('JAEGER-LOG')) {
      const logData = JSON.parse(message.split('[JAEGER-LOG] ')[1]);
      this.enqueueHandleLog('jaeger.log', logData);
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
    try {
      const { offset, value } = context.getMessage();
      // console.log(value);
      this.elasticLogger.info(value);
      const partition = context.getPartition();
      const topic = context.getTopic();
      await this.client.commitOffsets([{ topic, partition, offset }]);
    } catch (e) {
      console.log(e);
    }
  }

  @EventPattern('dev.log')
  async handleDevLogs(
    @Payload() payload: IncomingMessage,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const { offset, value } = context.getMessage();
      this.elasticLogger.info(value);
      // console.log(value);

      const partition = context.getPartition();
      const topic = context.getTopic();
      await this.client.commitOffsets([{ topic, partition, offset }]);
    } catch (e) {
      console.log(e);
    }
  }

  @EventPattern('jaeger.log')
  async handleJaegerLogs(
    @Payload() payload: IncomingMessage,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const { offset, value } = context.getMessage();
      // this.sendTraceToJaeger(value);
      const partition = context.getPartition();
      const topic = context.getTopic();
      await this.client.commitOffsets([{ topic, partition, offset }]);
    } catch (e) {
      console.log(e);
    }
  }

  sendTraceToJaeger(logData: any) {
    const { payload, service } = logData;
    this.initTracer(service);

    const span = this.tracer.startSpan(payload.name, {
      startTime: payload.timestamp / 1000,
      tags: payload.tags,
    });

    const httpTags: { [key: string]: any } = {};
    httpTags['method'] = payload.tags['http.method'];
    httpTags['url'] = payload.tags['http.url'];
    httpTags['status_code'] = payload.tags['http.status_code'];
    httpTags['body'] = payload.tags['http.body'];
    httpTags['query'] = payload.tags['http.query'];

    span.setTag('http', httpTags);

    const errorTags: { [key: string]: any } = {};
    errorTags['value'] = payload.tags['error'];
    errorTags['message'] = payload.tags['error.message'];

    span.setTag('error', errorTags);

    span.finish(payload.timestamp / 1000 + (payload.duration || 0)); // Convert to microseconds

    this.tracer.close();
  }
}
