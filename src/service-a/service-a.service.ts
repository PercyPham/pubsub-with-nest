import { Inject, Injectable } from '@nestjs/common';
import {
  CmdRepService,
  CmdRepServiceSymbol,
} from 'src/core/cmdrep/cmdrep.service';
import {
  CommandService,
  CommandServiceSymbol,
} from 'src/core/command/command.service';
import { OrderCreatedCommand } from 'src/service-a-contract/order-created.command';
import { OrderCreatedEventData } from 'src/service-a-contract/order-created.topic';
import { TestCmd } from 'src/service-b-contract/service-b.contract';
import {
  OrderCreatedEventPublisher,
  OrderCreatedEventPublisherSymbol,
} from './order-created.event-publisher';

export const ServiceAServiceSymbol = Symbol('ServiceAService');

@Injectable()
export class ServiceAService {
  constructor(
    @Inject(OrderCreatedEventPublisherSymbol)
    private readonly orderCreatedEventPublisher: OrderCreatedEventPublisher,
    @Inject(CmdRepServiceSymbol)
    private readonly cmdrepService: CmdRepService,
    @Inject(CommandServiceSymbol)
    private readonly commandService: CommandService,
  ) {}

  public async createOrderWithID(orderID: number): Promise<void> {
    const eventData: OrderCreatedEventData = { orderID };
    this.orderCreatedEventPublisher.publishEventWith(eventData);

    // publish command
    this.commandService.triggerEventsToCommandSubscribers(
      OrderCreatedCommand,
      eventData,
    );

    /// Test cmdrep service
    let [err, result] = await this.cmdrepService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: true },
    });
    console.log(`cmdrep:success:err:`, err?.message);
    console.log(`cmdrep:success:result:`, result);

    [err, result] = await this.cmdrepService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: false },
    });
    console.log(`cmdrep:failed:err:`, err?.message);
    console.log(`cmdrep:failed:result:`, result);
  }
}
