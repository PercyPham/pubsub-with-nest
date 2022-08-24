export const TestCmd = Symbol('TestCmd');

declare module 'src/core/command' {
  interface CommandContract {
    [TestCmd]: {
      shouldSuccess: boolean;
    };
  }
  interface CommandReplyContract {
    [TestCmd]: {
      message: string;
    };
  }
}
