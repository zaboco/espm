import { FsClient, FsError } from '#interfaces/fsClient.api';
import { logTask } from '#logger/logTask';
import { T, Task } from '#ts-belt-extra';
import { A, pipe } from '@mobily/ts-belt';
import { FsAction } from './types';

export function initFsDriver(fs: FsClient) {
  return {
    perform: performAction,
    performInParallel(actions: FsAction[]): Task<unknown, FsError> {
      return pipe(actions, A.map(performAction), T.all);
    },
  };

  function performAction(action: FsAction): Task<unknown, FsError> {
    switch (action.type) {
      case 'sequence':
        return pipe(action.actions, A.map(performAction), T.sequence);
      case 'writeFile':
        return pipe(
          fs.writeFile(action.path, action.contents),
          logTask(`[writeFile] ${action.path}`),
        );
      case 'symlink':
        return pipe(
          fs.symlink(action.to, action.from),
          logTask(`[symlink] ${action.from} -> ${action.to}`),
        );
    }
  }
}
