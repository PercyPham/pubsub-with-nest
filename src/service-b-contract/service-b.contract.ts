export const TestCmd = Symbol('TestCmd');

declare module 'src/core/command/contract' {
  interface CmdMsgContract {
    [TestCmd]: {
      shouldSuccess: boolean;
    };
  }
  interface RepMsgContract {
    [TestCmd]: {
      message: string;
    };
  }
}
