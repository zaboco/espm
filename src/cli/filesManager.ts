import { safeFs } from '#lib/safe-fs';
import { SX, T, Task } from '#lib/ts-belt-extra';
import { A, O, pipe, S } from '@mobily/ts-belt';

const MODULES_DIRECTORY_NAME = 'es-modules';

export const filesManager = {
  storeTypes:
    (packageId: string) =>
    (typesSource: string): Task<string, string> =>
      pipe(
        packageId,
        extractPackageName,
        T.map(SX.prepend(`${MODULES_DIRECTORY_NAME}/`)),
        T.flatMap(safeFs.mkdir),
        T.tap((dirName) => {
          console.log('[INFO] Created directory:', dirName);
        }),
        T.flatMap((dirName) =>
          safeFs.writeFile(`${dirName}/index.d.ts`, typesSource),
        ),
        T.tap((fileName) => {
          console.log('[INFO] Wrote types file:', fileName);
        }),
      ),

  removeTypes: (packageId: string) =>
    pipe(
      packageId,
      extractPackageName,
      T.map(SX.prepend(`${MODULES_DIRECTORY_NAME}/`)),
      T.flatMap(safeFs.rmdir),
      T.tap((dirName) => {
        console.log('[INFO] Removed directory:', dirName);
      }),
    ),
};

function extractPackageName(packageId: string): Task<string, string> {
  const packageIdRegex = /^(@?[^@]+)(?:@.+)?/;
  return pipe(
    packageId,
    S.match(packageIdRegex),
    O.flatMap(A.at(1)),
    T.fromOption(`Package id is invalid: ${packageId}`),
  );
}
