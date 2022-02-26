import { pipeTask, SX, T, Task } from '#lib/ts-belt-extra';
import { Fs } from '#types/fs.api';
import { F, pipe } from '@mobily/ts-belt';
import path from 'node:path';
import { packageNameFromSpecifier } from 'src/lib/packages';
import { CodeText, PackageSpecifier, Manifest, Package } from 'src/types';

export const MODULES_DIRECTORY_NAME = 'es-modules';
const MANIFEST_FILE_NAME = 'es-modules.json';
const DEPS_DIRECTORY_NAME = '.deps';

const logger = {
  // @ts-expect-error unused right now
  info(...args: unknown[]): void {
    // console.log('[INFO]', ...args);
  },
};

export function initFilesManager(fs: Fs) {
  return {
    storeTypes: (pkg: Package): Task<string, string> => {
      const realPath = path.join(
        MODULES_DIRECTORY_NAME,
        DEPS_DIRECTORY_NAME,
        pkg.types.relativeUrl,
      );
      const aliasPath = pipe(pkg.identifier.name, (pkgName) =>
        path.join(MODULES_DIRECTORY_NAME, pkgName, 'index.d.ts'),
      );

      return pipeTask(
        fs.writeFile(realPath, CodeText.unwrap(pkg.types.text)),
        () => fs.symlink(realPath, aliasPath),
        F.tap((fileName) => {
          logger.info('Wrote types file:', fileName);
        }),
      );
    },

    removeTypes: (packageSpecifier: PackageSpecifier) =>
      pipeTask(
        packageNameFromSpecifier(packageSpecifier),
        SX.prepend(`${MODULES_DIRECTORY_NAME}/`),
        fs.rmdir,
        (v) => v,
        F.tap((dirName) => {
          logger.info('Removed directory:', dirName);
        }),
      ),

    writeManifest: (manifest: Manifest): Task<string, string> => {
      return pipe(
        fs.writeFile(MANIFEST_FILE_NAME, JSON.stringify(manifest, null, 2)),
        T.tap((manifestName) => {
          logger.info('Created manifest file:', manifestName);
        }),
      );
    },
  };
}
