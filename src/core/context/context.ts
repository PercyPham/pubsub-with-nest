import { Knex } from 'knex';

export type ContextConfig = {
  timestamp?: number;

  dbReadConn: Knex;
  dbWriteConn: Knex;
};

export class Context {
  private timestamp: number;

  private dbReadConn: Knex;
  private dbWriteConn: Knex;

  private isDbTrx: boolean;
  private trxProvider: Knex.TransactionProvider;
  private hasTrxProviderCalled: boolean;

  constructor(cfg: ContextConfig) {
    this.dbReadConn = cfg.dbReadConn;
    this.dbWriteConn = cfg.dbWriteConn;

    this.timestamp = cfg.timestamp ? cfg.timestamp : Date.now();
  }

  public async withTransaction(): Promise<[Context, TransactionHandler]> {
    const ctx = new Context({
      timestamp: this.timestamp,
      dbReadConn: this.dbReadConn,
      dbWriteConn: this.dbWriteConn,
    });
    ctx.isDbTrx = true;
    ctx.trxProvider = this.dbWriteConn.transactionProvider();
    ctx.hasTrxProviderCalled = false;
    const trxHandler = this.genTrxHandler(ctx);
    return [ctx, trxHandler];
  }

  public getTimestamp(): number {
    return this.timestamp;
  }

  public isInDbTransaction(): boolean {
    return this.isDbTrx;
  }

  public getDbReadConn(): Knex {
    return this.dbReadConn;
  }

  public async getDbWriteConn(): Promise<Knex> {
    return this.isDbTrx ? this.trxProvider() : this.dbWriteConn;
  }

  private genTrxHandler(ctx: Context): TransactionHandler {
    return {
      commit: async () => {
        if (ctx.hasTrxProviderCalled) {
          const trx = await ctx.trxProvider();
          await trx.commit();
        }
      },
      rollback: async () => {
        if (ctx.hasTrxProviderCalled) {
          const trx = await ctx.trxProvider();
          await trx.rollback();
        }
      },
    };
  }
}

export interface TransactionHandler {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
