import { Inject, Injectable } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import { OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxDispatcherServiceSymbol = Symbol('OutboxDispatcherService');

@Injectable()
export class OutboxDispatcherService {
  private readonly registry = new Map<string, OutboxDispatcher<any>>();

  constructor(
    @Inject(ContextServiceSymbol)
    private readonly ctxService: ContextService,
    @Inject(OutboxRepoSymbol)
    private readonly outboxRepo: OutboxRepo,
  ) {}

  registerOutboxDispatcher<T extends OutboxType>(
    outboxType: T,
    dispatcher: OutboxDispatcher<T>,
  ): void {
    const found = this.registry.get(outboxType);
    if (found) {
      throw new Error(`duplicate outbox dispatcher for "${outboxType}"`);
    }
    this.registry.set(outboxType, dispatcher);
  }

  async dispatch<T extends OutboxType>(outbox: Outbox<T>): Promise<void> {
    const ctx = this.ctxService.createNewContext();
    const dispatcher = this.mustGetDispatcher(outbox.type);

    // update independently so it doesn't depend on success/failure of outbox handling
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

  private mustGetDispatcher<T extends OutboxType>(
    outboxType: T,
  ): OutboxDispatcher<T> {
    const dispatcher = this.registry.get(outboxType);
    if (!dispatcher) {
      throw new Error(`outbox dispatcher for "${outboxType}" not found`);
    }
    return dispatcher;
  }
}
