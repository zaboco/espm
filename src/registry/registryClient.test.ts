import { T } from '#lib/ts-belt-extra';
import { pipe } from '@mobily/ts-belt';
import { expectToEqual } from 'test/__helpers__/assertions';
import {
  assertTaskError,
  assertTaskSuccess,
} from 'test/__helpers__/taskAssertions';
import { initHttpClientStub } from 'test/__support__/httpClient.stub';
import { suite } from 'uvu';
import {
  initRegistryClient,
  REGISTRY_BASE_URL,
  TYPES_URL_HEADER,
} from './registryClient';

const test = suite('registryClient');

interface PackageDescriptor {
  specifier: string;
  indexSource: string;
  typedefSource: string;
  typedefUrl: string;
}

interface PackageFixture extends PackageDescriptor {
  indexUrl: string;
}

function generatePackageFixture(
  customDescriptor: Partial<PackageDescriptor> = {},
): PackageFixture {
  const defaultDescriptor: PackageDescriptor = {
    specifier: 'react',
    indexSource: '/* esm.sh - react@17.0.2 */',
    typedefUrl: 'https://cdn.esm.sh/v66/@types/react@17.0.39/index.d.ts',
    typedefSource: "declare module 'react';",
  };

  const descriptor = {
    ...defaultDescriptor,
    ...customDescriptor,
  };

  return {
    ...descriptor,
    indexUrl: `${REGISTRY_BASE_URL}/${descriptor.specifier}`,
  };
}

test('returns package definition for valid package', () => {
  const pkg = generatePackageFixture();

  const httpClientStub = initHttpClientStub({
    [pkg.indexUrl]: T.of({
      data: pkg.indexSource,
      headers: {
        [TYPES_URL_HEADER]: pkg.typedefUrl,
      },
    }),
    [pkg.typedefUrl]: T.of({
      data: pkg.typedefSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.fetchPackage(pkg.specifier),
    assertTaskSuccess((r) =>
      expectToEqual(r, {
        originalUrl: pkg.indexUrl,
        indexSource: pkg.indexSource,
        typedef: {
          url: pkg.typedefUrl,
          code: pkg.typedefSource,
        },
      }),
    ),
  );
});

test('returns error when package not found', () => {
  const pkg = generatePackageFixture();
  const serverError = 'Not found';

  const httpClientStub = initHttpClientStub({
    [pkg.indexUrl]: T.rejected(serverError),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.fetchPackage(pkg.specifier),
    assertTaskError((e) => expectToEqual(e, serverError)),
  );
});

test('returns error when package source is empty', () => {
  const pkg = generatePackageFixture();
  const expectedError = `No data found for url: ${pkg.indexUrl}`;

  const httpClientStub = initHttpClientStub({
    [pkg.indexUrl]: T.of({
      data: '',
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.fetchPackage(pkg.specifier),
    assertTaskError((e) => expectToEqual(e, expectedError)),
  );
});

test('returns error when types header not present', () => {
  const pkg = generatePackageFixture();
  const expectedError = `Header ${TYPES_URL_HEADER} not found`;

  const httpClientStub = initHttpClientStub({
    [pkg.indexUrl]: T.of({
      data: pkg.indexSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.fetchPackage(pkg.specifier),
    assertTaskError((e) => expectToEqual(e, expectedError)),
  );
});

test.run();
