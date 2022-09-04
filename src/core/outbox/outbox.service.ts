import { Inject, Injectable } from '@nestjs/common';
import { Context } from '../context';
import { Outbox, OutboxDispatcher, OutboxType } from './outbox';
import { OutboxCronJob, OutboxCronJobSymbol } from './outbox.cronjob';
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

  /**
   * There should only be one cronjob running at a time in entire replicas of this service.
   */
  startOutboxDispatchingCronJob(): void;

  add<T extends OutboxType>(ctx: Context, outbox: Outbox<T>): Promise<void>;

  /** Just trigger dispatching outboxes, doesn't care and doesn't wait for result. */
  triggerDispatching(outboxes: Outbox<any>[]): void;
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

  async add<T extends OutboxType>(
    ctx: Context,
    outbox: Outbox<T>,
  ): Promise<void> {
    await this.outboxRepo.add(ctx, outbox);
  }

  triggerDispatching(outboxes: Outbox<any>[]): void {
    this.outboxDispatcherService.triggerDispatching(outboxes);
  }
}
