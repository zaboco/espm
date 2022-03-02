import { initFsClientSpy } from '#main/__support__/fs.spy';
import { initHttpClientStub } from '#main/__support__/httpClient.stub';
import { MODULES_DIRECTORY_NAME } from '#main/filesManager';
import { initManager } from '#main/index';
import { REGISTRY_BASE_URL, TYPES_URL_HEADER } from '#main/registryClient';
import { expectToEqual } from '#test-helpers/assertions';
import {
  assertTaskError,
  assertTaskSuccess,
} from '#test-helpers/taskAssertions';
import { T } from '#ts-belt-extra';
import { pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const test = suite('e2e');

test('it writes types to disk if they are found', () => {
  const packageId = 'react';
  const typesRelativePath = 'v66/@types/react@17.0.39/index.d.ts';
  const validPackageSource = `
  /* esm.sh - ${packageId}@17.0.2 */
  `;
  const typesSource = 'whatever';

  const fsSpy = initFsClientSpy();
  const typesUrl = `https://cdn.esm.sh/${typesRelativePath}`;
  const httpClientStub = initHttpClientStub({
    [`${REGISTRY_BASE_URL}/${packageId}`]: T.of({
      data: validPackageSource,
      headers: {
        [TYPES_URL_HEADER]: typesUrl,
      },
    }),
    [typesUrl]: T.of({
      data: typesSource,
      headers: {},
    }),
  });

  const manager = initManager({
    fsClient: fsSpy,
    httpClient: httpClientStub,
  });

  pipe(
    { action: 'add', packageSpecifiers: [packageId] },
    manager.runCommand,
    assertTaskSuccess(),
  );

  const expectedRealPath = `${MODULES_DIRECTORY_NAME}/.deps/${typesRelativePath}`;
  expectToEqual(fsSpy.getPerformedActions(), [
    {
      type: 'writeFile',
      path: expectedRealPath,
      contents: typesSource,
    },
    {
      type: 'symlink',
      target: expectedRealPath,
      path: `${MODULES_DIRECTORY_NAME}/${packageId}/index.d.ts`,
    },
  ]);
});

test('it fails if the package source header is not valid', () => {
  const invalidPackageSource = `
/* wrong format */
`;

  const manager = initManager({
    fsClient: initFsClientSpy(),
    httpClient: initHttpClientStub({
      [`${REGISTRY_BASE_URL}/whatever`]: T.of({
        data: invalidPackageSource,
        headers: {},
      }),
    }),
  });

  pipe(
    { action: 'add', packageSpecifiers: ['whatever'] },
    manager.runCommand,
    assertTaskError((e) => {
      assert.match(e, /invalid package source/i);
    }),
  );
});

test('it fails if there is a registry error', () => {
  const registryError = 'Not found';
  const manager = initManager({
    fsClient: initFsClientSpy(),
    httpClient: initHttpClientStub({
      [`${REGISTRY_BASE_URL}/whatever`]: T.rejected(registryError),
    }),
  });

  pipe(
    { action: 'add', packageSpecifiers: ['whatever'] },
    manager.runCommand,
    assertTaskError((e) => {
      expectToEqual(e, registryError);
    }),
  );
});

test.run();
