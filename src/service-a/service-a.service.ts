import { Inject, Injectable } from '@nestjs/common';
import { CommandService, CommandServiceSymbol } from 'src/core/command';
import { PubSubService, PubSubServiceSymbol } from 'src/core/pubsub';
import { OrderCreated } from 'src/service-a-contract';
import { TestCmd } from 'src/service-b-contract';

export const ServiceAServiceSymbol = Symbol('ServiceAService');

@Injectable()
export class ServiceAService {
  constructor(
    @Inject(PubSubServiceSymbol)
    private readonly psService: PubSubService,
    @Inject(CommandServiceSymbol)
    private readonly cmdService: CommandService,
  ) {}

  public async createOrderWithID(orderID: number): Promise<void> {
    // test pubsub
    this.psService.publish({
      topic: OrderCreated,
      msg: { orderID },
    });

    /// Test cmd service
    let [err, reply] = await this.cmdService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: true },
    });
    console.log(`cmd:success:err:`, err?.message);
    console.log(`cmd:success:reply:`, reply);

    [err, reply] = await this.cmdService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: false },
    });
    console.log(`cmd:failed:err:`, err?.message);
    console.log(`cmd:failed:reply:`, reply);
  }
}
