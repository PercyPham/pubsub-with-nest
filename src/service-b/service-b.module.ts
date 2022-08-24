import { Module } from '@nestjs/common';
import { CommandModule } from 'src/core/command';
import { ContextModule } from 'src/core/context';
import { DomainEventModule } from 'src/core/domain-event';
import { PubSubModule } from 'src/core/pubsub';
import {
  ServiceBCommandHandler,
  ServiceBCommandHandlerSymbol,
} from './service-b.command-handler';
import {
  ServiceBDomainEventHandler,
  ServiceBDomainEventHandlerSymbol,
} from './service-b.domain-event-handler';
import {
  ServiceBEventHandler,
  ServiceBEventHandlerSymbol,
} from './service-b.event-handler';

@Module({
  imports: [ContextModule, DomainEventModule, PubSubModule, CommandModule],
  providers: [
    {
      provide: ServiceBCommandHandlerSymbol,
      useClass: ServiceBCommandHandler,
    },
    {
      provide: ServiceBEventHandlerSymbol,
      useClass: ServiceBEventHandler,
    },
    {
      provide: ServiceBDomainEventHandlerSymbol,
      useClass: ServiceBDomainEventHandler,
    },
  ],
})
export class ServiceBModule {}
