import { Inject, Injectable } from '@nestjs/common';
import { Context, ContextService, ContextServiceSymbol } from '../context';
import { Outbox, OutboxType } from './outbox';
import {
  OutboxDispatcherRegistry,
  OutboxDispatcherRegistrySymbol,
} from './outbox.dispatcher-registry';
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
    @Inject(OutboxDispatcherRegistrySymbol)
    private readonly outboxDispatcherRegistry: OutboxDispatcherRegistry,
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
      this.dispatchOutbox(ctx, outbox).catch((err) => {
        console.log(
          `Error: dispatching outbox: ${JSON.stringify(outbox)}\n`,
          err,
        );
      });
    });
  }

  async dispatchOutbox<T extends OutboxType>(
    ctx: Context,
    outbox: Outbox<T>,
  ): Promise<void> {
    const dispatcher = this.outboxDispatcherRegistry.mustGetDispatcher(
      outbox.type,
    );

    // update try-count independently so it doesn't depend on success/failure of outbox handling
    outbox.lastTryAt = ctx.getTimestamp();
    outbox.tryCount++;
    await this.outboxRepo.update(ctx, outbox);

    const [trxCtx, trxFinisher] = ctx.withTransaction();
    try {
      await this.outboxRepo.removeOutbox(trxCtx, outbox.id);
      await dispatcher(trxCtx, outbox); // must be the last operation before committing transaction
      await trxFinisher.commit();
    } catch (err) {
      console.log(`Error: handling outbox: ${JSON.stringify(outbox)}\n`, err);
      await trxFinisher.rollback();
    }
  }
}
