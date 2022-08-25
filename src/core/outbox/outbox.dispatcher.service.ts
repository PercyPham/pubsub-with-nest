import { Inject, Injectable } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import { OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxDispatcherServiceSymbol = Symbol('OutboxDispatcherService');

export type DispatchErrorHandler = (
  err: Error,
  outbox: Outbox<any>,
) => Promise<void> | void;

@Injectable()
export class OutboxDispatcherService {
  private readonly registry = new Map<string, OutboxDispatcher<any>>();

  private hasNewDispatchErrHandler = false;
  private dispatchErrorHandler: DispatchErrorHandler = (err, outbox) => {
    console.log(`Error dispatching outbox: ${outbox.type}`);
    console.log(`Outbox Content: ${JSON.stringify(outbox)}`);
    console.log(err);
  };

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

  registerDispatchErrorHandler(handler: DispatchErrorHandler): void {
    if (this.hasNewDispatchErrHandler) {
      throw new Error('Already overwrite dispatch error handler');
    }
    this.dispatchErrorHandler = handler;
    this.hasNewDispatchErrHandler = true;
  }

  triggerDispatching<T extends OutboxType>(outbox: Outbox<T>): void {
    this.tryDispatching(outbox).catch(async (err) =>
      this.dispatchErrorHandler(err, outbox),
    );
  }

  private async tryDispatching<T extends OutboxType>(
    outbox: Outbox<T>,
  ): Promise<void> {
    const ctx = this.ctxService.createNewContext();

    // update independently so it doesn't depend on success/failure of dispatching
    outbox.tryCount++;
    outbox.lastTryAt = ctx.getTimestamp();
    await this.outboxRepo.update(ctx, outbox);

    const [trxCtx, trxFinisher] = ctx.withTransaction();
    try {
      const dispatch = this.mustGetDispatcher(outbox.type);
      await this.outboxRepo.removeOutbox(trxCtx, outbox.id);
      await dispatch(trxCtx, outbox); // must be the last operation before commit
      trxFinisher.commit();
    } catch (err) {
      await this.dispatchErrorHandler(err, outbox);
      trxFinisher.rollback();
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
