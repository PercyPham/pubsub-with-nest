import { Injectable } from '@nestjs/common';
import { CommandContract, CommandHandler } from 'src/core/command';
import { Context } from '../context';
import { CommandReplyContract, CommandType } from './command';

export const CommandServiceSymbol = Symbol('CommandService');

export interface CommandService {
  mapCommandWithHandler<T extends CommandType>(
    cmdType: T,
    cmdHandler: CommandHandler<T>,
  ): void;

  sendCommand<T extends CommandType>(
    ctx: Context,
    cmdType: T,
    cmdMsg: CommandContract[T],
  ): Promise<CommandReplyContract[T]>;
}

@Injectable()
export class CommandServiceImpl implements CommandService {
  private readonly cmdHandlerMap = new Map<symbol, CommandHandler<any>>();

  public mapCommandWithHandler<T extends CommandType>(
    cmdType: T,
    cmdHandler: CommandHandler<T>,
  ): void {
    const handler = this.cmdHandlerMap.get(cmdType);
    if (handler) {
      throw new Error(`duplicate command handler for "${String(cmdType)}"`);
    }
    this.cmdHandlerMap.set(cmdType, cmdHandler);
  }

  public async sendCommand<T extends CommandType>(
    ctx: Context,
    cmdType: T,
    cmdMsg: CommandContract[T],
  ): Promise<CommandReplyContract[T]> {
    const handler = this.mustGetCommandHandler(cmdType);
    return handler(ctx, cmdMsg);
  }

  private mustGetCommandHandler<T extends CommandType>(
    cmdType: T,
  ): CommandHandler<T> {
    const handler = this.cmdHandlerMap.get(cmdType);
    if (!handler) {
      throw new Error(`command handler for "${String(cmdType)}" not found`);
    }
    return handler;
  }
}
