import { Context } from '../context';
import { EventHandler, EventID, EventMsgContract } from './contract';
import { v4 as uuidV4 } from 'uuid';

export const PubSubServiceSymbol = Symbol('PubSubService');

export interface PubSubService {
  subscribe<T extends keyof EventMsgContract>(
    topic: T,
    handler: EventHandler<T>,
  ): Promise<Unsubscribe>;

  publish<T extends keyof EventMsgContract>(
    ctx: Context,
    topic: T,
    eventMsg: EventMsgContract[T],
  ): Promise<void>;
}

export type Unsubscribe = () => Promise<void>;

export function genNewEventID(): EventID {
  return uuidV4();
}
