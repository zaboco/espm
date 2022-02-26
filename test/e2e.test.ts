import { T } from '#lib/ts-belt-extra';
import { pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { MODULES_DIRECTORY_NAME } from '../src/core/filesManager';
import {
  REGISTRY_BASE_URL,
  TYPES_URL_HEADER,
} from '../src/core/registryClient';
import { initManager } from '../src/core';
import { expectToEqual } from './__helpers__/assertions';
import {
  assertTaskError,
  assertTaskSuccess,
} from './__helpers__/taskAssertions';
import { initFsSpy } from './__support__/fs.spy';
import { initHttpClientStub } from './__support__/httpClient.stub';

const test = suite('e2e');

test('it writes types to disk if they are found', () => {
  const packageId = 'react';
  const typesRelativePath = 'v66/@types/react@17.0.39/index.d.ts';
  const validPackageSource = `
  /* esm.sh - ${packageId}@17.0.2 */
  `;
  const typesSource = 'whatever';

  const fsSpy = initFsSpy();
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
    fs: fsSpy,
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
    fs: initFsSpy(),
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
    fs: initFsSpy(),
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
