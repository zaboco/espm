import { Package, Resource } from '#main/core/types';
import { RegistryPackage, RegistryResource } from '#main/registry/types';
import { relativePathFromUrl } from '#main/registry/url';
import { CodeText, CodeTexts } from '#main/shared/codeText';
import {
  PackageFullName,
  PackageIdentifier,
  packageIdentifierFromSpecifier,
} from '#main/shared/packages';
import { T, Task } from '#ts-belt-extra';
import { A, O, Option, pipe, R, Result, S } from '@mobily/ts-belt';

export function toPackage(registryPkg: RegistryPackage): Task<Package, string> {
  return pipe(
    registryPkg.indexSource,
    pkgIdentifierFromIndexSource,
    R.map((identifier) => ({
      identifier,
      typedef: pipe(
        registryPkg.typedef,
        toTypedef,
        O.getWithDefault(generateTypedefStub(identifier)),
      ),
    })),
    T.fromResult,
  );
}

function toTypedef(typedefOption: Option<RegistryResource>): Option<Resource> {
  return pipe(
    typedefOption,
    O.map((typedef) => ({
      code: typedef.code,
      path: relativePathFromUrl(typedef.url),
    })),
  );
}

function generateTypedefStub({ name, version }: PackageIdentifier): Resource {
  return {
    path: `/generated/${name}@${version}/index.d.ts`,
    code: CodeTexts.make(`declare module '${name}';`),
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
