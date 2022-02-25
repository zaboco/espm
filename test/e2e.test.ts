import { T } from '#lib/ts-belt-extra';
import { FilePath, Fs } from '#types/fs.api';
import { HttpClient, HttpTask } from '#types/httpClient.api';
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

const test = suite('e2e');

function initHttpClientStub(httpTask: HttpTask<string>): HttpClient {
  return {
    get<R>(_url: string): HttpTask<R> {
      return httpTask as unknown as HttpTask<R>;
    },
  };
}

type FsAction =
  | { type: 'rm'; path: FilePath }
  | { type: 'rmdir'; path: FilePath }
  | { type: 'mkdir'; path: FilePath }
  | { type: 'writeFile'; path: FilePath; contents: string };

interface FsSpy extends Fs {
  getPerformedActions(): FsAction[];
}

function initFsSpy(): FsSpy {
  const actions: FsAction[] = [];
  return {
    rm(filePath) {
      actions.push({ type: 'rm', path: filePath });
      return T.of(filePath);
    },
    rmdir(filePath) {
      actions.push({ type: 'rmdir', path: filePath });
      return T.of(filePath);
    },
    mkdir(filePath) {
      actions.push({ type: 'mkdir', path: filePath });
      return T.of(filePath);
    },
    writeFile(filePath, fileContents: string) {
      actions.push({
        type: 'writeFile',
        path: filePath,
        contents: fileContents,
      });
      return T.of(filePath);
    },
    getPerformedActions() {
      return actions;
    },
  };
}

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
