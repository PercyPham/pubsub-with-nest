import { Inject, Injectable } from '@nestjs/common';
import { ContextService, ContextServiceSymbol } from '../context';
import {
  OutboxCronJob,
  CRON_JOB_INTERVAL,
  OUTBOX_MAX_TRY_ALLOWED,
  OUTBOX_DISPATCHING_BATCH_LIMIT,
  OUTBOX_WAITING_TIME_BEFORE_RETRY,
} from './outbox.cronjob';
import {
  OutboxDispatcherService,
  OutboxDispatcherServiceSymbol,
} from './outbox.dispatcher.service';
import { OutboxRepo, OutboxRepoSymbol, SortingOptions } from './outbox.repo';
import { v4 as uuidV4 } from 'uuid';

const SECOND = 1000;
const CRONJOB_RUNNER_KEY_POSSESSION_TIME = 10 * SECOND;

export type CronJobRunner = {
  key: string;
  expiredAt: number;
};

export const CronJobRunnerRepoSymbol = 'CronJobRunner';

export interface CronJobRunnerRepo {
  /** Get the current runner info */
  getCurrentRunner(): Promise<CronJobRunner>;
  /**
   * Update the runner info only if the current info is the same as what we expected.
   * - `set` - new cronjob runner info that we try to set
   * - `where` - previous cronjob runner exact info
   *
   * @returns update success
   */
  updateRunner(update: {
    set: CronJobRunner;
    where: CronJobRunner;
  }): Promise<boolean>;
}

/**

Only one cronjob should run at a time, so many cronjob services will have a competition, they'll compete for a key in CronJob config (set in  DB).

CronJobRunner {
  key: string,       // uuid
  expiredAt: number, // expire time, timestamp in ms since epoch
}

Only service that has the key can run the cronjob

=> For current runner (who has key): 1s before the expiration time, send out a DB request to update the "expiredAt" to (now + 10s)

=> For other competitor:
  1. generate its own key (uuid): named "competitionKey"
  2. start compete:
    2.1. query current runner info, get "key" and "expiredAt"
    2.2. if currentKey === competitionKey => this is runner => use current runner flow
    2.3. if now is not expired time => setTimeout to expAt + 1ms, and start compete after that
    2.4. if is expired => send out DB request to update runner info with:
      update: {
        set: {
          key: competitionKey,
          expiredAt: now + 10s
        },
        where prevRunner === this.currentRunner; // this is because other competitor may succeeded updating => will make this updating fails.
      }
    2.5. if update success => this is the current runner => use current runner flow
    2.6. if failed, start compete flow again
 */
@Injectable()
export class OutboxCronJobCompetitiveImpl implements OutboxCronJob {
  private cronjobStarted = false;

  private competitionKey: string = uuidV4();

  private currentRunner: CronJobRunner = { key: '', expiredAt: 0 };

  constructor(
    @Inject(CronJobRunnerRepoSymbol)
    private readonly cronjobRunnerRepo: CronJobRunnerRepo,
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
    this.startCronJobInCompetitiveMode();
  }

  async startCronJobInCompetitiveMode(): Promise<void> {
    while (!this.isCurrentRunner()) {
      await this.competeForRunnerKey();

      // we are current runner now

      const timeToExtendRunnerKeyPossessionTime =
        this.currentRunner.expiredAt - 1 * SECOND;
      setTimeout(() => {
        this.tryToExtendRunnerKeyPossessionTime().catch(() => null); // don't care if failed
      }, timeToExtendRunnerKeyPossessionTime - Date.now());

      while (this.isCurrentRunner()) {
        await this.dispatchNotYetDespatchedOutboxes();
        await sleep(CRON_JOB_INTERVAL);
      }
    }
  }

  async competeForRunnerKey(): Promise<void> {
    this.currentRunner = await this.cronjobRunnerRepo.getCurrentRunner();
    if (this.isCurrentRunner()) return;

    let success = false;
    while (!success) {
      const competeAt = this.currentRunner.expiredAt + 1;
      await sleep(competeAt - Date.now());

      const competitionApplication = {
        key: this.competitionKey,
        expiredAt: Date.now() + CRONJOB_RUNNER_KEY_POSSESSION_TIME,
      };

      success = await this.cronjobRunnerRepo.updateRunner({
        set: competitionApplication,
        where: this.currentRunner,
      });

      if (success) {
        this.currentRunner = competitionApplication;
        return;
      }

      this.currentRunner = await this.cronjobRunnerRepo.getCurrentRunner();
    }
  }

  private async tryToExtendRunnerKeyPossessionTime(): Promise<void> {
    if (!this.isCurrentRunner()) {
      throw new Error(
        'try to extend possession time while not being the current runner',
      );
    }

    const newRunnerInfo = {
      key: this.currentRunner.key,
      expiredAt: Date.now() + CRONJOB_RUNNER_KEY_POSSESSION_TIME,
    };

    const success = await this.cronjobRunnerRepo.updateRunner({
      set: newRunnerInfo,
      where: this.currentRunner,
    });

    if (success) this.currentRunner = newRunnerInfo;
  }

  private isCurrentRunner(): boolean {
    return (
      this.competitionKey === this.currentRunner.key &&
      Date.now() < this.currentRunner.expiredAt
    );
  }

  private async dispatchNotYetDespatchedOutboxes(): Promise<void> {
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

function sleep(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
