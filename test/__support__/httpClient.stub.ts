import { HttpClient, HttpTask } from '#types/httpClient.api';

export function initHttpClientStub(httpTask: HttpTask<string>): HttpClient {
  return {
    get<R>(_url: string): HttpTask<R> {
      return httpTask as unknown as HttpTask<R>;
    },
  };
}
