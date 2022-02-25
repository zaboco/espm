import { T } from '#lib/ts-belt-extra';
import { FilePath, Fs } from '#types/fs.api';

type FsAction =
  | { type: 'rm'; path: FilePath }
  | { type: 'rmdir'; path: FilePath }
  | { type: 'mkdir'; path: FilePath }
  | { type: 'symlink'; target: FilePath; path: FilePath }
  | { type: 'writeFile'; path: FilePath; contents: string }
  | { type: 'writeFileDeep'; path: FilePath; contents: string };

interface FsSpy extends Fs {
  getPerformedActions(): FsAction[];
}

export function initFsSpy(): FsSpy {
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
    mkdir(filePath) {
      actions.push({ type: 'mkdir', path: filePath });
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
    writeFileDeep(filePath, fileContents: string) {
      actions.push({
        type: 'writeFileDeep',
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
