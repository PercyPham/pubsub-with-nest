import { Injectable } from '@nestjs/common';
import { Context } from '../../context';
import { EventHandler, EventMsgContract } from '../contract';
import { Event } from '../contract';
import { genNewEventID, PubSubService, Unsubscribe } from '../pubsub.service';

export type EventHandlingExceptionHandler = (e: Error) => Promise<void> | void;

let eventHandlingExceptionHandler: EventHandlingExceptionHandler | null = null;

export function registerEventHandlingExceptionHandler(
  handler: EventHandlingExceptionHandler,
): void {
  if (eventHandlingExceptionHandler) {
    throw new Error('duplicate event handling exception handler');
  }
  eventHandlingExceptionHandler = handler;
}

@Injectable()
export class SimplePubSubServiceImpl implements PubSubService {
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
    ctx: Context,
    topic: T,
    eventMsg: EventMsgContract[T],
  ): Promise<void> {
    const event = this.genEvent(ctx, topic, eventMsg);
    const handlers = this.registry.get(topic);
    if (!handlers || handlers.length === 0) return;
    handlers.forEach((handler) => {
      this.handleEvent(ctx, handler, event);
    });
  }

  private genEvent<T extends keyof EventMsgContract>(
    ctx: Context,
    topic: T,
    eventMsg: EventMsgContract[T],
  ): Event<T> {
    return {
      id: genNewEventID(),
      topic: topic,
      msg: eventMsg,
      createdAt: ctx.getTimestamp(),
    };
  }

  private async handleEvent(
    ctx: Context,
    eventHandler: EventHandler<any>,
    event: Event<any>,
  ): Promise<void> {
    try {
      await eventHandler(ctx, event);
    } catch (err) {
      if (eventHandlingExceptionHandler) {
        await eventHandlingExceptionHandler(err);
      } else {
        console.log(err);
      }
    }
  }
}
