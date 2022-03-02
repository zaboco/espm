import { A, D, pipe } from '@mobily/ts-belt';
import { PackageIdentifier } from 'src/shared/shared.types';
import { Manifest } from 'src/types';

export function buildManifest(
  identifiers: readonly PackageIdentifier[],
): Manifest {
  const dependencies = pipe(
    identifiers,
    A.map(({ name, version }) => A.toTuple([name, version])),
    D.fromPairs,
  );

  return {
    dependencies: dependencies,
  };
}
