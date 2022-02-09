#!/usr/bin/env node

import { GX, T, Task } from '#lib/ts-belt-extra';
import { A, pipe, R, Result } from '@mobily/ts-belt';
import { filesManager } from './cli/filesManager';
import { registryClient } from './cli/registryClient';
import { Command } from './types';

main(process.argv.slice(2));

function main(programArgs: ReadonlyArray<string>) {
  pipe(
    programArgs,
    parseCommandArgs,
    T.fromResult,
    T.flatMap(runCommand),
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

function runCommand(command: Command): Task<unknown, string> {
  if (command.action === 'add') {
    return pipe(
      command.packageIds,
      A.map(addPackageTypes),
      T.all,
      T.mapError(A.join(', ')),
    );
  }
  if (command.action === 'remove') {
    return pipe(
      command.packageIds,
      A.map(removePackageTypes),
      T.all,
      T.mapError(A.join(', ')),
    );
  }
  return T.of(undefined);
}

function addPackageTypes(packageId: string): Task<string, string> {
  return pipe(
    registryClient.fetchTypesSource(packageId),
    T.flatMap(filesManager.storeTypes(packageId)),
  );
}

function removePackageTypes(packageId: string): Task<string, string> {
  return filesManager.removeTypes(packageId);
}
