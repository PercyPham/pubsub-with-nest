import { Module } from '@nestjs/common';
import { PubSubServiceImpl, PubSubServiceSymbol } from './pubsub.service';

@Module({
  providers: [
    {
      provide: PubSubServiceSymbol,
      useClass: PubSubServiceImpl,
    },
  ],
  exports: [PubSubServiceSymbol],
})
export class PubSubModule {}
