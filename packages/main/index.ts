import { FsClient } from '#interfaces/fsClient.api';
import { HttpClient } from '#interfaces/httpClient.api';
import { initFsDriver } from '#main/fs-driver/fsDriver';
import { packageToFsActions } from '#main/fs-driver/mappers';
import { toPackage } from '#main/registry/mappers';
import { initRegistryClient } from '#main/registry/registryClient';
import { PackageSpecifier } from '#main/shared/packages';
import { Command } from '#main/types';
import { pipeTask, T, Task } from '#ts-belt-extra';
import { A, pipe } from '@mobily/ts-belt';
import * as esModuleLexer from 'es-module-lexer';

interface Services {
  fsClient: FsClient;
  httpClient: HttpClient;
}

export function initManager(services: Services) {
  const commands = buildCommands(services);
  return {
    runCommand(command: Command): Task<unknown, string> {
      if (command.action === 'add') {
        return pipeTask(
          T.fromPromise(() => esModuleLexer.init, String),
          () => commands.add(command.packageSpecifiers),
        );
      }
      return T.of(undefined);
    },
  };
}

function buildCommands(services: Services) {
  const fsDriver = initFsDriver(services.fsClient);
  const registryClient = initRegistryClient(services.httpClient);

  const addOne = (pkgSpecifier: PackageSpecifier): Task<unknown, string> =>
    pipeTask(
      T.of(pkgSpecifier),
      registryClient.fetchPackage,
      toPackage,
      packageToFsActions,
      fsDriver.performInParallel,
    );

  return {
    add(packageSpecifiers: readonly PackageSpecifier[]): Task<unknown, string> {
      return pipe(packageSpecifiers, A.map(addOne), T.all);
    },
  };
}
