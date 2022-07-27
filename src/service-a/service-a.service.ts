import { Inject, Injectable } from '@nestjs/common';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command-handler/command.service';
import { OrderCreatedCommand } from 'src/service-a-contract/order-created.command';
import { OrderCreatedEventData } from 'src/service-a-contract/order-created.topic';
import {
  OrderCreatedEventPublisher,
  OrderCreatedEventPublisherSymbol,
} from './order-created.event-publisher';

export const ServiceAServiceSymbol = Symbol('ServiceAService');

@Injectable()
export class ServiceAService {
  constructor(
    @Inject(OrderCreatedEventPublisherSymbol)
    private readonly orderCreatedEventPublisher: OrderCreatedEventPublisher,
    @Inject(CommandServiceSymbol)
    private readonly commandService: CommandService,
  ) {}

  public createOrderWithID(orderID: number): void {
    const eventData: OrderCreatedEventData = { orderID };
    this.orderCreatedEventPublisher.publishEventWith(eventData);

    // publish command
    this.commandService.triggerEventsToCommandSubscribers(
      OrderCreatedCommand,
      eventData,
    );
  }
}
