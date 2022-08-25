import { Inject, Injectable } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from '../context';
import {
  OutboxDispatcherService,
  OutboxDispatcherServiceSymbol,
} from './outbox.dispatcher.service';
import { OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxCronJobSymbol = Symbol('OutboxCronJob');

export interface OutboxCronJob {
  start(): void;
}

const CRON_JOB_INTERVAL = 500;
const MAX_TRY_ALLOWED = 3;
const BATCH_LIMIT = 100;

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
    setInterval(this.dispatchNotYetDespatchedOutboxes, CRON_JOB_INTERVAL);
    this.cronjobStarted = true;
  }

  async dispatchNotYetDespatchedOutboxes(): Promise<void> {
    const ctx = this.ctxService.createNewContext();

    const outboxes = await this.outboxRepo.getNotYetDespatchedOutboxes(ctx, {
      lastTryBefore: Date.now() - 10 * 1000, // 10s ago
      maxTryCount: MAX_TRY_ALLOWED - 1,
      limit: BATCH_LIMIT,
    });
    if (!outboxes.length) return;

    outboxes.forEach((outbox) =>
      this.outboxDispatcherService.triggerDispatching(outbox),
    );
  }
}
