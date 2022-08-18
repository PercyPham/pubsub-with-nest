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
cmd:success:err: undefined
cmd:success:reply: { message: 'ok' }
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
    cmdMsg: CmdMsgContract[typeof TestCmd],
  ): Promise<RepMsgContract[typeof TestCmd]> {
    if (cmdMsg.shouldSuccess) {
      return { message: 'ok' };
    }
    throw new Error('failed');
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

  public async sendTestCmd(): Promise<void> {
    let reply = await this.cmdService.sendCommand(TestCmd, {
      shouldSuccess: true,
    });
    console.log(`cmd:success:reply:message`, reply.message);

    try {
      reply = await this.cmdService.sendCommand(TestCmd, {
        shouldSuccess: false,
      });
    } catch (err) {
      console.log(`cmd:failed:err:message`, err.message);
    }
  }
}
```
