import { httpClient, HttpClientError, HttpTask } from '#lib/safe-http-client';
import { AX, T, Task } from '#lib/ts-belt-extra';
import { A, D, O, pipe } from '@mobily/ts-belt';

const TYPES_URL_HEADER = 'x-typescript-types';

export const registryClient = {
  fetchPackage(packageId: string): HttpTask<string> {
    const packageURL = `https://esm.sh/${packageId}?bundle`;
    return httpClient.get<string>(packageURL);
  },

  fetchTypesSource(packageId: string): Task<string, HttpClientError> {
    return pipe(
      registryClient.fetchPackage(packageId),
      T.map((r) => r.headers),
      T.map(D.getUnsafe(TYPES_URL_HEADER)),
      T.map(O.map(AX.ensureArray)),
      T.map(O.flatMap(A.head)),
      T.flatMap(T.fromOption(`Types not available for ${packageId}`)),
      T.flatMap((typesUrl) => httpClient.get<string>(typesUrl)),
      T.map(D.getUnsafe('data')),
    );
  },
};
