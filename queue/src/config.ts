import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['kafka:9092'],
      clientId: 'queue-clientId',
    },
    consumer: {
      groupId: 'log-processor-group1',
      allowAutoTopicCreation: true,
    },
    producer: {
      createPartitioner: Partitioners.LegacyPartitioner,
    },
    run: {
      autoCommit: false,
    },
  },
};
