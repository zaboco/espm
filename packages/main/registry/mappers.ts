import { Package } from '#main/core/types';
import { RegistryPackage, RegistryResource } from '#main/registry/types';
import { relativePathFromUrl } from '#main/registry/url';
import {
  PackageFullName,
  PackageIdentifier,
  packageIdentifierFromSpecifier,
} from '#main/shared/packages';
import { CodeText } from '#main/shared/codeText';
import { T, Task } from '#ts-belt-extra';
import { A, O, pipe, R, Result, S } from '@mobily/ts-belt';

export function toPackage(registryPkg: RegistryPackage): Task<Package, string> {
  return pipe(
    registryPkg.indexSource,
    pkgIdentifierFromIndexSource,
    R.map((identifier) => ({
      identifier,
      typedef: toTypedef(registryPkg.typedef),
    })),
    T.fromResult,
  );
}

function toTypedef(typedef: RegistryResource) {
  return {
    code: typedef.code,
    path: relativePathFromUrl(typedef.url),
  };
}

function pkgIdentifierFromIndexSource(
  indexSource: CodeText,
): Result<PackageIdentifier, string> {
  return pipe(
    indexSource,
    extractPackageSpecifierFromIndexSource,
    R.flatMap(packageIdentifierFromSpecifier),
  );
}

function extractPackageSpecifierFromIndexSource(
  packageIndexSource: CodeText,
): Result<PackageFullName, string> {
  const esmHeaderRegex = /^\/\* esm.sh - (.+) \*\/$/;

  return pipe(
    packageIndexSource,
    S.trim,
    S.split('\n'),
    A.head,
    O.flatMap(S.match(esmHeaderRegex)),
    O.flatMap(A.at(1)),
    R.fromFalsy(`Invalid package source: ${packageIndexSource}`),
  );
}
