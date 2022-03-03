import { FsClient, FsError } from '#interfaces/fsClient.api';
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
        return fs.writeFile(action.path, action.contents);
      case 'symlink':
        return fs.symlink(action.target, action.path);
    }
  }
}
