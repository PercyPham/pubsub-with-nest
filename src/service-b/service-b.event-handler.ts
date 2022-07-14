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
    const topic = event.topic.toString();
    const orderID = event.data?.orderID;
    console.log(
      `> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}`,
    );
  }
}
