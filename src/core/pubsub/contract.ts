const PlaceholderEvent = Symbol('PlaceholderEvent');

export interface EventMsgContract {
  [PlaceholderEvent]: never;
}

export type Event<T extends keyof EventMsgContract> = {
  topic: T;
  msg: EventMsgContract[T];
};

export type EventHandler<T extends keyof EventMsgContract> = (
  event: Event<T>,
) => Promise<void>;
