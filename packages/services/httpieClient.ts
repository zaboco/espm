import { HttpClient, HttpTask } from '#interfaces/httpClient.api';
import { logger } from '#logger';
import { SX, T } from '#ts-belt-extra';
import { G, pipe } from '@mobily/ts-belt';
import * as httpie from 'httpie';
export const httpieClient: HttpClient = {
  get<R>(url: string): HttpTask<R> {
    return T.fromPromise(
      () => {
        const spinner = logger.spinner(`GET ${url}`);

        return httpie.get<R>(url).then(
          (r) => {
            spinner.succeed();
            return r;
          },
          (e) => {
            spinner.fail();
            return Promise.reject(e);
          },
        );
      },
      (err) => {
        return pipe(
          G.isError(err) ? err.message : String(err),
          SX.prepend(`[${url}] `),
        );
      },
    );
  },
};
