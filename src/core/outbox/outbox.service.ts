import { Inject, Injectable } from '@nestjs/common';
import { Context } from '../context';
import { Outbox, OutboxHandler, OutboxType } from './outbox';
import {
  OutboxHandlerRegistry,
  OutboxHandlerRegistrySymbol,
} from './outbox.handler-registry';
import { OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxServiceSymbol = Symbol('OutboxService');

export interface OutboxService {
  registerOutboxHandler<T extends OutboxType>(
    outboxType: T,
    handler: OutboxHandler<T>,
  ): void;

  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;
}

@Injectable()
export class OutboxServiceImpl implements OutboxService {
  constructor(
    @Inject(OutboxHandlerRegistrySymbol)
    private readonly outboxHandlerRegistry: OutboxHandlerRegistry,
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
  ) {}

  registerOutboxHandler<T extends OutboxType>(
    outboxType: T,
    handler: OutboxHandler<T>,
  ): void {
    this.outboxHandlerRegistry.registerOutboxHandler(outboxType, handler);
  }

  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void> {
    return this.outboxRepo.add(ctx, outbox);
  }
}
