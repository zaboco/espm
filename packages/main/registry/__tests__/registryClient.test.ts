import { initHttpClientStub } from '#main/__support__/httpClient.stub';
import { REGISTRY_BASE_URL } from '#main/registry/url';
import { CodeTexts } from '#main/shared/codeText';
import { expectToEqual } from '#test-helpers/assertions';
import {
  assertTaskError,
  assertTaskSuccess,
} from '#test-helpers/taskAssertions';
import { T, Task } from '#ts-belt-extra';
import { O, pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';
import { initRegistryClient, TYPES_URL_HEADER } from '../registryClient';

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
    typedefUrl: `${REGISTRY_BASE_URL}/v66/@types/react@17.0.39/index.d.ts`,
    typedefSource: "declare module 'react';",
  };

  const descriptor: PackageDescriptor = {
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
    [pkg.indexUrl]: okOnce(`GET ${pkg.indexUrl}`, {
      data: pkg.indexSource,
      headers: {
        [TYPES_URL_HEADER]: pkg.typedefUrl,
      },
    }),
    [pkg.typedefUrl]: okOnce(`GET ${pkg.typedefUrl}`, {
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
        indexSource: CodeTexts.make(pkg.indexSource),
        typedef: O.Some({
          url: pkg.typedefUrl,
          code: CodeTexts.make(pkg.typedefSource),
          imports: [],
        }),
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

test('returns None typedef when types header not present', () => {
  const pkg = generatePackageFixture();

  const httpClientStub = initHttpClientStub({
    [pkg.indexUrl]: T.of({
      data: pkg.indexSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.fetchPackage(pkg.specifier),
    assertTaskSuccess((r) =>
      expectToEqual(r, {
        originalUrl: pkg.indexUrl,
        indexSource: CodeTexts.make(pkg.indexSource),
        typedef: O.None,
      }),
    ),
  );
});

function okOnce<R>(name: string, r: R): Task<R, string> {
  let callsCount = 0;
  return T.make((rej, res) => {
    callsCount++;
    if (callsCount === 1) {
      res(r);
    } else {
      rej(`Task ${name} called more than once!`);
    }
  });
}

test.run();
