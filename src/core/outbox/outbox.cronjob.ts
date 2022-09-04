export const OutboxCronJobSymbol = Symbol('OutboxCronJob');

export interface OutboxCronJob {
  start(): void;
}

export const CRON_JOB_INTERVAL = 500;
export const OUTBOX_WAITING_TIME_BEFORE_RETRY = 10 * 1000; // 10 seconds
export const OUTBOX_MAX_TRY_ALLOWED = 3;
export const OUTBOX_DISPATCHING_BATCH_LIMIT = 100;
