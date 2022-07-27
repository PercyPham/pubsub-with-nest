export type ValidateListener<T> = (
  payload: T,
) => Promise<Error | Error[] | null>;
export type SubscriberListener<T> = (payload: T) => Promise<void>;

export interface Command<T> {
  command: symbol;
  validateListeners: ValidateListener<T>[];
  subscriberListeners: SubscriberListener<T>[];
}
