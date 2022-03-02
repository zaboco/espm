import { T } from '#lib/ts-belt-extra';
import { HttpClient, HttpTask } from '#types/httpClient.api';
import { D, O, pipe } from '@mobily/ts-belt';

interface HttpClientStub extends HttpClient {
  overrideHttpTasks(customHttpTasks: HttpTaskRecord): void;
}

type UrlPath = string & {};
type HttpTaskRecord = Record<UrlPath, HttpTask<unknown>>;

export function initHttpClientStub(
  initialHttpTasks?: HttpTaskRecord,
): HttpClientStub {
  let httpTasks: HttpTaskRecord = initialHttpTasks ?? {};
  return {
    get<R>(url: UrlPath): HttpTask<R> {
      return pipe(
        httpTasks,
        D.get(url),
        O.getWithDefault(T.rejected(`URL not covered: [${url}]`)),
        T.map((r) => ({ ...r, url })),
        (t) => t as HttpTask<R>,
      );
    },
    overrideHttpTasks(customHttpTasks) {
      httpTasks = customHttpTasks;
    },
  };
}
