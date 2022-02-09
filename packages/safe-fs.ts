import { pipe } from '@mobily/ts-belt';
import fs from 'node:fs/promises';
import { T, Task } from './ts-belt-extra';

export const safeFs = {
  writeFile(filePath: string, fileContents: string): Task<string, string> {
    return pipe(
      T.fromPromise(() => fs.writeFile(filePath, fileContents), String),
      T.map(() => filePath),
    );
  },
  rm(filePath: string): Task<string, string> {
    return pipe(
      T.fromPromise(() => fs.rm(filePath), String),
      T.map(() => filePath),
    );
  },
  rmdir(dirPath: string): Task<string, string> {
    return pipe(
      T.fromPromise(
        () => fs.rm(dirPath, { recursive: true, force: true }),
        String,
      ),
      T.map(() => dirPath),
    );
  },
  mkdir(path: string): Task<string, string> {
    return pipe(
      T.fromPromise(() => fs.mkdir(path, { recursive: true }), String),
      T.map(() => path),
    );
  },
};
