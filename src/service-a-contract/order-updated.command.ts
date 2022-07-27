export const OrderUpdatedCommand = Symbol('OrderUpdatedCommand');

declare module 'src/core/command/contract' {
  interface CommandContract {
    [OrderUpdatedCommand]: {
      updatedOrderID: number;
    };
  }
}
