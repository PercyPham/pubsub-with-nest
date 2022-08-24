import { Module } from '@nestjs/common';
import { ContextServiceImpl, ContextServiceSymbol } from './context.service';

@Module({
  providers: [
    {
      provide: ContextServiceSymbol,
      useClass: ContextServiceImpl,
    },
  ],
  exports: [ContextServiceSymbol],
})
export class ContextModule {}
