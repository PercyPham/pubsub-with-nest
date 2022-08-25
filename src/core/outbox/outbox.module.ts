import { Module } from '@nestjs/common';
import { ContextModule } from '../context';
import { OutboxCronJobImpl, OutboxCronJobSymbol } from './outbox.cron-job';
import {
  OutboxDispatcherRegistry,
  OutboxDispatcherRegistrySymbol,
} from './outbox.dispatcher-registry';
import { OutboxServiceImpl, OutboxServiceSymbol } from './outbox.service';

@Module({
  imports: [ContextModule],
  providers: [
    {
      provide: OutboxDispatcherRegistrySymbol,
      useClass: OutboxDispatcherRegistry,
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
