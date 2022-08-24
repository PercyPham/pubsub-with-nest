import { Module } from '@nestjs/common';
import { CommandModule } from 'src/core/command';
import { ContextModule } from 'src/core/context';
import { DomainEventModule } from 'src/core/domain-event';
import {
  ServiceBCommandHandler,
  ServiceBCommandHandlerSymbol,
} from './service-b.command-handler';
import {
  ServiceBDomainEventHandler,
  ServiceBDomainEventHandlerSymbol,
} from './service-b.domain-event-handler';

@Module({
  imports: [ContextModule, DomainEventModule, CommandModule],
  providers: [
    {
      provide: ServiceBCommandHandlerSymbol,
      useClass: ServiceBCommandHandler,
    },
    {
      provide: ServiceBDomainEventHandlerSymbol,
      useClass: ServiceBDomainEventHandler,
    },
  ],
})
export class ServiceBModule {}
