import { Context } from '../context';
import {
  DomainEventHandler,
  DomainEventContract,
  DomainEventType,
} from './domain-event';

export const DomainEventPubSubServiceSymbol = Symbol(
  'DomainEventPubSubService',
);

type Unsubscribe = () => void;

export interface DomainEventPubSubService {
  subscribe<T extends DomainEventType>(
    domainEventType: T,
    handler: DomainEventHandler<T>,
  ): Unsubscribe;

  publish<T extends DomainEventType>(
    ctx: Context,
    domainEventType: T,
    domainEventMsg: DomainEventContract[T],
  ): Promise<void>;
}

export class DomainEventPubSubServiceImpl implements DomainEventPubSubService {
  private readonly registry = new Map<symbol, DomainEventHandler<any>[]>();

  subscribe<T extends DomainEventType>(
    domainEventType: T,
    handler: DomainEventHandler<T>,
  ): Unsubscribe {
    if (!this.registry.get(domainEventType)) {
      this.registry.set(domainEventType, []);
    }
    this.registry.get(domainEventType).push(handler);
    const unsubscribe = async () => {
      const handlers = this.registry
        .get(domainEventType)
        .filter((h) => h !== handler);
      this.registry.set(domainEventType, handlers);
    };
    return unsubscribe;
  }

  async publish<T extends DomainEventType>(
    ctx: Context,
    domainEventType: T,
    domainEventMsg: DomainEventContract[T],
  ): Promise<void> {
    const domainEvent = {
      type: domainEventType,
      msg: domainEventMsg,
    };
    const handlers = this.registry.get(domainEventType);
    if (!handlers || !handlers.length) return;
    await Promise.all(handlers.map((handler) => handler(ctx, domainEvent)));
  }
}
