import { Module } from '@nestjs/common';
import { CommandModule } from 'src/core/command/command.module';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import { ServiceAController } from './service-a.controller';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Module({
  imports: [PubSubModule, CommandModule],
  controllers: [ServiceAController],
  providers: [
    {
      provide: ServiceAServiceSymbol,
      useClass: ServiceAService,
    },
  ],
})
export class ServiceAModule {}
