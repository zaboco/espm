import { httpClient } from '#lib/safe-http-client';
import { AX, T, Task } from '#lib/ts-belt-extra';
import { A, D, flow, O, pipe } from '@mobily/ts-belt';
import { HttpieResponse } from 'httpie';
import { extractPackageIdFromIndexSource } from 'src/lib/packages';
import { GivenPackageId, Package, Text } from 'src/types';

const TYPES_URL_HEADER = 'x-typescript-types';

function buildPackageUrl(givenPackageId: GivenPackageId) {
  return `https://esm.sh/${givenPackageId}?bundle`;
}

export const registryClient = {
  fetchPackage(givenPackageId: GivenPackageId): Task<Package, string> {
    const packageURL = buildPackageUrl(givenPackageId);
    const responseTask = httpClient.get<Text>(packageURL);
    const packageIdTask = pipe(
      responseTask,
      T.flatMap(getData(`Package index file missing: ${givenPackageId}`)),
      T.flatMap(flow(extractPackageIdFromIndexSource, T.fromResult)),
    );

    const typesTextTask = pipe(
      responseTask,
      T.flatMap(getHeader(TYPES_URL_HEADER)),
      T.flatMap((typesUrl) => httpClient.get<Text>(typesUrl)),
      T.flatMap(getData(`Package types file missing: ${givenPackageId}`)),
    );

    return T.zipWith(packageIdTask, typesTextTask, (packageId, typesText) => ({
      id: packageId,
      typesText,
    }));
  },
};

const getData =
  <R, E>(errorValue: NonNullable<E>) =>
  (response: HttpieResponse<R>): Task<R, E> =>
    pipe(response, D.get('data'), T.fromOption(errorValue));

const getHeader =
  (header: string) =>
  (response: HttpieResponse): Task<string, string> =>
    pipe(
      response,
      D.getUnsafe('headers'),
      D.getUnsafe(header),
      O.map(AX.ensureArray),
      O.flatMap(A.head),
      T.fromOption(`Header ${header} not found`),
    );
