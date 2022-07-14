import { Inject, Injectable } from '@nestjs/common';
import {
  OrderCreatedTopicService,
  OrderCreatedTopic,
  OrderCreatedEvent,
} from 'src/service-a-contract/order-created.topic';

export const ServiceBEventHandlerSymbol = Symbol('ServiceBEventHandler');

@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(OrderCreatedTopic)
    private readonly orderCreatedTopic: OrderCreatedTopicService,
  ) {
    this.orderCreatedTopic.registerSubscriber(this.logEvent);
  }

  logEvent(event: OrderCreatedEvent) {
    console.log(
      `> Log from Service B: receiving event: ${JSON.stringify(event)}`,
    );
  }
}
