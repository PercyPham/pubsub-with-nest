import { Module } from '@nestjs/common';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import {
  OrderCreatedTopicService,
  OrderCreatedTopic,
} from './order-created.topic';

@Module({
  imports: [PubSubModule],
  providers: [
    {
      provide: OrderCreatedTopic,
      useClass: OrderCreatedTopicService,
    },
  ],
  exports: [OrderCreatedTopic],
})
export class ServiceAContractModule {}
