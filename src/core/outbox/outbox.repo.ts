import { Timestamp } from '../common/data.types';
import { Context } from '../context';
import { Outbox, OutboxType } from './outbox';

export const OutboxRepoSymbol = Symbol('OutboxRepo');

export interface OutboxRepo {
  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;

  getNotYetDespatchedOutboxes(
    ctx: Context,
    options?: {
      lastTryBefore?: Timestamp;
      maxTryCount?: number;
    },
  ): Promise<Outbox<any>[]>;

  update<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;

  removeDespatchedOutboxes(
    ctx: Context,
    options?: {
      createdBefore?: Timestamp;
    },
  ): Promise<void>;
}
