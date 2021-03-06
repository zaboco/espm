import { FilePath } from '#interfaces/fsClient.api';

export type FsAction =
  | { type: 'writeFile'; path: FilePath; contents: string }
  | { type: 'symlink'; to: FilePath; from: FilePath }
  | { type: 'sequence'; actions: FsAction[] };
