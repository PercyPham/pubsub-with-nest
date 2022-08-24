export const OrderCreatedDomainEvent = Symbol('OrderCreatedDomainEvent');

declare module 'src/core/domain-event' {
  interface DomainEventContract {
    [OrderCreatedDomainEvent]: {
      orderID: number;
    };
  }
}
