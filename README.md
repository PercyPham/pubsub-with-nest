# Demo PubSub IPC

## Running the app

In terminal, type:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Play

Open browser and go to `localhost:3000/service-a` and see in response:

```txt
OK
```

Go back to terminal and see:

```txt
cmd:success:reply:message 1661335871085: ok
cmd:failed:err:message 1661335871085: failed
> 1661335871085: Log from Service B: receiving domain-event: Symbol(OrderCreatedDomainEvent): with orderID: 15
```

## Instruction

### Domain Event PubSub usage

- Contract declaration (in `service-a-contract`):

```ts
export const OrderCreatedDomainEvent = Symbol('OrderCreatedDomainEvent');

declare module 'src/core/domain-event' {
  interface DomainEventContract {
    [OrderCreatedDomainEvent]: {
      orderID: number;
    };
  }
}
```

- Event publisher (in `service-a`):

```ts
import { OrderCreatedDomainEvent } from '../service-a-contract';

@Injectable()
export class ServiceA {
  constructor(
    @Inject(DomainEventPubSubServiceSymbol)
    private readonly domainEventPubSubService: DomainEventPubSubService,
  ) {}

  public async publishOrderCreatedEvent(ctx: Context, orderID: number): Promise<void> {
    await this.domainEventPubSubService.publish(ctx, OrderCreatedDomainEvent, {
      orderID,
    });
  }
}
```

- Event handler (in `service-b`):

```ts
import { OrderCreatedDomainEvent } from 'src/service-a-contract';

@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(DomainEventPubSubServiceSymbol)
    private readonly domainEventPubSubService: DomainEventPubSubService,
  ) {
    this.domainEventPubSubService.subscribe(
      OrderCreatedDomainEvent,
      this.logEvent.bind(this),
    );
  }

  async logEvent(
    ctx: Context,
    event: DomainEvent<typeof OrderCreatedDomainEvent>,
  ): Promise<void> {
    const timestamp = ctx.getTimestamp();
    const topic = event.type.toString();
    const orderID = event.msg.orderID;

    console.log(
      `> ${timestamp}: Log from Service B: receiving domain-event: ${topic}: with orderID: ${orderID}`,
    );
  }
}
```

### Command usage

- Contract declaration (in `service-b-contract`):

```ts
export const TestCmd = Symbol('TestCmd');

declare module 'src/core/command' {
  interface CommandContract {
    [TestCmd]: {
      shouldSuccess: boolean;
    };
  }
  interface CommandReplyContract {
    [TestCmd]: {
      message: string;
    };
  }
}
```

- Command handler (in `service-b`):

```ts
import { TestCmd } from '../service-b-contract';

@Injectable()
export class ServiceBCommandHandler {
  constructor(
    @Inject(CommandServiceSymbol)
    private readonly cmdService: CommandService,
  ) {
    this.cmdService.mapCommandWithHandler(
      TestCmd,
      this.handleTestCmd.bind(this),
    );
  }

  async handleTestCmd(
    ctx: Context,
    cmdMsg: CommandContract[typeof TestCmd],
  ): Promise<CommandReplyContract[typeof TestCmd]> {
    if (cmdMsg.shouldSuccess) {
      return { message: `${ctx.getTimestamp()}: ok` };
    }
    throw new Error(`${ctx.getTimestamp()}: failed`);
  }
}
```

- Command sender (in `service-a`):

```ts
import { TestCmd } from '../service-b-contract';

@Injectable()
export class ServiceAService {
  constructor(
    @Inject(CommandServiceSymbol)
    private readonly cmdService: CommandService,
  ) {}

  public async sendTestCmd(ctx: Context): Promise<void> {
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
  }
}
```
