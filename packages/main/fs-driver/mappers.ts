import { Package } from '#main/core/types';
import { FsAction } from '#main/fs-driver/types';
import { PackageIdentifier } from '#main/shared/packages';
import path from 'node:path';

export const MODULES_DIRECTORY_NAME = 'es-modules';
const DEPS_DIRECTORY_NAME = '.deps';

export function packageToFsActions(pkg: Package): FsAction[] {
  const realPath = buildDepPath(pkg.typedef.path);

  const identifier = pkg.identifier;
  const aliasPath = buildTypedefPath(identifier);

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

export function buildDepPath(filePath: string) {
  return path.join(MODULES_DIRECTORY_NAME, DEPS_DIRECTORY_NAME, filePath);
}

export function buildTypedefPath(identifier: PackageIdentifier) {
  return path.join(MODULES_DIRECTORY_NAME, identifier.name, 'index.d.ts');
}
