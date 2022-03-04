import chalk from 'chalk';
import { performance } from 'node:perf_hooks';
// @ts-expect-error
import Spinnies from 'spinnies';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface Logger {
  spinner(
    message: string,
    options?: { level?: LogLevel },
  ): {
    succeed: () => void;
    fail: () => void;
  };
  log(message: string, options?: { level?: LogLevel }): void;
}

export const logger = initLogger();

export function initLogger(): Logger {
  const spinnies = new Spinnies();

  return {
    spinner(message, _options = {}) {
      const spinnerId = uuid(`spinner-${message}`);
      spinnies.add(spinnerId, {
        text: chalk.black.bgWhite(' DEBUG ') + ' ' + chalk.black(message),
      });

      return {
        succeed() {
          spinnies.succeed(spinnerId);
        },
        fail() {
          spinnies.fail(spinnerId);
        },
      };
    },
    log(message, _options = {}) {
      const pseudoSpinnerId = uuid(`log-${message}`);
      spinnies.add(pseudoSpinnerId, {
        text: message,
        status: 'stopped',
      });
    },
  };
}

function uuid(base: string) {
  return `${base}-${performance.now()}`;
}
