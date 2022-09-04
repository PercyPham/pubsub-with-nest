import { Module } from '@nestjs/common';
import { ContextModule } from '../context';
import { OutboxCronJobSymbol } from './outbox.cronjob';
import { OutboxCronJobSimpleImpl } from './outbox.cronjob.simple';
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
      useClass: OutboxCronJobSimpleImpl,
    },
    {
      provide: OutboxServiceSymbol,
      useClass: OutboxServiceImpl,
    },
  ],
  exports: [OutboxServiceSymbol],
})
export class OutboxModule {}
