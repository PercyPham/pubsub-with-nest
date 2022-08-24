import { Context } from '../context';

const PlaceholderDomainEvent = Symbol('PlaceholderDomainEvent');

/**
 * @key [symbol] domain event type
 * @value [interface] domain event message
 */
export interface DomainEventContract {
  [PlaceholderDomainEvent]: never;
}

export type DomainEventType = keyof DomainEventContract;

export type DomainEvent<T extends DomainEventType> = {
  type: T;
  msg: DomainEventContract[T];
};

export type DomainEventHandler<T extends DomainEventType> = (
  ctx: Context,
  domainEvent: DomainEvent<T>,
) => Promise<void>;
