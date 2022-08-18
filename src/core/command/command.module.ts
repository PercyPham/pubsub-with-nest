import { Module } from '@nestjs/common';
import { CommandServiceImpl, CommandServiceSymbol } from './command.service';

@Module({
  providers: [
    {
      provide: CommandServiceSymbol,
      useClass: CommandServiceImpl,
    },
  ],
  exports: [CommandServiceSymbol],
})
export class CommandModule {}
