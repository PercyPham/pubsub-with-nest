import { Module } from '@nestjs/common';
import { CmdRepModule } from 'src/core/cmdrep/cmdrep.module';
import { CommandModule } from 'src/core/command/command.module';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import {
  ServiceBCommandHandler,
  ServiceBCommandHandlerSymbol,
} from './service-b.command-handler';
import {
  ServiceBEventHandler,
  ServiceBEventHandlerSymbol,
} from './service-b.event-handler';

@Module({
  imports: [PubSubModule, CommandModule, CmdRepModule],
  providers: [
    {
      provide: ServiceBCommandHandlerSymbol,
      useClass: ServiceBCommandHandler,
    },
    {
      provide: ServiceBEventHandlerSymbol,
      useClass: ServiceBEventHandler,
    },
  ],
})
export class ServiceBModule {}
