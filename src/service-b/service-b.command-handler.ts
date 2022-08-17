import { Inject, Injectable } from '@nestjs/common';
import {
  CmdRepService,
  CmdRepServiceSymbol,
} from 'src/core/cmdrep/cmdrep.service';
import { Command, CommandReply } from 'src/core/cmdrep/contract';
import { TestCmd } from '../service-b-contract/service-b.contract';

export const ServiceBCommandHandlerSymbol = Symbol('ServiceBCommandHandler');

@Injectable()
export class ServiceBCommandHandler {
  constructor(
    @Inject(CmdRepServiceSymbol)
    private readonly cmdRepService: CmdRepService,
  ) {
    this.cmdRepService.mapCommandWithHandler(TestCmd, this.handleTestCmd);
  }

  async handleTestCmd(
    cmd: Command<typeof TestCmd>,
  ): Promise<CommandReply<typeof TestCmd>> {
    if (cmd.msg.shouldSuccess) {
      return [null, { message: 'ok' }];
    }
    return [new Error('failed'), undefined];
  }
}
