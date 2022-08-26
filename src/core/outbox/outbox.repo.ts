import { Timestamp } from '../common/data.types';
import { Context } from '../context';
import { Outbox, OutboxId, OutboxType } from './outbox';

export const OutboxRepoSymbol = Symbol('OutboxRepo');

export enum SortingOptions {
  ASC = 'asc',
  DESC = 'desc',
}

export interface OutboxRepo {
  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;

  getByIds(ctx: Context, ids: OutboxId[]): Promise<Outbox<any>[]>;

  getNotYetDespatchedOutboxes(
    ctx: Context,
    options?: {
      lastTryBefore?: Timestamp;
      maxTryCount?: number;
      limit?: number;
      sortLastTryAt?: SortingOptions;
    },
  ): Promise<Outbox<any>[]>;

  update<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;

  updateMany(ctx: Context, outboxes: Outbox<any>[]): Promise<void>;

  removeById(ctx: Context, id: OutboxId): Promise<void>;
}
