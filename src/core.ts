import { T, Task } from '#lib/ts-belt-extra';
import { Fs } from '#types/fs.api';
import { HttpClient } from '#types/httpClient.api';
import { A, flow, pipe } from '@mobily/ts-belt';
import { PackageFullName, PackageSpecifier } from 'src/shared/shared.types';
import { initFilesManager } from './core/filesManager';
import { initRegistryClient } from './core/registryClient';
import { buildManifest } from './lib/manifest';
import { packageIdentifierFromId } from './lib/packages';
import { Command } from './types';

interface Services {
  fs: Fs;
  httpClient: HttpClient;
}

export function initManager(services: Services) {
  const commands = buildCommands(services);
  return {
    runCommand(command: Command): Task<unknown, string> {
      if (command.action === 'add') {
        return commands.add(command.packageSpecifiers);
      }
      if (command.action === 'remove') {
        return commands.remove(command.packageSpecifiers);
      }
      return T.of(undefined);
    },
  };
}

function buildCommands(services: Services) {
  const filesManager = initFilesManager(services.fs);
  const registryClient = initRegistryClient(services.httpClient);

  // @ts-expect-error NOT used for now
  function writeManifest(
    packageIds: readonly PackageFullName[],
  ): Task<string, string> {
    return pipe(
      packageIds,
      A.map(packageIdentifierFromId),
      T.all,
      T.map(buildManifest),
      T.flatMap(filesManager.writeManifest),
    );
  }

  return {
    add(packageSpecifiers: readonly PackageSpecifier[]): Task<string, string> {
      // const writeManifestTask = pipe(
      //   fetchPackagesTask,
      //   T.map(A.map(D.getUnsafe('id'))),
      //   T.flatMap(writeManifest),
      // );

      return pipe(
        packageSpecifiers,
        A.map(
          flow(registryClient.fetchPackage, T.flatMap(filesManager.storeTypes)),
        ),
        T.all,
        T.map(() => 'ok'),
        // T.flatMap(() => writeManifestTask),
      );
    },
    remove(packageSpecifiers: readonly PackageSpecifier[]) {
      return pipe(packageSpecifiers, A.map(filesManager.removeTypes), T.all);
    },
  };
}
