#!/usr/bin/env node

import { GX, T, Task } from '#lib/ts-belt-extra';
import { A, D, flow, pipe, R, Result } from '@mobily/ts-belt';
import { buildManifest } from 'src/lib/manifest';
import { packageDescriptorFromId } from 'src/lib/packages';
import { filesManager } from './cli/filesManager';
import { registryClient } from './cli/registryClient';
import { Command, PackageId, GivenPackageId } from './types';

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
    return addCommand(command.packageIds);
  }
  if (command.action === 'remove') {
    return pipe(command.packageIds, A.map(removePackageTypes), T.all);
  }
  return T.of(undefined);
}

function addCommand(
  packageIds: readonly GivenPackageId[],
): Task<string, string> {
  const fetchPackagesTask = pipe(
    packageIds,
    A.map(registryClient.fetchPackage),
    T.all,
  );

  const writeTypesTask = pipe(
    fetchPackagesTask,
    T.flatMap(flow(A.map(filesManager.storeTypes), T.all)),
  );

  const writeManifestTask = pipe(
    fetchPackagesTask,
    T.map(A.map(D.getUnsafe('id'))),
    T.flatMap(writeManifest),
  );

  return pipe(
    writeTypesTask,
    T.flatMap(() => writeManifestTask),
  );
}

function writeManifest(packageIds: readonly PackageId[]): Task<string, string> {
  return pipe(
    packageIds,
    A.map(packageDescriptorFromId),
    combineResults,
    R.map(buildManifest),
    T.fromResult,
    T.flatMap(filesManager.writeManifest),
  );
}

function removePackageTypes(packageId: GivenPackageId): Task<string, string> {
  return filesManager.removeTypes(packageId);
}

function combineResults<$R, $E>(
  results: readonly Result<$R, $E>[],
): Result<readonly $R[], $E> {
  return pipe(
    results,
    A.reduce(resultOf<readonly $R[], $E>([]), (acc, result) =>
      R.flatMap(acc, (a) => R.map(result, (r) => A.prepend(a, r))),
    ),
  );
}

function resultOf<$R, $E>(r: NonNullable<$R>): Result<$R, $E> {
  return R.Ok(r);
}
