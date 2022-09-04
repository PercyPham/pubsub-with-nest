import { Inject, Injectable } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from '../context';
import {
  CRON_JOB_INTERVAL,
  OUTBOX_MAX_TRY_ALLOWED,
  OutboxCronJob,
  OUTBOX_DISPATCHING_BATCH_LIMIT,
  OUTBOX_WAITING_TIME_BEFORE_RETRY,
} from './outbox.cronjob';
import {
  OutboxDispatcherService,
  OutboxDispatcherServiceSymbol,
} from './outbox.dispatcher.service';
import { SortingOptions, OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

@Injectable()
export class OutboxCronJobSimpleImpl implements OutboxCronJob {
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

  async dispatchNotYetDespatchedOutboxes(): Promise<void> {
    const ctx = this.ctxService.createNewContext();

    const outboxes = await this.outboxRepo.getNotYetDespatchedOutboxes(ctx, {
      lastTryBefore: Date.now() - OUTBOX_WAITING_TIME_BEFORE_RETRY,
      maxTryCount: OUTBOX_MAX_TRY_ALLOWED - 1,
      sortLastTryAt: SortingOptions.ASC,
      limit: OUTBOX_DISPATCHING_BATCH_LIMIT,
    });
    if (!outboxes.length) return;

    await this.outboxDispatcherService.tryDispatching(ctx, outboxes);
  }
}
