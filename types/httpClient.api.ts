import { Task } from '#lib/ts-belt-extra';
import { IncomingMessage } from 'http';

export interface HttpResponse<T> extends IncomingMessage {
  data: T;
}

export interface HttpClient {
  get<R>(url: string): HttpTask<R>;
}
export type HttpTask<R> = Task<HttpResponse<R>, HttpClientError>;

export type HttpClientError = string & {};
