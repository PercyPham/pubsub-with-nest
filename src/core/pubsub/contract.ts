import { Timestamp } from 'src/core/common/data.types';

const PlaceholderEvent = Symbol('PlaceholderEvent');

export interface EventMsgContract {
  [PlaceholderEvent]: never;
}

/** uuid */
export type EventID = string;

export type Event<T extends keyof EventMsgContract> = {
  id: EventID;
  topic: T;
  msg: EventMsgContract[T];
  createdAt: Timestamp;
};

export type EventHandler<T extends keyof EventMsgContract> = (
  event: Event<T>,
) => Promise<void>;
