import { Module } from '@nestjs/common';
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
  ],
})
export class ServiceBModule {}
