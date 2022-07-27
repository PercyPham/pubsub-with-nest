import { Module } from '@nestjs/common';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { ServiceAContractModule } from 'src/service-a-contract/service-a-contract.module';
import {
  ServiceBEventHandler,
  ServiceBEventHandlerSymbol,
} from './service-b.event-handler';

@Module({
  imports: [ServiceAContractModule],
  providers: [
    {
      provide: ServiceBEventHandlerSymbol,
      useClass: ServiceBEventHandler,
    },
    {
      provide: CommandServiceSymbol,
      useClass: CommandService,
    },
  ],
})
export class ServiceBModule {}
