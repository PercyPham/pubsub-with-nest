import { Context } from '../context';

const PlaceholderCommand = Symbol('PlaceholderCommand');

/**
 * @key [symbol] command type
 * @value [interface] command message
 */
export interface CommandContract {
  [PlaceholderCommand]: never;
}

/**
 * @key [symbol] command type
 * @value [interface] command reply message
 */
export interface CommandReplyContract {
  [PlaceholderCommand]: never;
}

export type CommandType = keyof CommandContract;

export type CommandHandler<T extends CommandType> = (
  ctx: Context,
  cmdMsg: CommandContract[T],
) => Promise<CommandReplyContract[T]>;
