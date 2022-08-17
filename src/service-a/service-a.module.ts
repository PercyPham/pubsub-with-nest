import { Module } from '@nestjs/common';
import { CmdRepModule } from 'src/core/cmdrep/cmdrep.module';
import { CommandModule } from 'src/core/command/command.module';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { PubSubModule } from 'src/core/pubsub/pubsub.module';
import { ServiceAController } from './service-a.controller';
import { ServiceAService, ServiceAServiceSymbol } from './service-a.service';

@Module({
  imports: [PubSubModule, CmdRepModule, CommandModule],
  controllers: [ServiceAController],
  providers: [
    {
      provide: CommandServiceSymbol,
      useClass: CommandService,
    },
    {
      provide: ServiceAServiceSymbol,
      useClass: ServiceAService,
    },
  ],
})
export class ServiceAModule {}
