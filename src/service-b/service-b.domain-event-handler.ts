import { Inject, Injectable } from '@nestjs/common';
import { Context } from 'src/core/context';
import {
  DomainEvent,
  DomainEventPubSubService,
  DomainEventPubSubServiceSymbol,
} from 'src/core/domain-event';
import { OrderCreatedDomainEvent } from 'src/service-a-contract';

export const ServiceBDomainEventHandlerSymbol = Symbol(
  'ServiceBDomainEventHandler',
);

@Injectable()
export class ServiceBDomainEventHandler {
  constructor(
    @Inject(DomainEventPubSubServiceSymbol)
    private readonly domainEventPubSubService: DomainEventPubSubService,
  ) {
    this.domainEventPubSubService.subscribe(
      OrderCreatedDomainEvent,
      this.logEvent.bind(this),
    );
  }

  async logEvent(
    ctx: Context,
    event: DomainEvent<typeof OrderCreatedDomainEvent>,
  ): Promise<void> {
    const timestamp = ctx.getTimestamp();
    const topic = event.type.toString();
    const orderID = event.msg.orderID;

    console.log(
      `> ${timestamp}: Log from Service B: receiving domain-event: ${topic}: with orderID: ${orderID}`,
    );
  }
}
