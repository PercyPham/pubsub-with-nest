export const OrderCreatedCommand = Symbol('OrderCreatedCommand');

declare module 'src/core/command/contract' {
  interface CommandSubscriptionContract {
    [OrderCreatedCommand]: {
      orderID: number;
    };
  }
  interface CommandValidationContract {
    [OrderCreatedCommand]: {
      orderID: number;
    };
  }
}
