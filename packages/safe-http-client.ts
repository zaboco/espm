import { G, pipe } from '@mobily/ts-belt';
import * as httpie from 'httpie';
import { HttpieResponse } from 'httpie';
import { SX, T, Task } from './ts-belt-extra';

export type HttpClientError = string & {};

export type HttpTask<R> = Task<HttpieResponse<R>, HttpClientError>;

export const httpClient = {
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
