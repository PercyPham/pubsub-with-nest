import { Module } from '@nestjs/common';
import { ContextModule } from '../context';
import { OutboxCronJobImpl, OutboxCronJobSymbol } from './outbox.cron-job';
import {
  OutboxHandlerRegistry,
  OutboxHandlerRegistrySymbol,
} from './outbox.handler-registry';
import { OutboxServiceImpl, OutboxServiceSymbol } from './outbox.service';

@Module({
  imports: [ContextModule],
  providers: [
    {
      provide: OutboxHandlerRegistrySymbol,
      useClass: OutboxHandlerRegistry,
    },
    {
      provide: OutboxCronJobSymbol,
      useClass: OutboxCronJobImpl,
    },
    {
      provide: OutboxServiceSymbol,
      useClass: OutboxServiceImpl,
    },
  ],
  exports: [OutboxServiceSymbol],
})
export class OutboxModule {}
