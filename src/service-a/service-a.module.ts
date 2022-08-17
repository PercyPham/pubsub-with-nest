import { Module } from '@nestjs/common';
import { CmdRepModule } from 'src/core/cmdrep/cmdrep.module';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import { ServiceAController } from './service-a.controller';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Module({
  imports: [PubSubModule, CmdRepModule],
  controllers: [ServiceAController],
  providers: [
    {
      provide: ServiceAServiceSymbol,
      useClass: ServiceAService,
    },
  ],
})
export class ServiceAModule {}
