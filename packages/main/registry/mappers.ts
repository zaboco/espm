import { Package, Resource, TopLevelResource } from '#main/core/types';
import {
  RegistryPackage,
  RegistryResource,
  TopLevelRegistryResource,
} from '#main/registry/types';
import { relativePathFromUrl } from '#main/registry/url';
import { CodeText, CodeTexts } from '#main/shared/codeText';
import {
  PackageFullName,
  PackageIdentifier,
  packageIdentifierFromSpecifier,
} from '#main/shared/packages';
import { T, Task } from '#ts-belt-extra';
import { A, O, pipe, R, Result, S } from '@mobily/ts-belt';
import path from 'node:path';

export function toPackage(registryPkg: RegistryPackage): Task<Package, string> {
  return pipe(
    registryPkg.indexSource,
    pkgIdentifierFromIndexSource,
    R.map((identifier) => ({
      identifier,
      typedef: pipe(
        registryPkg.typedef,
        O.map((res) => toTopLevelResource(res, identifier)),
        O.getWithDefault(generateTypedefStub(identifier)),
      ),
    })),
    T.fromResult,
  );
}

function toTopLevelResource(
  topLevelRegistryResource: TopLevelRegistryResource,
  identifier: PackageIdentifier,
): TopLevelResource {
  const resource = toResource(topLevelRegistryResource);
  return {
    ...resource,
    imports: topLevelRegistryResource.imports.map(toResource),
    packageJson: CodeTexts.make(
      `{
  "name": "${identifier.name}",
  "version": "${identifier.version}",
  "types": "${path.relative(`${identifier.name}`, `.deps/${resource.path}`)}"
}`,
    ),
  };
}

function toResource(registryResource: RegistryResource): Resource {
  return {
    code: registryResource.code,
    path: relativePathFromUrl(registryResource.url),
  };
}

function generateTypedefStub({
  name,
  version,
}: PackageIdentifier): TopLevelResource {
  return {
    path: `/generated/${name}@${version}/index.d.ts`,
    code: CodeTexts.make(`declare module '${name}';`),
    packageJson: CodeTexts.make(
      `{
  "name": "${name}",
  "version": "${version}",
  "types": "../.deps/generated/${name}@${version}/index"
}`,
    ),
    imports: [],
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
