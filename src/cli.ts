#!/usr/bin/env node

import { safeFs } from '#lib/safe-fs';
import { httpieClient } from '#lib/safe-http-client';
import { GX, T, Task } from '#lib/ts-belt-extra';
import { Fs } from '#types/fs.api';
import { HttpClient } from '#types/httpClient.api';
import { A, D, flow, pipe, R, Result } from '@mobily/ts-belt';
import { buildManifest } from 'src/lib/manifest';
import { packageDescriptorFromId } from 'src/lib/packages';
import { initFilesManager } from './cli/filesManager';
import { initRegistryClient } from './cli/registryClient';
import { Command, GivenPackageId, PackageId } from './types';

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

interface Services {
  fs: Fs;
  httpClient: HttpClient;
}

function buildCommands(services: Services) {
  const filesManager = initFilesManager(services.fs);
  const registryClient = initRegistryClient(services.httpClient);

  function writeManifest(
    packageIds: readonly PackageId[],
  ): Task<string, string> {
    return pipe(
      packageIds,
      A.map(packageDescriptorFromId),
      combineResults,
      R.map(buildManifest),
      T.fromResult,
      T.flatMap(filesManager.writeManifest),
    );
  }

  return {
    add(packageIds: readonly GivenPackageId[]): Task<string, string> {
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
    },
    remove(packageIds: readonly GivenPackageId[]) {
      return pipe(packageIds, A.map(filesManager.removeTypes), T.all);
    },
  };
}

function initManager(services: Services) {
  const commands = buildCommands(services);
  return {
    runCommand(command: Command): Task<unknown, string> {
      if (command.action === 'add') {
        return commands.add(command.packageIds);
      }
      if (command.action === 'remove') {
        return commands.remove(command.packageIds);
      }
      return T.of(undefined);
    },
  };
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
