import { Injectable } from '@nestjs/common';
import { EventHandler, EventMsgContract } from './contract';
import { Event } from './contract';

export const PubSubServiceSymbol = Symbol('PubSubService');

export interface PubSubService {
  subscribe<T extends keyof EventMsgContract>(
    topic: T,
    handler: EventHandler<T>,
  ): Promise<Unsubscribe>;

  publish<T extends keyof EventMsgContract>(event: Event<T>): Promise<void>;
}

export type Unsubscribe = () => Promise<void>;

@Injectable()
export class PubSubServiceImpl implements PubSubService {
  private readonly registry = new Map<symbol, EventHandler<any>[]>();

  public async subscribe<T extends keyof EventMsgContract>(
    topic: T,
    handler: EventHandler<T>,
  ): Promise<Unsubscribe> {
    if (!this.registry.get(topic)) {
      this.registry.set(topic, []);
    }
    this.registry.get(topic).push(handler);
    const unsubscribe = async () => {
      const handlers = this.registry.get(topic).filter((h) => h !== handler);
      this.registry.set(topic, handlers);
    };
    return unsubscribe;
  }

  public async publish<T extends keyof EventMsgContract>(
    event: Event<T>,
  ): Promise<void> {
    const handlers = this.registry.get(event.topic);
    if (!handlers || handlers.length === 0) return;
    for (const handler of handlers) {
      setTimeout(() => handler(event), 0);
    }
  }
}
