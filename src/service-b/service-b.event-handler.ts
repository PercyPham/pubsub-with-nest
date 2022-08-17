import { Inject, Injectable } from '@nestjs/common';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { Event } from 'src/core/pubsub/contract';
import {
  PubSubService,
  PubSubServiceSymbol,
} from 'src/core/pubsub/pubsub.service';

import { OrderCreatedCommand } from 'src/service-a-contract/order-created.command';
import { OrderCreated } from 'src/service-a-contract/order-created.event';
import { OrderUpdatedCommand } from 'src/service-a-contract/order-updated.command';

export const ServiceBEventHandlerSymbol = Symbol('ServiceBEventHandler');
@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(PubSubServiceSymbol)
    private readonly pubsub: PubSubService,
    @Inject(CommandServiceSymbol)
    private readonly commandService: CommandService,
  ) {
    this.pubsub.subscribe(OrderCreated, this.logEvent);

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

  async logEvent(event: Event<typeof OrderCreated>): Promise<void> {
    const topic = event.topic.toString();
    const orderID = event.msg.orderID;
    console.log(
      `> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}`,
    );
  }
}
