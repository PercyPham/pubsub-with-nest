import { Inject, Injectable } from '@nestjs/common';
import {
  EventPublisher,
  PubSubService,
  PubSubServiceSymbol,
} from 'src/core/pubsub/pubsub.service';
import {
  OrderCreatedEventData,
  OrderCreatedTopic,
} from 'src/service-a-contract/order-created.topic';

export const OrderCreatedEventPublisherSymbol = Symbol(
  'OrderCreatedEventPublisher',
);

@Injectable()
export class OrderCreatedEventPublisher extends EventPublisher<OrderCreatedEventData> {
  constructor(
    @Inject(PubSubServiceSymbol)
    psService: PubSubService,
  ) {
    super(OrderCreatedTopic, psService);
  }
}
