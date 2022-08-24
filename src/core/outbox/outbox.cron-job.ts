import { Inject, Injectable } from '@nestjs/common';
import { Context, ContextService, ContextServiceSymbol } from '../context';
import { OutboxRepoSymbol } from '../pubsub/outbox';
import { Outbox, OutboxType } from './outbox';
import {
  OutboxHandlerRegistry,
  OutboxHandlerRegistrySymbol,
} from './outbox.handler-registry';
import { OutboxRepo } from './outbox.repo';

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
    @Inject(OutboxHandlerRegistrySymbol)
    private readonly outboxHandlerRegistry: OutboxHandlerRegistry,
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
    const handler = this.outboxHandlerRegistry.mustGetHandler(outbox.type);

    outbox.lastTryAt = ctx.getTimestamp();
    outbox.tryCount++;
    await this.outboxRepo.update(ctx, outbox);

    const [trxCtx, trxFinisher] = ctx.withTransaction();
    try {
      outbox.despatched = true;
      await this.outboxRepo.update(trxCtx, outbox);
      await handler(ctx, outbox);
      await trxFinisher.commit();
    } catch (err) {
      console.log(`Error: handling outbox: ${JSON.stringify(outbox)}\n`, err);
      await trxFinisher.rollback();
    }
  }
}
