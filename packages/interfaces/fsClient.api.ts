import { Task } from '#ts-belt-extra';

export type FsError = string & {};
export type FilePath = string & {};

export interface FsClient {
  rm(filePath: FilePath): Task<FilePath, FsError>;
  rmdir(dirPath: FilePath): Task<FilePath, FsError>;
  writeFile(
    deepFilePath: FilePath,
    fileContents: string,
  ): Task<FilePath, FsError>;
  symlink(to: FilePath, from: FilePath): Task<FilePath, FsError>;
}
