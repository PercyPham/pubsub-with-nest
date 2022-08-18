export const OrderCreated = Symbol('OrderCreated');

declare module 'src/core/pubsub' {
  interface EventMsgContract {
    [OrderCreated]: {
      orderID: number;
    };
  }
}
