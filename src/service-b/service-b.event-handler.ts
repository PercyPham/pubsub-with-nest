import { Inject, Injectable } from '@nestjs/common';
import { Event } from 'src/core/pubsub/contract';
import { PubSubService, PubSubServiceSymbol } from 'src/core/pubsub';

import { OrderCreated } from 'src/service-a-contract';
import { Context } from 'src/core/context';

export const ServiceBEventHandlerSymbol = Symbol('ServiceBEventHandler');
@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(PubSubServiceSymbol)
    private readonly pubsub: PubSubService,
  ) {
    this.pubsub.subscribe(OrderCreated, this.logEvent);
  }

  async logEvent(
    ctx: Context,
    event: Event<typeof OrderCreated>,
  ): Promise<void> {
    const timestamp = ctx.getTimestamp();
    const topic = event.topic.toString();
    const orderID = event.msg.orderID;
    console.log(
      `> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}: at: ${timestamp}`,
    );
  }
}
