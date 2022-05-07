import { Package, Resource } from '#main/core/types';
import { FsAction } from '#main/fs-driver/types';
import { PackageIdentifier } from '#main/shared/packages';
import { A } from '@mobily/ts-belt';
import path from 'node:path';

export const MODULES_DIRECTORY_NAME = 'es-modules';
const DEPS_DIRECTORY_NAME = '.deps';

export function packageToFsActions(pkg: Package): FsAction[] {
  const writeMainTypedef = resourceWriteAction(pkg.typedef);
  const writeImportedTypedefs = A.map(pkg.typedef.imports, resourceWriteAction);

  return [
    {
      type: 'sequence',
      actions: [
        writeMainTypedef,
        ...writeImportedTypedefs,
        typedefIndexWriteAction(pkg),
      ],
    },
  ];
}

function typedefIndexWriteAction(pkg: Package): FsAction {
  return {
    type: 'writeFile',
    path: buildTypedefPath(pkg.identifier),
    contents: pkg.typedef.indexCode,
  };
}

function resourceWriteAction(resource: Resource): FsAction {
  const realPath = buildDepPath(resource.path);
  return { type: 'writeFile', path: realPath, contents: resource.code };
}

export function buildDepPath(filePath: string) {
  return path.join(MODULES_DIRECTORY_NAME, DEPS_DIRECTORY_NAME, filePath);
}

export function buildTypedefPath(identifier: PackageIdentifier) {
  return path.join(MODULES_DIRECTORY_NAME, identifier.name, 'index.d.ts');
}
