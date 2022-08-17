import { Module } from '@nestjs/common';
import { CmdRepService, CmdRepServiceSymbol } from './cmdrep.service';

@Module({
  providers: [
    {
      provide: CmdRepServiceSymbol,
      useClass: CmdRepService,
    },
  ],
  exports: [CmdRepServiceSymbol],
})
export class CmdRepModule {}
