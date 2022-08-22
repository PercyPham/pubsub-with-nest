import { Context } from '../context';

const PlaceholderEvent = Symbol('PlaceholderEvent');

export interface EventMsgContract {
  [PlaceholderEvent]: never;
}

/** uuid */
export type EventID = string;
/** milliseconds since epoch */
export type Timestamp = number;

export type Event<T extends keyof EventMsgContract> = {
  id: EventID;
  topic: T;
  msg: EventMsgContract[T];
  createdAt: Timestamp;
};

export type EventHandler<T extends keyof EventMsgContract> = (
  ctx: Context,
  event: Event<T>,
) => Promise<void>;
