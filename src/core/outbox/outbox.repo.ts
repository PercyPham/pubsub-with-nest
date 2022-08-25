import { Timestamp } from '../common/data.types';
import { Context } from '../context';
import { Outbox, OutboxID, OutboxType } from './outbox';

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

  removeOutbox(ctx: Context, id: OutboxID): Promise<void>;
}
