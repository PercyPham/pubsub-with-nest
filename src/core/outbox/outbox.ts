import { Timestamp } from '../common/data.types';
import { Context } from '../context';

const PlaceholderOutBox = 'PlaceholderOutbox';

/**
 * @key [string] outbox type
 * @value [interface] outbox data
 */
export interface OutboxContract {
  [PlaceholderOutBox]: unknown;
}

export type OutboxType = keyof OutboxContract;

/** uuid */
export type OutboxID = string;

export type Outbox<T extends OutboxType> = {
  id: OutboxID;
  type: T;
  data: OutboxContract[T];
  tryCount: number;
  lastTryAt: Timestamp;
  createdAt: Timestamp;
};

export type OutboxDispatcher<T extends OutboxType> = (
  ctx: Context,
  outbox: Outbox<T>,
) => Promise<void>;
