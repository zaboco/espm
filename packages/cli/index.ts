#!/usr/bin/env node

import { logger } from '#logger';
import { initManager } from '#main/index';
import { Command } from '#main/types';
import { nodeFsClient, httpieClient } from '#services';
import { GX, T } from '#ts-belt-extra';
import { A, pipe, R, Result } from '@mobily/ts-belt';

logger.setLevel('DEBUG');
main(process.argv.slice(2));

function main(programArgs: ReadonlyArray<string>) {
  const manager = initManager({
    fsClient: nodeFsClient,
    httpClient: httpieClient,
  });
  pipe(
    programArgs,
    parseCommandArgs,
    T.fromResult,
    T.flatMap(manager.runCommand),
    T.fork(
      (err) => {
        logger.error(err);
        process.exit(1);
      },
      () => {
        logger.info('Done!');
      },
    ),
  );
}

function parseCommandArgs(
  args: ReadonlyArray<string>,
): Result<Command, string> {
  const action = A.at(args, 0);
  if (!GX.isOneOf(action, ['add'] as const)) {
    return R.Error(`Command not supported: "${action}"`);
  }

  const packageSpecifiers = A.drop(args, 1);
  if (packageSpecifiers.length === 0) {
    return R.Error(`No package given! Usage: TODO`);
  }

  return R.Ok({
    action: action,
    packageSpecifiers: packageSpecifiers,
  });
}
