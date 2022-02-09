#!/usr/bin/env node

import { T, Task } from '#lib/ts-belt-extra';
import { A, pipe, R, Result } from '@mobily/ts-belt';
import { filesManager } from './cli/filesManager';
import { registryClient } from './cli/registryClient';

interface Command {
  action: 'add';
  packageIds: readonly string[];
}

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
  if (A.at(args, 0) !== 'add') {
    return R.Error(`Command not supported: "${A.at(args, 0)}"`);
  }

  const packageIds = A.drop(args, 1);
  if (packageIds.length === 0) {
    return R.Error(`No package given! Usage: TODO`);
  }

  return R.Ok({
    action: 'add',
    packageIds: packageIds,
  });
}

function runCommand(command: Command): Task<unknown, string> {
  if (command.action === 'add') {
    return pipe(command.packageIds, A.map(addPackageTypes), T.sequence);
  }
  return T.of(undefined);
}

function addPackageTypes(packageId: string): Task<string, string> {
  return pipe(
    registryClient.fetchTypesSource(packageId),
    T.flatMap(filesManager.storeTypes(packageId)),
  );
}
