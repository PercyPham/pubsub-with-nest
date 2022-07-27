export const OrderCreatedCommand = Symbol('OrderCreatedCommand');

declare module 'src/core/command/contract' {
  interface CommandContract {
    [OrderCreatedCommand]: {
      orderID: number;
    };
  }
}
