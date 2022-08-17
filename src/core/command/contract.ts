const ExampleCommand = Symbol('ExampleCommand');

export interface CmdMsgContract {
  [ExampleCommand]: never;
}

export interface RepMsgContract {
  [ExampleCommand]: never;
}

export type Command<T extends keyof CmdMsgContract> = {
  type: T;
  msg: CmdMsgContract[T];
};

export type CommandHandler<T extends keyof CmdMsgContract> = (
  cmd: Command<T>,
) => Promise<CommandReply<T>>;

export type CommandReply<T extends keyof CmdMsgContract> =
  | [Error, undefined]
  | [null, RepMsgContract[T]];
