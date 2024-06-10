import { Controller, Inject, Post } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { IncomingMessage } from 'http';
import { KAFKA_MODULE } from 'ngthminhdev-nestjs-kafka';

@Controller()
export class AppController {
  constructor(@Inject(KAFKA_MODULE) private readonly client: ClientKafka) {}

  async onModuleInit() {
    const requestPatterns = ['logging'];

    requestPatterns.forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
  }

  @Post()
  async sendPattern() {
    this.client.emit<string>('logging', 'some entity ' + new Date());
  }

  @EventPattern('logging')
  async handleEntityCreated(
    @Payload() payload: IncomingMessage,
    @Ctx() context: KafkaContext,
  ) {
    // const position = await this.client.getConsumerAssignments({
    //   topic,
    //   partition,
    // });
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
