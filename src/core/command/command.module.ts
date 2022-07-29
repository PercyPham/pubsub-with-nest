import { Module } from '@nestjs/common';
import { CommandService, CommandServiceSymbol } from './command.service';

@Module({
  providers: [
    {
      provide: CommandServiceSymbol,
      useClass: CommandService,
    },
  ],
  exports: [CommandServiceSymbol],
})
export class CommandModule {}
