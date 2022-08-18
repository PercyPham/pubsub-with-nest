import { Context } from '../context';

const PlaceholderCommand = Symbol('PlaceholderCommand');

export interface CmdMsgContract {
  [PlaceholderCommand]: never;
}

export interface RepMsgContract {
  [PlaceholderCommand]: never;
}

export type CommandHandler<T extends keyof CmdMsgContract> = (
  ctx: Context,
  cmdMsg: CmdMsgContract[T],
) => Promise<RepMsgContract[T]>;
