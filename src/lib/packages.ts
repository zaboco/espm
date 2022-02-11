import { A, O, pipe, R, Result, S } from '@mobily/ts-belt';
import {
  PackageId,
  PackageDescriptor,
  PackageName,
  GivenPackageId,
  CodeText,
} from 'src/types';

export function packageNameFromId(
  packageId: GivenPackageId,
): Result<PackageName, string> {
  return pipe(
    packageId,
    packageDescriptorFromId,
    R.map((d) => d.name),
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
): Result<PackageId, string> {
  const esmHeaderRegex = /^\/\* esm.sh - (.+) \*\/$/;

  return pipe(
    packageIndexSource,
    CodeText.unwrap,
    S.split('\n'),
    A.head,
    O.flatMap(S.match(esmHeaderRegex)),
    O.flatMap(A.at(1)),
    R.fromFalsy(`Invalid package source: ${packageIndexSource}`),
  );
}

export function packageDescriptorFromId(
  packageId: GivenPackageId,
): Result<PackageDescriptor, string> {
  const packageIdRegex = /^(@?[^@]+)(?:@(.+))?/;
  return pipe(
    packageId,
    S.match(packageIdRegex),
    O.flatMap((matches) => {
      const optionalName = A.at(matches, 1);
      const version = pipe(matches, A.get(2), O.getWithDefault('latest'));

      return pipe(
        optionalName,
        O.map<string, PackageDescriptor>((name) => ({ name, version })),
      );
    }),
    R.fromFalsy(`Package id is invalid: ${packageId}`),
  );
}
