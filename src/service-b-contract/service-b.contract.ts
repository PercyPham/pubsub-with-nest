export const TestCmd = Symbol('TestCmd');

declare module 'src/core/command' {
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
