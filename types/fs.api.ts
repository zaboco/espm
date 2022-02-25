import { Task } from '#lib/ts-belt-extra';

export type FsError = string & {};
export type FilePath = string & {};

export interface Fs {
  rm(filePath: FilePath): Task<FilePath, FsError>;
  rmdir(dirPath: FilePath): Task<FilePath, FsError>;
  writeFile(
    deepFilePath: FilePath,
    fileContents: string,
  ): Task<FilePath, FsError>;
  symlink(target: FilePath, path: FilePath): Task<FilePath, FsError>;
}
