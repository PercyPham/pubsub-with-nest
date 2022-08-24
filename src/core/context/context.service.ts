import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Timestamp } from 'src/core/common/data.types';
import { Context } from './context';

export const ContextServiceSymbol = Symbol('ContextService');

let dbReadConn: Knex | null = null;
let dbWriteConn: Knex | null = null;

export function registerDbConnections(readConn: Knex, writeConn: Knex): void {
  dbReadConn = readConn;
  dbWriteConn = writeConn;
}

export interface ContextService {
  createNewContext(timestamp?: Timestamp): Context;
}

@Injectable()
export class ContextServiceImpl implements ContextService {
  createNewContext(timestamp?: Timestamp): Context {
    return new Context({
      timestamp: timestamp ?? Date.now(),
      dbReadConn: dbReadConn,
      dbWriteConn: dbWriteConn,
    });
  }
}
