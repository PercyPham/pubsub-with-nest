import { Knex } from 'knex';
import { Timestamp } from 'src/core/common/data.types';

export type ContextConfig = {
  timestamp: Timestamp;
  dbReadConn: Knex;
  dbWriteConn: Knex;
};

export class Context {
  private timestamp: Timestamp;
  private dbReadConn: Knex;
  private dbWriteConn: Knex;

  private isDbTrx: boolean;
  private trxProvider: Knex.TransactionProvider;
  private hasTrxProviderCalled: boolean;

  constructor(cfg: ContextConfig) {
    this.timestamp = cfg.timestamp;
    this.dbReadConn = cfg.dbReadConn;
    this.dbWriteConn = cfg.dbWriteConn;
  }

  public withTransaction(): [Context, TransactionFinisher] {
    const ctx = new Context({
      timestamp: this.timestamp,
      dbReadConn: this.dbReadConn,
      dbWriteConn: this.dbWriteConn,
    });
    ctx.isDbTrx = true;
    ctx.trxProvider = this.dbWriteConn.transactionProvider();
    ctx.hasTrxProviderCalled = false;
    const trxFinisher = this.genTrxFinisher(ctx);
    return [ctx, trxFinisher];
  }

  private genTrxFinisher(ctx: Context): TransactionFinisher {
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

  public getTimestamp(): Timestamp {
    return this.timestamp;
  }

  public isInDbTransaction(): boolean {
    return this.isDbTrx;
  }

  public getDbReadConn(): Knex {
    return this.dbReadConn;
  }

  public async getDbWriteConn(): Promise<Knex> {
    if (this.isDbTrx) {
      this.hasTrxProviderCalled = true;
      return this.trxProvider();
    }
    return this.dbWriteConn;
  }
}

export interface TransactionFinisher {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
