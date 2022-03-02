import { FsClient } from '#interfaces/fsClient.api';
import { packageNameFromSpecifier } from '#main/lib/packages';
import { PackageSpecifier } from '#main/shared/types';
import { Package } from '#main/types';
import { pipeTask, SX, Task } from '#ts-belt-extra';
import { F, pipe } from '@mobily/ts-belt';
import path from 'node:path';

export const MODULES_DIRECTORY_NAME = 'es-modules';
const DEPS_DIRECTORY_NAME = '.deps';

const logger = {
  // @ts-expect-error unused right now
  info(...args: unknown[]): void {
    // console.log('[INFO]', ...args);
  },
};

export function initFilesManager(fsClient: FsClient) {
  return {
    storeTypes: (pkg: Package): Task<string, string> => {
      const realPath = path.join(
        MODULES_DIRECTORY_NAME,
        DEPS_DIRECTORY_NAME,
        pkg.typedef.relativeUrl,
      );
      const aliasPath = pipe(pkg.identifier.name, (pkgName) =>
        path.join(MODULES_DIRECTORY_NAME, pkgName, 'index.d.ts'),
      );

      return pipeTask(
        fsClient.writeFile(realPath, pkg.typedef.text),
        () => fsClient.symlink(realPath, aliasPath),
        F.tap((fileName) => {
          logger.info('Wrote types file:', fileName);
        }),
      );
    },

    removeTypes: (packageSpecifier: PackageSpecifier) =>
      pipeTask(
        packageNameFromSpecifier(packageSpecifier),
        SX.prepend(`${MODULES_DIRECTORY_NAME}/`),
        fsClient.rmdir,
        (v) => v,
        F.tap((dirName) => {
          logger.info('Removed directory:', dirName);
        }),
      ),
  };
}
