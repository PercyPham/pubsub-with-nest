import { Module } from '@nestjs/common';
import { ContextModule } from '../context';
import { OutboxCronJobImpl, OutboxCronJobSymbol } from './outbox.cron-job';
import {
  OutboxDispatcherService,
  OutboxDispatcherServiceSymbol,
} from './outbox.dispatcher.service';
import { OutboxServiceImpl, OutboxServiceSymbol } from './outbox.service';

@Module({
  imports: [ContextModule],
  providers: [
    {
      provide: OutboxDispatcherServiceSymbol,
      useClass: OutboxDispatcherService,
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
