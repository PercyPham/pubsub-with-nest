import { Inject, Injectable } from '@nestjs/common';
import { Context, ContextService, ContextServiceSymbol } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import { OutboxRepo, OutboxRepoSymbol } from './outbox.repo';

export const OutboxDispatcherServiceSymbol = Symbol('OutboxDispatcherService');

export type DispatchErrorHandler = (
  ctx: Context,
  err: Error,
  outbox?: Outbox<any>,
) => Promise<void> | void;

@Injectable()
export class OutboxDispatcherService {
  private readonly dispatcherRegistry = new Map<
    OutboxType,
    OutboxDispatcher<any>
  >();

  private hasNewDispatchErrHandler = false;
  private dispatchErrorHandler: DispatchErrorHandler = (_, err, outbox) => {
    let errMsg = `Error while dispatching outbox: ${err.message}`;
    if (outbox) {
      errMsg += `\nOutbox Type: ${outbox.type}`;
      errMsg += `\nOutbox Content: ${JSON.stringify(outbox)}`;
    }
    errMsg += `\n${err}`;
    console.log(errMsg);
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
    const found = this.dispatcherRegistry.get(outboxType);
    if (found) {
      throw new Error(`duplicate outbox dispatcher for "${outboxType}"`);
    }
    this.dispatcherRegistry.set(outboxType, dispatcher);
  }

  registerDispatchErrorHandler(handler: DispatchErrorHandler): void {
    if (this.hasNewDispatchErrHandler) {
      throw new Error('Already overwrite dispatch error handler');
    }
    this.dispatchErrorHandler = handler;
    this.hasNewDispatchErrHandler = true;
  }

  triggerDispatching(outboxes: Outbox<any>[]): void {
    const ctx = this.ctxService.createNewContext();
    this.tryDispatching(ctx, outboxes).catch(async (err) => {
      await this.dispatchErrorHandler(ctx, err);
    });
  }

  async tryDispatching(ctx: Context, outboxes: Outbox<any>[]): Promise<void> {
    outboxes.forEach((outbox) => {
      outbox.tryCount++;
      outbox.lastTryAt = ctx.getTimestamp();
    });
    await this.outboxRepo.updateMany(ctx, outboxes);

    outboxes.forEach((outbox) => {
      this.dispatch(ctx, outbox).catch(async (err) => {
        await this.dispatchErrorHandler(ctx, err, outbox);
      });
    });
  }

  private async dispatch<T extends OutboxType>(
    ctx: Context,
    outbox: Outbox<T>,
  ): Promise<void> {
    const [trxCtx, trxFinisher] = ctx.withTransaction();
    try {
      const dispatch = this.mustGetDispatcher(outbox.type);
      await this.outboxRepo.removeById(trxCtx, outbox.id);
      await dispatch(trxCtx, outbox); // must be the last operation before commit
      trxFinisher.commit();
    } catch (err) {
      trxFinisher.rollback();
      throw err;
    }
  }

  private mustGetDispatcher<T extends OutboxType>(
    outboxType: T,
  ): OutboxDispatcher<T> {
    const dispatcher = this.dispatcherRegistry.get(outboxType);
    if (!dispatcher) {
      throw new Error(`outbox dispatcher for "${outboxType}" not found`);
    }
    return dispatcher;
  }
}
