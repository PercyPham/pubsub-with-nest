import { Inject, Injectable } from '@nestjs/common';
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

  public publishOrderCreatedWithMessage(message: string): void {
    this.orderCreatedEventPublisher.publishEventWith(message);
  }
}
