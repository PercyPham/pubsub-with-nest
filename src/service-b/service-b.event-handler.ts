import { Inject, Injectable } from '@nestjs/common';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';

import {
  OrderCreatedTopicService,
  OrderCreatedTopic,
  OrderCreatedEvent,
} from 'src/service-a-contract/order-created.topic';
import { OrderCreatedCommand } from 'src/service-a-contract/order-created.command';
import { OrderUpdatedCommand } from 'src/service-a-contract/order-updated.command';

export const ServiceBEventHandlerSymbol = Symbol('ServiceBEventHandler');
@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(OrderCreatedTopic)
    private readonly orderCreatedTopic: OrderCreatedTopicService,
    @Inject(CommandServiceSymbol)
    private readonly commandService: CommandService,
  ) {
    this.orderCreatedTopic.registerSubscriber(this.logEvent);

    this.commandService.registerSubscriberToCommand(
      OrderCreatedCommand,
      async (payload) => {
        console.log('payload', payload);
      },
    );

    this.commandService.registerSubscriberToCommand(
      OrderUpdatedCommand,
      async (payload) => {
        console.log('payload', payload);
      },
    );
  }

  logEvent(event: OrderCreatedEvent) {
    const topic = event.topic.toString();
    const orderID = event.data?.orderID;
    console.log(
      `> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}`,
    );
  }
}
