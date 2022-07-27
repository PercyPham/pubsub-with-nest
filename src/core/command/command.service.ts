import { Injectable } from '@nestjs/common';
import { CommandContract } from 'src/core/command-handler/contract';
import { Command, SubscriberListener, ValidateListener } from './types';

export const CommandServiceSymbol = Symbol('CommandService');

@Injectable()
export class CommandService {
  private readonly commandRegistry: Map<symbol, Command<any>>;
  public registerValidatorToCommand<T extends keyof CommandContract>(
    command: T,
    validator: ValidateListener<CommandContract[T]>,
  ): void {
    let commandInstance = this.commandRegistry.get(command);
    if (!commandInstance) {
      commandInstance = {
        command,
        validateListeners: [],
        subscriberListeners: [],
      };
      this.commandRegistry.set(command, commandInstance);
    }
    if (commandInstance) {
      commandInstance.validateListeners.push(validator);
    }
  }

  public async runCommandValidation<T extends keyof CommandContract>(
    command: T,
    payload: CommandContract[T],
  ): Promise<Error[] | null> {
    const commandInstance = this.commandRegistry.get(command);
    if (!commandInstance) {
      return null;
    }
    const results = await Promise.all(
      commandInstance.validateListeners.map((listener) => listener(payload)),
    );

    const errors: Error[] = [];
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (!res) {
        continue;
      }
      if (Array.isArray(res)) {
        errors.push(...res);
      } else {
        errors.push(res);
      }
    }

    if (errors.length > 0) {
      return errors;
    }
    return null;
  }

  public registerSubscriberToCommand<T extends keyof CommandContract>(
    command: T,
    subscriber: SubscriberListener<CommandContract[T]>,
  ): () => void {
    let commandInstance = this.commandRegistry.get(command);
    if (!commandInstance) {
      commandInstance = {
        command,
        validateListeners: [],
        subscriberListeners: [],
      };
      this.commandRegistry.set(command, commandInstance);
    }
    if (commandInstance) {
      commandInstance.subscriberListeners.push(subscriber);
    }

    return () => {
      const handlers = this.commandRegistry.get(command).subscriberListeners;
      handlers.splice(handlers.indexOf(subscriber), 1);
    };
  }

  public async triggerEventsToCommandSubscribers<
    T extends keyof CommandContract,
  >(command: T, payload: CommandContract[T]): Promise<void> {
    const commandInstance = this.commandRegistry.get(command);
    if (!commandInstance) {
      return null;
    }
    await Promise.all(
      commandInstance.subscriberListeners.map((listener) => listener(payload)),
    );
  }
}
