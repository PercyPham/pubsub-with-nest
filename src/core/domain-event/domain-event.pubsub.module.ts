import { Module } from '@nestjs/common';
import {
  DomainEventPubSubServiceImpl,
  DomainEventPubSubServiceSymbol,
} from './domain-event.pubsub.service';

@Module({
  providers: [
    {
      provide: DomainEventPubSubServiceSymbol,
      useClass: DomainEventPubSubServiceImpl,
    },
  ],
  exports: [DomainEventPubSubServiceSymbol],
})
export class DomainEventModule {}
