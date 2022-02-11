import { A, D, pipe } from '@mobily/ts-belt';
import { Manifest, PackageDescriptor } from 'src/types';

export function buildManifest(
  descriptors: readonly PackageDescriptor[],
): Manifest {
  const dependencies = pipe(
    descriptors,
    A.map(({ name, version }) => A.toTuple([name, version])),
    D.fromPairs,
  );

  return {
    dependencies: dependencies,
  };
}
