import { Resource } from '#main/core/types';
import { toPackage } from '#main/registry/mappers';
import { RegistryPackage } from '#main/registry/types';
import { REGISTRY_BASE_URL } from '#main/registry/url';
import { CodeTexts } from '#main/shared/codeText';
import { PackageIdentifier } from '#main/shared/packages';
import { expectToEqual } from '#test-helpers/assertions';
import { assertTaskSuccess } from '#test-helpers/taskAssertions';
import { O, pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';

const test = suite('registry/mappers - toPackage');

test('it maps a valid pkg correctly', () => {
  const { pkg: expectedPkg, registryPkg } = genValidFixtureWithTypedef();
  pipe(
    registryPkg,
    toPackage,
    assertTaskSuccess((actualPkg) => expectToEqual(actualPkg, expectedPkg)),
  );
});

test('it maps to a generated stub if typedef is missing', () => {
  const { pkg: expectedPkg, registryPkg } = genValidFixtureWithoutTypedef();
  pipe(
    registryPkg,
    toPackage,
    assertTaskSuccess((actualPkg) => expectToEqual(actualPkg, expectedPkg)),
  );
});

test.run();

function genValidFixtureWithTypedef() {
  const identifier: PackageIdentifier = {
    name: 'react',
    version: '17.0.2',
  };
  const typedef: Resource = {
    path: '/v66/@types/react@17.0.33/index.d.ts',
    code: CodeTexts.make('whatever'),
  };
  const registryPkg: RegistryPackage = {
    indexSource: CodeTexts.make(
      `/* esm.sh - ${identifier.name}@${identifier.version} */`,
    ),
    originalUrl: `${REGISTRY_BASE_URL}/${identifier.name}`,
    typedef: O.Some({
      url: `${REGISTRY_BASE_URL}${typedef.path}`,
      code: typedef.code,
    }),
  };

  return {
    registryPkg,
    pkg: {
      identifier,
      typedef,
    },
  };
}

function genValidFixtureWithoutTypedef() {
  const identifier: PackageIdentifier = {
    name: 'foo',
    version: '0.0.7',
  };

  const typedef: Resource = {
    path: `/generated/${identifier.name}@${identifier.version}/index.d.ts`,
    code: CodeTexts.make(`declare module '${identifier.name}';`),
  };

  const registryPkg: RegistryPackage = {
    indexSource: CodeTexts.make(
      `/* esm.sh - ${identifier.name}@${identifier.version} */`,
    ),
    originalUrl: `${REGISTRY_BASE_URL}/${identifier.name}`,
    typedef: O.None,
  };

  return {
    registryPkg,
    pkg: {
      identifier,
      typedef,
    },
  };
}
