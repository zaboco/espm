import { HttpClient, HttpTask } from '#interfaces/httpClient.api';
import { wrapTask } from '#logger/wrapTask';
import { SX, T } from '#ts-belt-extra';
import { G, pipe } from '@mobily/ts-belt';
import * as httpie from 'httpie';

export const httpieClient: HttpClient = {
  get<R>(url: string): HttpTask<R> {
    return pipe(
      T.fromPromise(
        () => httpie.get<R>(url),
        (err) => {
          return pipe(
            G.isError(err) ? err.message : String(err),
            SX.prepend(`[${url}] `),
          );
        },
      ),
      wrapTask(`GET ${url}`),
    );
  },
};
