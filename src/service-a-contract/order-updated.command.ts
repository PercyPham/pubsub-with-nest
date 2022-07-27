export const OrderUpdatedCommand = Symbol('OrderUpdatedCommand');

declare module 'src/core/command/contract' {
  interface CommandSubscriptionContract {
    [OrderUpdatedCommand]: {
      updatedOrderID: number;
    };
  }
  interface CommandValidationContract {
    [OrderUpdatedCommand]: {
      updatedOrderID: number;
    };
  }
}
