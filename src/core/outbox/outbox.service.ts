import { Inject, Injectable } from '@nestjs/common';
import { Context } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import { OutboxCronJob, OutboxCronJobSymbol } from './outbox.cron-job';
import {
  DispatchErrorHandler,
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

  registerDispatchErrorHandler(handler: DispatchErrorHandler): void;

  startOutboxDispatchingCronJob(): void;

  addAndTriggerDispatchingImmediately<T extends OutboxType>(
    ctx: Context,
    outbox: Outbox<T>,
  ): Promise<void>;
}

@Injectable()
export class OutboxServiceImpl implements OutboxService {
  constructor(
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
    @Inject(OutboxDispatcherServiceSymbol)
    private readonly outboxDispatcherService: OutboxDispatcherService,
    @Inject(OutboxCronJobSymbol)
    private readonly outboxCronJob: OutboxCronJob,
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

  registerDispatchErrorHandler(handler: DispatchErrorHandler): void {
    this.outboxDispatcherService.registerDispatchErrorHandler(handler);
  }

  startOutboxDispatchingCronJob(): void {
    this.outboxCronJob.start();
  }

  async addAndTriggerDispatchingImmediately<T extends OutboxType>(
    ctx: Context,
    outbox: Outbox<T>,
  ): Promise<void> {
    await this.outboxRepo.add(ctx, outbox);
    this.outboxDispatcherService.triggerDispatching(outbox);
  }
}
