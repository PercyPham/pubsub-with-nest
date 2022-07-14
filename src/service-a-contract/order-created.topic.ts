import { Inject, Injectable } from '@nestjs/common';
import {
  DomainEvent,
  EventTopic,
  PubSubService,
  PubSubServiceSymbol,
} from 'src/core/pubsub/pubsub.service';

export const OrderCreatedTopic = Symbol('OrderCreated');

export type OrderCreatedEventData = { orderID: number };
export type OrderCreatedEvent = DomainEvent<OrderCreatedEventData>;

@Injectable()
export class OrderCreatedTopicService extends EventTopic<OrderCreatedEventData> {
  constructor(
    @Inject(PubSubServiceSymbol)
    psService: PubSubService,
  ) {
    super(OrderCreatedTopic, psService);
  }
}
