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
> Log from Service B: receiving event from topic: Symbol(OrderCreated): with orderID: 15
cmdrep:success:err: undefined
cmdrep:success:reply: { message: 'ok' }
```

## Instruction

### PubSub usage

- Contract declaration (in `service-a-contract`):

```ts
export const OrderCreated = Symbol('OrderCreated');

declare module 'src/core/pubsub/contract' {
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

  public async publishOrderCreatedEvent(orderID: number): Promise<void> {
    // fire but don't wait for all handlers to complete handling event
    this.psService.publish({
      topic: OrderCreated,
      msg: { orderID },
    });

    // fire and wait for handling completion
    await this.psService.publish({
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

  async logEvent(event: Event<typeof OrderCreated>): Promise<void> {
    const topic = event.topic.toString();
    const orderID = event.msg.orderID;
    console.log(`> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}`);
  }
}
```

### CmdRep usage

- Contract declaration (in `service-b-contract`):

```ts
export const TestCmd = Symbol('TestCmd');

declare module 'src/core/cmdrep/contract' {
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
    @Inject(CmdRepServiceSymbol)
    private readonly cmdRepService: CmdRepService,
  ) {
    this.cmdRepService.mapCommandWithHandler(TestCmd, this.handleTestCmd);
  }

  async handleTestCmd(
    cmd: Command<typeof TestCmd>,
  ): Promise<CommandReply<typeof TestCmd>> {
    if (cmd.msg.shouldSuccess) {
      return [null, { message: 'ok' }];
    }
    return [new Error('failed'), undefined];
  }
}
```

- Command sender (in `service-a`):

```ts
import { TestCmd } from '../service-b-contract';

@Injectable()
export class ServiceAService {
  constructor(
    @Inject(CmdRepServiceSymbol)
    private readonly cmdrepService: CmdRepService,
  ) {}

  public async sendTestCmd(): Promise<void> {
    const [err, reply] = await this.cmdrepService.sendCommand({
      type: TestCmd,
      msg: { shouldSuccess: true },
    });
    console.log(`cmdrep:success:err:`, err?.message);
    console.log(`cmdrep:success:reply:`, reply);
  }
}
```
