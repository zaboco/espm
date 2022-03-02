import { FilePath, FsClient } from '#interfaces/fsClient.api';
import { T } from '#ts-belt-extra';

type FsAction =
  | { type: 'rm'; path: FilePath }
  | { type: 'rmdir'; path: FilePath }
  | { type: 'symlink'; target: FilePath; path: FilePath }
  | { type: 'writeFile'; path: FilePath; contents: string };

interface FsClientSpy extends FsClient {
  getPerformedActions(): FsAction[];
}

export function initFsClientSpy(): FsClientSpy {
  const actions: FsAction[] = [];
  return {
    rm(filePath) {
      actions.push({ type: 'rm', path: filePath });
      return T.of(filePath);
    },
    rmdir(filePath) {
      actions.push({ type: 'rmdir', path: filePath });
      return T.of(filePath);
    },
    symlink(target, filePath) {
      actions.push({ type: 'symlink', target, path: filePath });
      return T.of(filePath);
    },
    writeFile(filePath, fileContents: string) {
      actions.push({
        type: 'writeFile',
        path: filePath,
        contents: fileContents,
      });
      return T.of(filePath);
    },
    getPerformedActions() {
      return actions;
    },
  };
}
