import { Task } from '#ts-belt-extra';
import { IncomingHttpHeaders } from 'http';

export interface HttpResponse<T> {
  headers: IncomingHttpHeaders;
  url?: string;
  data: T;
}

export interface HttpClient {
  get<R>(url: string): HttpTask<R>;
}
export type HttpTask<R> = Task<HttpResponse<R>, HttpClientError>;

export type HttpClientError = string & {};
