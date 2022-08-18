import { Inject, Injectable } from '@nestjs/common';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { Command, CommandReply } from 'src/core/command';
import { TestCmd } from '../service-b-contract';

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
    cmd: Command<typeof TestCmd>,
  ): Promise<CommandReply<typeof TestCmd>> {
    if (cmd.msg.shouldSuccess) {
      return [null, { message: 'ok' }];
    }
    return [new Error('failed'), undefined];
  }
}
