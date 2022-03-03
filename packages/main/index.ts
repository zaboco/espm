import { initFilesManager } from '#main/filesManager';
import { initRegistryClient } from '#main/registryClient';
import { PackageSpecifier } from '#main/shared/packages';
import { Command } from '#main/types';
import { T, Task } from '#ts-belt-extra';
import { FsClient } from '#interfaces/fsClient.api';
import { HttpClient } from '#interfaces/httpClient.api';
import { A, flow, pipe } from '@mobily/ts-belt';

interface Services {
  fsClient: FsClient;
  httpClient: HttpClient;
}

export function initManager(services: Services) {
  const commands = buildCommands(services);
  return {
    runCommand(command: Command): Task<unknown, string> {
      if (command.action === 'add') {
        return commands.add(command.packageSpecifiers);
      }
      return T.of(undefined);
    },
  };
}

function buildCommands(services: Services) {
  const filesManager = initFilesManager(services.fsClient);
  const registryClient = initRegistryClient(services.httpClient);

  return {
    add(
      packageSpecifiers: readonly PackageSpecifier[],
    ): Task<string[], string> {
      return pipe(
        packageSpecifiers,
        A.map(
          flow(registryClient.fetchPackage, T.flatMap(filesManager.storeTypes)),
        ),
        T.all,
      );
    },
  };
}
