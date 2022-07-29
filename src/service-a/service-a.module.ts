import { Module } from '@nestjs/common';
import { CommandModule } from 'src/core/command/command.module';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import {
  OrderCreatedEventPublisher,
  OrderCreatedEventPublisherSymbol,
} from './order-created.event-publisher';
import { ServiceAController } from './service-a.controller';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Module({
  imports: [PubSubModule, CommandModule],
  controllers: [ServiceAController],
  providers: [
    {
      provide: OrderCreatedEventPublisherSymbol,
      useClass: OrderCreatedEventPublisher,
    },
    {
      provide: CommandServiceSymbol,
      useClass: CommandService,
    },
    {
      provide: ServiceAServiceSymbol,
      useClass: ServiceAService,
    },
  ],
})
export class ServiceAModule {}
