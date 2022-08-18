import { Injectable } from '@nestjs/common';
import {
  CmdMsgContract,
  Command,
  CommandHandler,
  CommandReply,
} from 'src/core/command';

export const CommandServiceSymbol = Symbol('CommandService');

@Injectable()
export class CommandService {
  private readonly cmdHandlerMap = new Map<symbol, CommandHandler<any>>();

  public mapCommandWithHandler<T extends keyof CmdMsgContract>(
    cmdType: T,
    cmdHandler: CommandHandler<T>,
  ) {
    const handler = this.cmdHandlerMap.get(cmdType);
    if (handler) {
      throw new Error(`duplicate command handler for "${String(cmdType)}"`);
    }
    this.cmdHandlerMap.set(cmdType, cmdHandler);
  }

  public async sendCommand<T extends keyof CmdMsgContract>(
    cmd: Command<T>,
  ): Promise<CommandReply<T>> {
    const handler = this.mustGetCommandHandler(cmd.type);
    return handler(cmd);
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
