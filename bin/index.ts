#!/usr/bin/env node

import { A, pipe, R, Result, D, O, G, F } from '@mobily/ts-belt';
import * as httpie from 'httpie';
import * as fs from 'node:fs/promises';

interface CommandArgs {
  action: 'add';
  packageIdentifier: string;
}

main();

async function main() {
  const args: ReadonlyArray<string> = process.argv;
  pipe(
    args,
    A.drop(2),
    parseCommandArgs,
    R.map(async (command) => {
      pipe(
        await runCommand(command),
        R.tapError((err) => {
          console.error('Command error:', err);
        }),
      );
    }),
    R.tapError((err) => {
      console.error('Error:', err);
    }),
  );
}

function runCommand(command: CommandArgs): Promise<Result<void, string>> {
  switch (command.action) {
    case 'add':
      return addTypes(command.packageIdentifier);
  }
}

function parseCommandArgs(
  args: ReadonlyArray<string>,
): Result<CommandArgs, string> {
  if (A.at(args, 0) !== 'add') {
    return R.Error(`Command not supported: "${A.at(args, 0)}"`);
  }

  const packageIdentifier = A.at(args, 1);
  if (!packageIdentifier) {
    return R.Error(`Package not given! Usage: TODO`);
  }

  return R.Ok({
    action: 'add',
    packageIdentifier: packageIdentifier,
  });
}

async function addTypes(
  packageIdentifier: string,
): Promise<Result<void, string>> {
  const response = await httpie.get(
    `https://esm.sh/${packageIdentifier}?bundle`,
  );

  const typesResponse = await pipe(
    response.headers,
    D.get('x-typescript-types'),
    O.fromFalsy,
    O.flatMap((urlOrUrls) =>
      G.isArray(urlOrUrls) ? A.head(urlOrUrls) : urlOrUrls,
    ),
    O.toResult(`Types not available for ${packageIdentifier}`),
    R.map((typesUrl) => httpie.get<string>(typesUrl)),
    unwrapPromise,
  );

  return pipe(
    typesResponse,
    R.map((types) => {
      console.log('Got types', types.data);
      // fs.writeFile()
    }),
  );
}

function unwrapPromise<A, B>(
  r: Result<Promise<NonNullable<A>>, NonNullable<B>>,
): Promise<Result<A, B>> {
  return R.match(
    r,
    (promise) => promise.then((v) => R.Ok(v)),
    (err) => Promise.resolve(R.Error(err)),
  );
}
