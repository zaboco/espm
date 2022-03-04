import { HttpClient, HttpTask } from '#interfaces/httpClient.api';
import { SX, T } from '#ts-belt-extra';
import { G, pipe } from '@mobily/ts-belt';
import * as httpie from 'httpie';
import { performance } from 'node:perf_hooks';
// @ts-ignore
import Spinnies from 'spinnies';

const spinnies = new Spinnies();

export const httpieClient: HttpClient = {
  get<R>(url: string): HttpTask<R> {
    return T.fromPromise(
      () => {
        const spinnerId = `${url}-${performance.now()}`;
        spinnies.add(spinnerId, { text: `GET ${url}` });
        return httpie.get<R>(url).then(
          (r) => {
            spinnies.succeed(spinnerId);
            return r;
          },
          (e) => {
            spinnies.fail(spinnerId);
            return e;
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
