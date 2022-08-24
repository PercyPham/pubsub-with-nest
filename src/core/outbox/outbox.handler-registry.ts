import { Injectable } from '@nestjs/common';
import { OutboxHandler, OutboxType } from './outbox';

export const OutboxHandlerRegistrySymbol = Symbol('OutboxHandlerRegistry');

@Injectable()
export class OutboxHandlerRegistry {
  private readonly registry = new Map<string, OutboxHandler<any>>();

  registerOutboxHandler<T extends OutboxType>(
    outboxType: T,
    handler: OutboxHandler<T>,
  ): void {
    const foundHandler = this.registry.get(outboxType);
    if (foundHandler) {
      throw new Error(`duplicate outbox handler for "${outboxType}"`);
    }
    this.registry.set(outboxType, handler);
  }

  mustGetHandler<T extends OutboxType>(outboxType: T): OutboxHandler<T> {
    const handler = this.registry.get(outboxType);
    if (!handler) {
      throw new Error(`outbox handler for "${outboxType}" not found`);
    }
    return handler;
  }
}
