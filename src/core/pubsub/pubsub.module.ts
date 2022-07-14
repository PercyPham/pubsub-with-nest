import { Module } from '@nestjs/common';
import { PubSubService, PubSubServiceSymbol } from './pubsub.service';

@Module({
  providers: [
    {
      provide: PubSubServiceSymbol,
      useClass: PubSubService,
    },
  ],
  exports: [PubSubServiceSymbol],
})
export class PubSubModule {}
