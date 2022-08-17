const ExampleTopic = Symbol('ExampleTopic');

export interface EventMsgContract {
  [ExampleTopic]: never;
}

export type Event<T extends keyof EventMsgContract> = {
  topic: T;
  msg: EventMsgContract[T];
};

export type EventHandler<T extends keyof EventMsgContract> = (
  event: Event<T>,
) => Promise<void>;
