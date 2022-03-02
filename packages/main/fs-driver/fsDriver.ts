import { T, Task } from '#ts-belt-extra';
import { FilePath, FsClient, FsError } from '#interfaces/fsClient.api';
import { A, pipe } from '@mobily/ts-belt';
import { FsAction } from './types';

export function initFsDriver(fs: FsClient) {
  return {
    perform: performAction,
    performSequence(actions: FsAction[]): Task<readonly FilePath[], FsError> {
      return pipe(actions, A.map(performAction), T.sequence);
    },
  };

  function performAction(action: FsAction): Task<FilePath, FsError> {
    switch (action.type) {
      case 'writeFile':
        return fs.writeFile(action.path, action.contents);
      case 'symlink':
        return fs.symlink(action.target, action.path);
    }
  }
}
