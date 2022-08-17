export const OrderCreated = Symbol('OrderCreated');

declare module 'src/core/pubsub/contract' {
  interface EventMsgContract {
    [OrderCreated]: {
      orderID: number;
    };
  }
}
