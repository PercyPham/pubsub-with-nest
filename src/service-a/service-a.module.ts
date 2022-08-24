import { Module } from '@nestjs/common';
import { CommandModule } from 'src/core/command';
import { ContextModule } from 'src/core/context';
import { DomainEventModule } from 'src/core/domain-event';
import { PubSubModule } from 'src/core/pubsub';
import { ServiceAController } from './service-a.controller';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Module({
  imports: [ContextModule, PubSubModule, DomainEventModule, CommandModule],
  controllers: [ServiceAController],
  providers: [
    {
      provide: ServiceAServiceSymbol,
      useClass: ServiceAService,
    },
  ],
})
export class ServiceAModule {}
