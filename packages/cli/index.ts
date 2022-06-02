#!/usr/bin/env node

import { logger, LogLevel, logLevelFromString } from '#logger/index';
import { initManager } from '#main/index';
import { Command } from '#main/types';
import { nodeFsClient, httpieClient } from '#services';
import { GX, T } from '#ts-belt-extra';
import { A, O, pipe, R, Result } from '@mobily/ts-belt';

main(process.argv.slice(2));

function main(programArgs: ReadonlyArray<string>) {
  const manager = initManager({
    fsClient: nodeFsClient,
    httpClient: httpieClient,
  });

  const { commandResult, options } = parseProgramArgs(programArgs);

  logger.setLevel(options.logLevel);

  pipe(
    commandResult,
    T.fromResult,
    T.flatMap(manager.runCommand),
    T.fork(
      (err) => {
        logger.error(err);
        process.exitCode = 1;
      },
      () => {
        logger.info('Done!');
      },
    ),
  );
}

type ProgramOptions = {
  logLevel: LogLevel;
};

function parseProgramArgs(args: ReadonlyArray<string>): {
  commandResult: Result<Command, string>;
  options: ProgramOptions;
} {
  const optionArgs = args.filter((arg) => arg.startsWith('--'));
  const commandArgs = args.filter((arg) => !arg.startsWith('--'));
  return {
    commandResult: parseCommandArgs3(commandArgs),
    options: parseOptionArgs(optionArgs),
  };
}

function parseOptionArgs(optionArgs: ReadonlyArray<string>): ProgramOptions {
  return pipe(
    optionArgs,
    A.find((o) => o.startsWith('--level=')),
    O.map((o) => ({
      logLevel: logLevelFromString(o.replace('--level=', '')),
    })),
    O.getWithDefault({ logLevel: 'INFO' as LogLevel }),
  );
}

function parseCommandArgs3(
  commandArgs: ReadonlyArray<string>,
): Result<Command, string> {
  const action = A.at(commandArgs, 0);
  if (!GX.isOneOf(action, ['add'] as const)) {
    return R.Error(`Command not supported: "${action}"`);
  }

  const packageSpecifiers = A.drop(commandArgs, 1);
  if (packageSpecifiers.length === 0) {
    return R.Error(`No package given! Usage: TODO`);
  }

  return R.Ok({
    action: action,
    packageSpecifiers: packageSpecifiers,
  });
}
