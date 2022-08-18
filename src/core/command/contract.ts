const PlaceholderCommand = Symbol('PlaceholderCommand');

export interface CmdMsgContract {
  [PlaceholderCommand]: never;
}

export interface RepMsgContract {
  [PlaceholderCommand]: never;
}

export type CommandHandler<T extends keyof CmdMsgContract> = (
  cmdMsg: CmdMsgContract[T],
) => Promise<RepMsgContract[T]>;
