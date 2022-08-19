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
cmd:success:reply:message 1660880916635: ok
cmd:failed:err:message 1660880916635: failed
> Log from Service B: receiving event from topic: Symbol(OrderCreated): with orderID: 15: at: 1660880916635
```

## Instruction

### PubSub usage

- Contract declaration (in `service-a-contract`):

```ts
export const OrderCreated = Symbol('OrderCreated');

declare module 'src/core/pubsub' {
  interface EventMsgContract {
    [OrderCreated]: {
      orderID: number;
    };
  }
}
```

- Event publisher (in `service-a`):

```ts
import { OrderCreated } from '../service-a-contract';

@Injectable()
export class ServiceA {
  constructor(
    @Inject(PubSubServiceSymbol)
    private readonly psService: PubSubService,
  ) {}

  public async publishOrderCreatedEvent(ctx: Context, orderID: number): Promise<void> {
    await this.psService.publish(ctx, {
      topic: OrderCreated,
      msg: { orderID },
    });
  }
}
```

- Event handler (in `service-b`):

```ts
import { OrderCreated } from 'src/service-a-contract';

@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(PubSubServiceSymbol)
    private readonly pubsub: PubSubService,
  ) {
    this.pubsub.subscribe(OrderCreated, this.logEvent);
  }

  async logEvent(ctx: Context, event: Event<typeof OrderCreated>): Promise<void> {
    const topic = event.topic.toString();
    const orderID = event.msg.orderID;
    console.log(`> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}: at: ${ctx.getTimestamp()}`);
  }
}
```

### Command usage

- Contract declaration (in `service-b-contract`):

```ts
export const TestCmd = Symbol('TestCmd');

declare module 'src/core/command' {
  interface CmdMsgContract {
    [TestCmd]: {
      shouldSuccess: boolean;
    };
  }
  interface RepMsgContract {
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
    private readonly cmdRepService: CommandService,
  ) {
    this.cmdRepService.mapCommandWithHandler(TestCmd, this.handleTestCmd);
  }

  async handleTestCmd(
    ctx: Context,
    cmdMsg: CmdMsgContract[typeof TestCmd],
  ): Promise<RepMsgContract[typeof TestCmd]> {
    if (cmdMsg.shouldSuccess) {
      return { message: `${ctx:getTimestamp()}: ok` };
    }
    throw new Error(`${ctx:getTimestamp()}: failed`);
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
