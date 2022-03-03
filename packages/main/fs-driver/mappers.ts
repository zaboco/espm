import { Package } from '#main/core/types';
import { FsAction } from '#main/fs-driver/types';
import path from 'node:path';

export const MODULES_DIRECTORY_NAME = 'es-modules';
const DEPS_DIRECTORY_NAME = '.deps';

export function packageToFsActions(pkg: Package): FsAction[] {
  const realPath = path.join(
    MODULES_DIRECTORY_NAME,
    DEPS_DIRECTORY_NAME,
    pkg.typedef.path,
  );

  const aliasPath = path.join(
    MODULES_DIRECTORY_NAME,
    pkg.identifier.name,
    'index.d.ts',
  );

  return [
    {
      type: 'sequence',
      actions: [
        { type: 'writeFile', path: realPath, contents: pkg.typedef.code },
        { type: 'symlink', from: aliasPath, to: realPath },
      ],
    },
  ];
}
