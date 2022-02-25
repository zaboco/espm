#!/usr/bin/env node

import { safeFs } from '#lib/safe-fs';
import { httpieClient } from '#lib/safe-http-client';
import { GX, T } from '#lib/ts-belt-extra';
import { A, pipe, R, Result } from '@mobily/ts-belt';
import { initManager } from './core';
import { Command } from './types';

main(process.argv.slice(2));

function main(programArgs: ReadonlyArray<string>) {
  const manager = initManager({
    fs: safeFs,
    httpClient: httpieClient,
  });
  pipe(
    programArgs,
    parseCommandArgs,
    T.fromResult,
    T.flatMap(manager.runCommand),
    T.fork(
      (err) => {
        console.error('Error:', err);
      },
      () => {
        console.log('Success!');
      },
    ),
  );
}

function parseCommandArgs(
  args: ReadonlyArray<string>,
): Result<Command, string> {
  const action = A.at(args, 0);
  if (!GX.isOneOf(action, ['add', 'remove'] as const)) {
    return R.Error(`Command not supported: "${action}"`);
  }

  const packageIds = A.drop(args, 1);
  if (packageIds.length === 0) {
    return R.Error(`No package given! Usage: TODO`);
  }

  return R.Ok({
    action: action,
    packageIds: packageIds,
  });
}
