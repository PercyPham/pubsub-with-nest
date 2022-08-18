import { Injectable } from '@nestjs/common';
import { CmdMsgContract, CommandHandler } from 'src/core/command';
import { RepMsgContract } from './contract';

export const CommandServiceSymbol = Symbol('CommandService');

export interface CommandService {
  mapCommandWithHandler<T extends keyof CmdMsgContract>(
    cmdType: T,
    cmdHandler: CommandHandler<T>,
  ): void;

  sendCommand<T extends keyof CmdMsgContract>(
    cmdType: T,
    cmdMsg: CmdMsgContract[T],
  ): Promise<RepMsgContract[T]>;
}

@Injectable()
export class CommandServiceImpl implements CommandService {
  private readonly cmdHandlerMap = new Map<symbol, CommandHandler<any>>();

  public mapCommandWithHandler<T extends keyof CmdMsgContract>(
    cmdType: T,
    cmdHandler: CommandHandler<T>,
  ): void {
    const handler = this.cmdHandlerMap.get(cmdType);
    if (handler) {
      throw new Error(`duplicate command handler for "${String(cmdType)}"`);
    }
    this.cmdHandlerMap.set(cmdType, cmdHandler);
  }

  public async sendCommand<T extends keyof CmdMsgContract>(
    cmdType: T,
    cmdMsg: CmdMsgContract[T],
  ): Promise<RepMsgContract[T]> {
    const handler = this.mustGetCommandHandler(cmdType);
    return handler(cmdMsg);
  }

  private mustGetCommandHandler<T extends keyof CmdMsgContract>(
    cmdType: T,
  ): CommandHandler<T> {
    const handler = this.cmdHandlerMap.get(cmdType);
    if (!handler) {
      throw new Error(`command handler for "${String(cmdType)}" not found`);
    }
    return handler;
  }
}
