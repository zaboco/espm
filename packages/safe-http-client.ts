import { G } from '@mobily/ts-belt';
import * as httpie from 'httpie';
import { HttpieResponse } from 'httpie';
import { T, Task } from './ts-belt-extra';

export type HttpClientError = string & {};

export type HttpTask<R> = Task<HttpieResponse<R>, HttpClientError>;

export const httpClient = {
  get<R>(url: string): HttpTask<R> {
    return T.fromPromise(
      () => httpie.get<R>(url),
      (err) => {
        return G.isError(err) ? err.message : String(err);
      },
    );
  },
};
