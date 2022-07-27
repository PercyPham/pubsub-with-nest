import { Injectable } from '@nestjs/common';
import {
  CommandSubscriptionContract,
  CommandValidationContract,
} from 'src/core/command/contract';
import { Command, SubscriberListener, ValidateListener } from './types';

export const CommandServiceSymbol = Symbol('CommandService');

@Injectable()
export class CommandService {
  private readonly commandRegistry: Map<symbol, Command<any>>;
  public registerValidatorToCommand<T extends keyof CommandValidationContract>(
    command: T,
    validator: ValidateListener<CommandValidationContract[T]>,
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

  public async runCommandValidation<T extends keyof CommandValidationContract>(
    command: T,
    payload: CommandValidationContract[T],
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

  public registerSubscriberToCommand<
    T extends keyof CommandSubscriptionContract,
  >(
    command: T,
    subscriber: SubscriberListener<CommandSubscriptionContract[T]>,
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
    T extends keyof CommandSubscriptionContract,
  >(command: T, payload: CommandSubscriptionContract[T]): Promise<void> {
    const commandInstance = this.commandRegistry.get(command);
    if (!commandInstance) {
      return null;
    }
    await Promise.all(
      commandInstance.subscriberListeners.map((listener) => listener(payload)),
    );
  }
}
