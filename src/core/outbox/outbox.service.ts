import { Inject, Injectable } from '@nestjs/common';
import { Context } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import {
  OutboxDispatcherRegistry,
  OutboxDispatcherRegistrySymbol,
} from './outbox.dispatcher-registry';
import { OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxServiceSymbol = Symbol('OutboxService');

export interface OutboxService {
  registerOutboxDispatcher<T extends OutboxType>(
    outboxType: T,
    dispatcher: OutboxDispatcher<T>,
  ): void;

  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;
}

@Injectable()
export class OutboxServiceImpl implements OutboxService {
  constructor(
    @Inject(OutboxDispatcherRegistrySymbol)
    private readonly outboxDispatcherRegistry: OutboxDispatcherRegistry,
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
  ) {}

  registerOutboxDispatcher<T extends OutboxType>(
    outboxType: T,
    dispatcher: OutboxDispatcher<T>,
  ): void {
    this.outboxDispatcherRegistry.registerOutboxDispatcher(
      outboxType,
      dispatcher,
    );
  }

  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void> {
    return this.outboxRepo.add(ctx, outbox);
  }
}
