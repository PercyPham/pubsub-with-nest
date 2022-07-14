import { Inject, Injectable } from '@nestjs/common';
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
  ) {}

  public createOrderWithID(orderID: number): void {
    const eventData: OrderCreatedEventData = { orderID };
    this.orderCreatedEventPublisher.publishEventWith(eventData);
  }
}
