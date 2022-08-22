import { Inject, Injectable } from '@nestjs/common';
import { CommandService, CommandServiceSymbol } from 'src/core/command';
import { Context } from 'src/core/context';
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

  public async createOrderWithID(ctx: Context, orderID: number): Promise<void> {
    /// test cmd service
    let reply = await this.cmdService.sendCommand(ctx, TestCmd, {
      shouldSuccess: true,
    });
    console.log(`cmd:success:reply:message`, reply.message);

    try {
      reply = await this.cmdService.sendCommand(ctx, TestCmd, {
        shouldSuccess: false,
      });
    } catch (err) {
      console.log(`cmd:failed:err:message`, err.message);
    }

    // test pubsub
    await this.psService.publish(ctx, OrderCreated, {
      orderID,
    });
  }
}
