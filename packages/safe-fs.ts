import { FilePath, Fs } from '#types/fs.api';
import { pipe } from '@mobily/ts-belt';
import fs from 'node:fs/promises';
import path from 'node:path';
import { T, Task } from './ts-belt-extra';

export const safeFs: Fs = {
  writeFile(filePath, fileContents) {
    const dirPath = path.dirname(filePath);
    return pipe(
      mkdir(dirPath),
      T.flatMap(() => writeFile(filePath, fileContents)),
    );
  },
  rm(filePath) {
    return pipe(
      T.fromPromise(() => fs.rm(filePath), String),
      T.map(() => filePath),
    );
  },
  rmdir(dirPath) {
    return pipe(
      T.fromPromise(
        () => fs.rm(dirPath, { recursive: true, force: true }),
        String,
      ),
      T.map(() => dirPath),
    );
  },
  symlink(target, filePath) {
    const tmpFilePath = `${filePath}_${Date.now()}`;
    return pipe(
      mkdir(path.dirname(filePath)),
      T.flatMap(() => symlinkTask(target, tmpFilePath)),
      T.flatMap(() => renameTask(tmpFilePath, filePath)),
      T.map(() => filePath),
    );
  },
};

function symlinkTask(target: FilePath, filePath: FilePath) {
  return T.fromPromise(
    () => fs.symlink(path.resolve(target), filePath),
    String,
  );
}

function renameTask(oldPath: FilePath, newPath: FilePath) {
  return T.fromPromise(() => fs.rename(oldPath, newPath), String);
}

function writeFile(
  filePath: FilePath,
  fileContents: string,
): Task<FilePath, string> {
  return pipe(
    T.fromPromise(() => fs.writeFile(filePath, fileContents), String),
    T.map(() => filePath),
  );
}

function mkdir(path: FilePath): Task<FilePath, string> {
  return pipe(
    T.fromPromise(() => fs.mkdir(path, { recursive: true }), String),
    T.map(() => path),
  );
}
