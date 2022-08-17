import { Inject, Injectable } from '@nestjs/common';
import {
  CmdRepService,
  CmdRepServiceSymbol,
} from 'src/core/cmdrep/cmdrep.service';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import {
  PubSubService,
  PubSubServiceSymbol,
} from 'src/core/pubsub/pubsub.service';
import { OrderCreatedCommand } from 'src/service-a-contract/order-created.command';
import { OrderCreated } from 'src/service-a-contract/order-created.event';
import { TestCmd } from 'src/service-b-contract/service-b.contract';

export const ServiceAServiceSymbol = Symbol('ServiceAService');

@Injectable()
export class ServiceAService {
  constructor(
    @Inject(PubSubServiceSymbol)
    private readonly psService: PubSubService,
    @Inject(CmdRepServiceSymbol)
    private readonly cmdrepService: CmdRepService,
    @Inject(CommandServiceSymbol)
    private readonly commandService: CommandService,
  ) {}

  public async createOrderWithID(orderID: number): Promise<void> {
    // test pubsub
    this.psService.publish({
      topic: OrderCreated,
      msg: { orderID },
    });

    // publish command
    this.commandService.triggerEventsToCommandSubscribers(OrderCreatedCommand, {
      orderID,
    });

    /// Test cmdrep service
    let [err, reply] = await this.cmdrepService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: true },
    });
    console.log(`cmdrep:success:err:`, err?.message);
    console.log(`cmdrep:success:reply:`, reply);

    [err, reply] = await this.cmdrepService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: false },
    });
    console.log(`cmdrep:failed:err:`, err?.message);
    console.log(`cmdrep:failed:reply:`, reply);
  }
}
