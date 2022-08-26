import { Inject, Injectable } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from '../context';
import {
  OutboxDispatcherService,
  OutboxDispatcherServiceSymbol,
} from './outbox.dispatcher.service';
import { SortingOptions, OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxCronJobSymbol = Symbol('OutboxCronJob');

export interface OutboxCronJob {
  start(): void;
}

const CRON_JOB_INTERVAL = 500;
const WAITING_TIME_BEFORE_RETRY = 10 * 1000; // 10 seconds
const MAX_TRY_ALLOWED = 3;
const OUTBOX_DISPATCHING_BATCH_LIMIT = 100;

@Injectable()
export class OutboxCronJobImpl implements OutboxCronJob {
  private cronjobStarted = false;

  constructor(
    @Inject(ContextServiceSymbol)
    private readonly ctxService: ContextService,
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
    @Inject(OutboxDispatcherServiceSymbol)
    private readonly outboxDispatcherService: OutboxDispatcherService,
  ) {}

  start(): void {
    if (this.cronjobStarted) {
      throw new Error('duplicate call to start outbox cronjob');
    }
    this.cronjobStarted = true;
    setInterval(async () => {
      await this.dispatchNotYetDespatchedOutboxes();
    }, CRON_JOB_INTERVAL);
  }

  private sleep = (ms: number): Promise<void> =>
    new Promise((res) => {
      setTimeout(res, ms);
    });

  async dispatchNotYetDespatchedOutboxes(): Promise<void> {
    const ctx = this.ctxService.createNewContext();

    const outboxes = await this.outboxRepo.getNotYetDespatchedOutboxes(ctx, {
      lastTryBefore: Date.now() - WAITING_TIME_BEFORE_RETRY,
      maxTryCount: MAX_TRY_ALLOWED - 1,
      limit: OUTBOX_DISPATCHING_BATCH_LIMIT,
      sortLastTryAt: SortingOptions.ASC,
    });
    if (!outboxes.length) return;

    await this.outboxDispatcherService.tryDispatching(ctx, outboxes);
  }
}
