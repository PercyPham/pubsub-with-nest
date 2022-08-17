/* eslint-disable @typescript-eslint/no-empty-interface */
export interface EventMsgContract {}

export type Event<T extends keyof EventMsgContract> = {
  topic: T;
  msg: EventMsgContract[T];
};

export type EventHandler<T extends keyof EventMsgContract> = (
  event: Event<T>,
) => Promise<void>;
