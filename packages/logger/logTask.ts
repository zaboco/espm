import { T, Task } from '#ts-belt-extra';
import { logger } from './index';

export const logTask =
  (message: string) =>
  <R, E>(task: Task<R, E>): Task<R, E> =>
    T.make((rej, res) => {
      const spinner = logger.spinner(message);
      return T.fork<R, E>(
        (e) => {
          spinner.fail(String(e));
          rej(e);
        },
        (r) => {
          spinner.succeed();
          res(r);
        },
      )(task);
    });
