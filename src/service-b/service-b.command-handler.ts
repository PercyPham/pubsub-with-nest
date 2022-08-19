import { Inject, Injectable } from '@nestjs/common';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { CmdMsgContract, RepMsgContract } from 'src/core/command';
import { TestCmd } from '../service-b-contract';
import { Context } from 'src/core/context';

export const ServiceBCommandHandlerSymbol = Symbol('ServiceBCommandHandler');

@Injectable()
export class ServiceBCommandHandler {
  constructor(
    @Inject(CommandServiceSymbol)
    private readonly cmdService: CommandService,
  ) {
    this.cmdService.mapCommandWithHandler(TestCmd, this.handleTestCmd);
  }

  async handleTestCmd(
    ctx: Context,
    cmdMsg: CmdMsgContract[typeof TestCmd],
  ): Promise<RepMsgContract[typeof TestCmd]> {
    if (cmdMsg.shouldSuccess) {
      return { message: `${ctx.getTimestamp()}: ok` };
    }
    throw new Error(`${ctx.getTimestamp()}: failed`);
  }
}
