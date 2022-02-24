import { SX, T, Task } from '#lib/ts-belt-extra';
import { Fs } from '#types/fs.api';
import { pipe, R } from '@mobily/ts-belt';
import { packageNameFromId } from 'src/lib/packages';
import { Manifest, GivenPackageId, Package, CodeText } from 'src/types';

const MODULES_DIRECTORY_NAME = 'es-modules';
const MANIFEST_FILE_NAME = 'es-modules.json';

export function initFilesManager(fs: Fs) {
  return {
    storeTypes: (pkg: Package): Task<string, string> =>
      pipe(
        pkg.id,
        packageNameFromId,
        R.map(SX.prepend(`${MODULES_DIRECTORY_NAME}/`)),
        T.fromResult,
        T.flatMap(fs.mkdir),
        T.tap((dirName) => {
          console.log('[INFO] Created directory:', dirName);
        }),
        T.flatMap((dirName) =>
          fs.writeFile(`${dirName}/index.d.ts`, CodeText.unwrap(pkg.typesText)),
        ),
        T.tap((fileName) => {
          console.log('[INFO] Wrote types file:', fileName);
        }),
      ),

    removeTypes: (packageId: GivenPackageId) =>
      pipe(
        packageId,
        packageNameFromId,
        R.map(SX.prepend(`${MODULES_DIRECTORY_NAME}/`)),
        T.fromResult,
        T.flatMap(fs.rmdir),
        T.tap((dirName) => {
          console.log('[INFO] Removed directory:', dirName);
        }),
      ),

    writeManifest: (manifest: Manifest): Task<string, string> => {
      return pipe(
        fs.writeFile(MANIFEST_FILE_NAME, JSON.stringify(manifest, null, 2)),
        T.tap((manifestName) => {
          console.log('[INFO] Created manifest file:', manifestName);
        }),
      );
    },
  };
}
