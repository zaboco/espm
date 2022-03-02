import { FilePath } from '#types/fs.api';

export type FsAction =
  | { type: 'writeFile'; path: FilePath; contents: string }
  | { type: 'symlink'; target: FilePath; path: FilePath };
