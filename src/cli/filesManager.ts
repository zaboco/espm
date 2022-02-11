import { safeFs } from '#lib/safe-fs';
import { SX, T, Task } from '#lib/ts-belt-extra';
import { pipe, R } from '@mobily/ts-belt';
import { packageNameFromId } from 'src/lib/packages';
import { Manifest, GivenPackageId, Package } from 'src/types';

const MODULES_DIRECTORY_NAME = 'es-modules';
const MANIFEST_FILE_NAME = 'es-modules.json';

export const filesManager = {
  storeTypes: (pkg: Package): Task<string, string> =>
    pipe(
      pkg.id,
      packageNameFromId,
      R.map(SX.prepend(`${MODULES_DIRECTORY_NAME}/`)),
      T.fromResult,
      T.flatMap(safeFs.mkdir),
      T.tap((dirName) => {
        console.log('[INFO] Created directory:', dirName);
      }),
      T.flatMap((dirName) =>
        safeFs.writeFile(`${dirName}/index.d.ts`, pkg.typesText),
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
      T.flatMap(safeFs.rmdir),
      T.tap((dirName) => {
        console.log('[INFO] Removed directory:', dirName);
      }),
    ),

  writeManifest: (manifest: Manifest): Task<string, string> => {
    return pipe(
      safeFs.writeFile(MANIFEST_FILE_NAME, JSON.stringify(manifest, null, 2)),
      T.tap((manifestName) => {
        console.log('[INFO] Created manifest file:', manifestName);
      }),
    );
  },
};
