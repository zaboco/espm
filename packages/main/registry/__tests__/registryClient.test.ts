import { initHttpClientStub } from '#main/__support__/httpClient.stub';
import { buildRegistryUrl } from '#main/registry/url';
import { CodeTexts } from '#main/shared/codeText';
import { expectToEqual } from '#test-helpers/assertions';
import {
  assertTaskError,
  assertTaskSuccess,
} from '#test-helpers/taskAssertions';
import { T, Task } from '#ts-belt-extra';
import { O, pipe } from '@mobily/ts-belt';
import * as esModuleLexer from 'es-module-lexer';
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
    typedefUrl: buildRegistryUrl('v66/@types/react@17.0.39/index.d.ts'),
    typedefSource: "declare module 'react';",
  };

  const descriptor: PackageDescriptor = {
    ...defaultDescriptor,
    ...customDescriptor,
  };

  return {
    ...descriptor,
    indexUrl: buildRegistryUrl(descriptor.specifier),
  };
}

test.before(() => esModuleLexer.init);

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

test('extracts imports from the code', () => {
  const importedUrl = `https://cdn.esm.sh/v66/csstype@3.0.10/index.d.ts`;
  const importedSource = "declare module 'css';";

  const topLevelUrl = 'top-level-url';
  const topLevelSource = `
import * as CSS from '${importedUrl}';
declare module 'react';    
`;
  const httpClientStub = initHttpClientStub({
    [topLevelUrl]: okOnce(`GET ${topLevelUrl}`, {
      data: topLevelSource,
      headers: {},
    }),
    [importedUrl]: okOnce(`GET ${importedUrl}`, {
      data: importedSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.traverseImports(topLevelUrl, []),
    assertTaskSuccess((r) =>
      expectToEqual(r, [
        {
          url: topLevelUrl,
          code: CodeTexts.make(topLevelSource),
        },
        { url: importedUrl, code: CodeTexts.make(importedSource) },
      ]),
    ),
  );
});

test('extracts imports from the code, even if nested', () => {
  const secondLevelImportUrl = `second-level-import-url`;
  const secondLevelSource = `
declare module 'second-level-import';
`;

  const firstLevelImportUrl = `first-level-import-url`;
  const firstLevelSource = `
import from '${secondLevelImportUrl}';
declare module 'first-level-import';
`;

  const topLevelUrl = 'top-level-url';
  const topLevelSource = `
import * as CSS from '${firstLevelImportUrl}';
declare module 'react';    
`;
  const httpClientStub = initHttpClientStub({
    [topLevelUrl]: okOnce(`GET ${topLevelUrl}`, {
      data: topLevelSource,
      headers: {},
    }),
    [firstLevelImportUrl]: okOnce(`GET ${firstLevelImportUrl}`, {
      data: firstLevelSource,
      headers: {},
    }),
    [secondLevelImportUrl]: okOnce(`GET ${secondLevelImportUrl}`, {
      data: secondLevelSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.traverseImports(topLevelUrl, []),
    assertTaskSuccess((r) =>
      expectToEqual(r, [
        {
          url: topLevelUrl,
          code: CodeTexts.make(topLevelSource),
        },
        {
          url: firstLevelImportUrl,
          code: CodeTexts.make(firstLevelSource),
        },
        {
          url: secondLevelImportUrl,
          code: CodeTexts.make(secondLevelSource),
        },
      ]),
    ),
  );
});

test('extracts imports from the code, even if multiple in the same file', () => {
  const firstImportUrl = `first-import-url`;
  const firstImportSource = `
declare module 'first-import';
`;
  const secondImportUrl = `second-import-url`;
  const secondImportSource = `
declare module 'second-import';
`;

  const topLevelUrl = 'top-level-url';
  const topLevelSource = `
import '${firstImportUrl}';
import '${secondImportUrl}';
declare module 'react';    
`;
  const httpClientStub = initHttpClientStub({
    [topLevelUrl]: okOnce(`GET ${topLevelUrl}`, {
      data: topLevelSource,
      headers: {},
    }),
    [firstImportUrl]: okOnce(`GET ${firstImportUrl}`, {
      data: firstImportSource,
      headers: {},
    }),
    [secondImportUrl]: okOnce(`GET ${secondImportUrl}`, {
      data: secondImportSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.traverseImports(topLevelUrl, []),
    assertTaskSuccess((r) =>
      expectToEqual(r, [
        {
          url: topLevelUrl,
          code: CodeTexts.make(topLevelSource),
        },
        {
          url: firstImportUrl,
          code: CodeTexts.make(firstImportSource),
        },
        {
          url: secondImportUrl,
          code: CodeTexts.make(secondImportSource),
        },
      ]),
    ),
  );
});

test('extracts imports from the code, avoiding circular dependencies', () => {
  const secondLevelImportUrl = `second-level-import-url`;
  const firstLevelImportUrl = `first-level-import-url`;

  const secondLevelSource = `
import from '${firstLevelImportUrl}';
declare module 'second-level-import';
`;

  const firstLevelSource = `
import from '${secondLevelImportUrl}';
declare module 'first-level-import';
`;

  const topLevelUrl = 'top-level-url';
  const topLevelSource = `
import from '${firstLevelImportUrl}';
declare module 'top-level';    
`;

  const httpClientStub = initHttpClientStub({
    [topLevelUrl]: okOnce(`GET ${topLevelUrl}`, {
      data: topLevelSource,
      headers: {},
    }),
    [firstLevelImportUrl]: okOnce(`GET ${firstLevelImportUrl}`, {
      data: firstLevelSource,
      headers: {},
    }),
    [secondLevelImportUrl]: okOnce(`GET ${secondLevelImportUrl}`, {
      data: secondLevelSource,
      headers: {},
    }),
  });

  const registryClient = initRegistryClient(httpClientStub);

  pipe(
    registryClient.traverseImports(topLevelUrl, []),
    assertTaskSuccess((r) =>
      expectToEqual(r, [
        {
          url: topLevelUrl,
          code: CodeTexts.make(topLevelSource),
        },
        {
          url: firstLevelImportUrl,
          code: CodeTexts.make(firstLevelSource),
        },
        {
          url: secondLevelImportUrl,
          code: CodeTexts.make(secondLevelSource),
        },
      ]),
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
