import { A, O, pipe, R, Result, S } from '@mobily/ts-belt';

export type PackageSpecifier = PackageName | PackageFullName;
export type PackageFullName = `${PackageName}@${PackageVersion}`;
export type PackageName = string & {};
export type PackageVersion = string & {};
export type PackageIdentifier = { name: PackageName; version: PackageVersion };

export function packageIdentifierFromSpecifier(
  packageId: PackageSpecifier,
): Result<PackageIdentifier, string> {
  const packageIdRegex = /^(@?[^@]+)(?:@(.+))?$/;

  const matchesOption = pipe(packageId, S.match(packageIdRegex));

  const version = pipe(
    matchesOption,
    O.flatMap(A.getUnsafe(2)),
    O.getWithDefault('latest'),
  );

  return pipe(
    matchesOption,
    O.flatMap(A.at(1)),
    O.flatMap((name) => ({ name, version })),
    R.fromFalsy(`Package specifier is invalid: ${packageId}`),
  );
}
