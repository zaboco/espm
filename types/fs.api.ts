import { Task } from '#lib/ts-belt-extra';

export type FsError = string | never;
export type FilePath = string | never;

export interface Fs {
  rm(filePath: FilePath): Task<FilePath, FsError>;
  rmdir(dirPath: FilePath): Task<FilePath, FsError>;
  writeFile(filePath: FilePath, fileContents: string): Task<FilePath, FsError>;
  mkdir(path: FilePath): Task<FilePath, FsError>;
}
