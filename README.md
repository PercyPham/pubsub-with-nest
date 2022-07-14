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
```

## Instruction

### For contract declaration (in `service-a-contract`)

```ts
export const OrderCreatedTopic = Symbol('OrderCreated');

export type OrderCreatedEventData = { orderID: number };
export type OrderCreatedEvent = DomainEvent<OrderCreatedEventData>;

@Injectable()
export class OrderCreatedTopicService extends EventTopic<OrderCreatedEventData> {
  constructor(
    @Inject(PubSubServiceSymbol)
    psService: PubSubService,
  ) {
    super(OrderCreatedTopic, psService);
  }
}
```

### For event publisher (in `service-a`)

Publisher:

```ts
@Injectable()
export class OrderCreatedEventPublisher extends EventPublisher<OrderCreatedEventData> {
  constructor(
    @Inject(PubSubServiceSymbol)
    psService: PubSubService,
  ) {
    super(OrderCreatedTopic, psService);
  }
}
```

Publisher usage:

```ts
@Injectable()
export class ServiceAService {
  constructor(
    @Inject(OrderCreatedEventPublisherSymbol)
    private readonly orderCreatedEventPublisher: OrderCreatedEventPublisher,
  ) {}

  public createOrderWithID(orderID: number): void {
    const eventData: OrderCreatedEventData = { orderID };
    this.orderCreatedEventPublisher.publishEventWith(eventData);
  }
}
```

### For event subscriber (in `service-b`)

```ts
@Injectable()
export class ServiceBEventHandler {
  constructor(
    @Inject(OrderCreatedTopic)
    private readonly orderCreatedTopic: OrderCreatedTopicService,
  ) {
    this.orderCreatedTopic.registerSubscriber(this.logEvent);
  }

  logEvent(event: OrderCreatedEvent) {
    const topic = event.topic.toString();
    const orderID = event.data?.orderID;
    console.log(
      `> Log from Service B: receiving event from topic: ${topic}: with orderID: ${orderID}`,
    );
  }
}
```
