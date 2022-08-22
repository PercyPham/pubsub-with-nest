import { Module } from '@nestjs/common';
import { PubSubServiceSymbol } from './pubsub.service';
import { SimplePubSubServiceImpl } from './simple';

@Module({
  providers: [
    {
      provide: PubSubServiceSymbol,
      useClass: SimplePubSubServiceImpl,
    },
  ],
  exports: [PubSubServiceSymbol],
})
export class PubSubModule {}
