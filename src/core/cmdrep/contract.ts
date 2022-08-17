/* eslint-disable @typescript-eslint/no-empty-interface */
export interface CmdMsgContract {}
export interface RepMsgContract {}

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
