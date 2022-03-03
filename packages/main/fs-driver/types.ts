import { FilePath } from '#interfaces/fsClient.api';

export type FsAction =
  | { type: 'writeFile'; path: FilePath; contents: string }
  | { type: 'symlink'; target: FilePath; path: FilePath }
  | { type: 'sequence'; actions: FsAction[] };
