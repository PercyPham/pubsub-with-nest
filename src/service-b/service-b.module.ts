import { Module } from '@nestjs/common';
import { CommandModule } from 'src/core/command/command.module';
import { ServiceAContractModule } from 'src/service-a-contract/service-a-contract.module';
import {
  ServiceBEventHandler,
  ServiceBEventHandlerSymbol,
} from './service-b.event-handler';

@Module({
  imports: [CommandModule, ServiceAContractModule],
  providers: [
    {
      provide: ServiceBEventHandlerSymbol,
      useClass: ServiceBEventHandler,
    },
  ],
})
export class ServiceBModule {}
