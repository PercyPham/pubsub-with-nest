import { Injectable } from '@nestjs/common';
import { OutboxDispatcher, OutboxType } from './outbox';

export const OutboxDispatcherRegistrySymbol = Symbol(
  'OutboxDispatcherRegistry',
);

@Injectable()
export class OutboxDispatcherRegistry {
  private readonly registry = new Map<string, OutboxDispatcher<any>>();

  registerOutboxDispatcher<T extends OutboxType>(
    outboxType: T,
    dispatcher: OutboxDispatcher<T>,
  ): void {
    const found = this.registry.get(outboxType);
    if (found) {
      throw new Error(`duplicate outbox dispatcher for "${outboxType}"`);
    }
    this.registry.set(outboxType, dispatcher);
  }

  mustGetDispatcher<T extends OutboxType>(outboxType: T): OutboxDispatcher<T> {
    const dispatcher = this.registry.get(outboxType);
    if (!dispatcher) {
      throw new Error(`outbox dispatcher for "${outboxType}" not found`);
    }
    return dispatcher;
  }
}
