import { T, Task } from '#ts-belt-extra';
import { A, O, pipe, S } from '@mobily/ts-belt';
import {
  PackageFullName,
  PackageIdentifier,
  PackageName,
  PackageSpecifier,
  CodeText,
} from '#main/shared/types';

export function packageNameFromSpecifier(
  packageSpecifier: PackageSpecifier,
): Task<PackageName, string> {
  return pipe(
    packageSpecifier,
    packageIdentifierFromId,
    T.map((d) => d.name),
  );
}

/**
 * esm.sh files have a comment in the header:
 *
 *  / * esm.sh - <package>@<version> * /
 *
 */
export function extractPackageIdFromIndexSource(
  packageIndexSource: CodeText,
): Task<PackageFullName, string> {
  const esmHeaderRegex = /^\/\* esm.sh - (.+) \*\/$/;

  return pipe(
    packageIndexSource,
    S.trim,
    S.split('\n'),
    A.head,
    O.flatMap(S.match(esmHeaderRegex)),
    O.flatMap(A.at(1)),
    T.fromOption(`Invalid package source: ${packageIndexSource}`),
  );
}

export function packageIdentifierFromId(
  packageId: PackageSpecifier,
): Task<PackageIdentifier, string> {
  const packageIdRegex = /^(@?[^@]+)(?:@(.+))?/;
  return pipe(
    packageId,
    S.match(packageIdRegex),
    O.flatMap((matches) => {
      const optionalName = A.at(matches, 1);
      const version = pipe(matches, A.get(2), O.getWithDefault('latest'));

      return pipe(
        optionalName,
        O.map<string, PackageIdentifier>((name) => ({ name, version })),
      );
    }),
    T.fromOption(`Package specifier is invalid: ${packageId}`),
  );
}
