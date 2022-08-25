import { Inject, Injectable } from '@nestjs/common';
import { Context } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import {
  OutboxDispatcherService,
  OutboxDispatcherServiceSymbol,
} from './outbox.dispatcher.service';
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
    @Inject(OutboxDispatcherServiceSymbol)
    private readonly outboxDispatcherService: OutboxDispatcherService,
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
  ) {}

  registerOutboxDispatcher<T extends OutboxType>(
    outboxType: T,
    dispatcher: OutboxDispatcher<T>,
  ): void {
    this.outboxDispatcherService.registerOutboxDispatcher(
      outboxType,
      dispatcher,
    );
  }

  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void> {
    return this.outboxRepo.add(ctx, outbox);
  }
}
