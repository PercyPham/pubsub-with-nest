import { Module } from '@nestjs/common';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import {
  OrderCreatedEventPublisher,
  OrderCreatedEventPublisherSymbol,
} from './order-created.event-publisher';
import { ServiceAController } from './service-a.controller';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Module({
  imports: [PubSubModule],
  controllers: [ServiceAController],
  providers: [
    {
      provide: OrderCreatedEventPublisherSymbol,
      useClass: OrderCreatedEventPublisher,
    },
    {
      provide: ServiceAServiceSymbol,
      useClass: ServiceAService,
    },
  ],
})
export class ServiceAModule {}
