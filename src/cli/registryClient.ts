import { T, Task, AX } from '#lib/ts-belt-extra';
import { A, D, G, O, pipe } from '@mobily/ts-belt';
import * as httpie from 'httpie';
import { HttpieResponse } from 'httpie';

export type HttpClientError = string & {};

const httpClient = {
  get<R>(url: string): Task<HttpieResponse<R>, HttpClientError> {
    return T.fromPromise(
      () => httpie.get<R>(url),
      (err) => {
        return G.isError(err) ? err.message : String(err);
      },
    );
  },
};

export const registryClient = {
  fetchPackage(
    packageId: string,
  ): Task<HttpieResponse<string>, HttpClientError> {
    const packageURL = `https://esm.sh/${packageId}?bundle`;
    return httpClient.get<string>(packageURL);
  },

  fetchTypesSource(packageId: string): Task<string, HttpClientError> {
    return pipe(
      registryClient.fetchPackage(packageId),
      T.map((r) => r.headers),
      T.map(D.getUnsafe('x-typescript-types')),
      T.map(O.map(AX.ensureArray)),
      T.map(O.flatMap(A.head)),
      T.flatMap(T.fromOption(`Types not available for ${packageId}`)),
      T.flatMap((typesUrl) => httpClient.get<string>(typesUrl)),
      T.map(D.getUnsafe('data')),
    );
  },
};
