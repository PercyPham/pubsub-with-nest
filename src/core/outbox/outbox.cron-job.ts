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

@Injectable()
export class OutboxCronJobImpl implements OutboxCronJob {
  constructor(
    @Inject(ContextServiceSymbol)
    private readonly ctxService: ContextService,
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
    @Inject(OutboxDispatcherServiceSymbol)
    private readonly outboxDispatcherService: OutboxDispatcherService,
  ) {}

  start(): void {
    setInterval(async () => {
      await this.dispatchNotYetDespatchedOutboxes();
    }, CRON_JOB_INTERVAL);
  }

  async dispatchNotYetDespatchedOutboxes(): Promise<void> {
    const ctx = this.ctxService.createNewContext();

    const outboxes = await this.outboxRepo.getNotYetDespatchedOutboxes(ctx, {
      lastTryBefore: Date.now() - 10 * 1000, // 10s ago
      maxTryCount: MAX_TRY_ALLOWED - 1,
    });
    if (!outboxes.length) return;

    outboxes.forEach((outbox) => {
      this.outboxDispatcherService.dispatch(outbox).catch((err) => {
        console.log(
          `Error: dispatching outbox: ${JSON.stringify(outbox)}\n`,
          err,
        );
      });
    });
  }
}
