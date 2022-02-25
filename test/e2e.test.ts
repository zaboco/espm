import { T } from '#lib/ts-belt-extra';
import { pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { TYPES_URL_HEADER } from '../src/cli/registryClient';
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
  const validPackageSource = `
  /* esm.sh - react@17.0.2 */
  `;

  const fsSpy = initFsSpy();
  const manager = initManager({
    fs: fsSpy,
    httpClient: initHttpClientStub(
      T.of({
        data: validPackageSource,
        headers: {
          [TYPES_URL_HEADER]: 'foo',
        },
      }),
    ),
  });

  pipe(
    { action: 'add', packageIds: ['react'] },
    manager.runCommand,
    assertTaskSuccess(),
  );

  expectToEqual(fsSpy.getPerformedActions(), [
    { type: 'mkdir', path: 'es-modules/react' },
    {
      type: 'writeFile',
      path: 'es-modules/react/index.d.ts',
      contents: validPackageSource,
    },
  ]);
});

test('it fails if the package source header is not valid', () => {
  const invalidPackageSource = `
/* wrong format esm.sh - react@17.0.2 */
`;

  const manager = initManager({
    fs: initFsSpy(),
    httpClient: initHttpClientStub(
      T.of({
        data: invalidPackageSource,
        headers: {},
      }),
    ),
  });

  pipe(
    { action: 'add', packageIds: ['whatever'] },
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
    httpClient: initHttpClientStub(T.rejected(registryError)),
  });

  pipe(
    { action: 'add', packageIds: ['whatever'] },
    manager.runCommand,
    assertTaskError((e) => {
      expectToEqual(e, registryError);
    }),
  );
});

test.run();
