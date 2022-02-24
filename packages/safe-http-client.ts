import { HttpClient, HttpTask } from '#types/httpClient.api';
import { G, pipe } from '@mobily/ts-belt';
import * as httpie from 'httpie';
import { SX, T } from './ts-belt-extra';

export const httpieClient: HttpClient = {
  get<R>(url: string): HttpTask<R> {
    return T.fromPromise(
      () => httpie.get<R>(url),
      (err) => {
        return pipe(
          G.isError(err) ? err.message : String(err),
          SX.prepend(`[${url}] `),
        );
      },
    );
  },
};
