import { Injectable } from '@nestjs/common';

export type DomainEvent<Data> = {
  topic: symbol;
  data?: Data;
};

export type EventCreator<EventData> = {
  create: (data: EventData) => DomainEvent<EventData>;
};

export class EventCreatorFactory {
  static createForTopic<EventData>(topic: symbol): EventCreator<EventData> {
    return {
      create: (data: EventData) => ({ topic, data }),
    };
  }
}

export type EventHandler<E> = (e: E) => void;

export type Unsubscribe = () => void;

export abstract class EventTopic<Data> {
  constructor(
    private readonly topic: symbol,
    private readonly psService: PubSubService,
  ) {}

  registerSubscriber(
    eventHandler: EventHandler<DomainEvent<Data>>,
  ): Unsubscribe {
    return this.psService.subscribe(this.topic, eventHandler);
  }
}

export abstract class EventPublisher<EventData> {
  private readonly eventCreator: EventCreator<EventData>;
  constructor(
    private readonly topic: symbol,
    private readonly psService: PubSubService,
  ) {
    this.eventCreator = EventCreatorFactory.createForTopic(this.topic);
  }

  public createEvent(data: EventData): DomainEvent<EventData> {
    return this.eventCreator.create(data);
  }

  public publish(event: DomainEvent<EventData>): void {
    return this.psService.publish<EventData>(event);
  }

  public publishEventWith(data: EventData): void {
    return this.psService.publish(this.createEvent(data));
  }
}

export const PubSubServiceSymbol = Symbol('PubSubService');

@Injectable()
export class PubSubService {
  private readonly pubsub: Map<symbol, EventHandler<DomainEvent<any>>[]>;

  constructor() {
    this.pubsub = new Map();
  }

  public subscribe<Data>(
    topic: symbol,
    handler: EventHandler<DomainEvent<Data>>,
  ): Unsubscribe {
    if (!this.pubsub.get(topic)) {
      this.pubsub.set(topic, []);
    }
    this.pubsub.get(topic).push(handler);
    return () => {
      const handlers = this.pubsub.get(topic).filter((h) => h !== handler);
      this.pubsub.set(topic, handlers);
    };
  }

  public publish<Data>(event: DomainEvent<Data>): void {
    const handlers = this.pubsub.get(event.topic);
    if (!handlers || handlers.length === 0) {
      return;
    }
    for (const handler of handlers) {
      setTimeout(() => handler(event), 0);
    }
  }
}
