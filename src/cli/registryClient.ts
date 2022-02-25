import { AX, T, Task } from '#lib/ts-belt-extra';
import { HttpClient, HttpResponse, HttpTask } from '#types/httpClient.api';
import { A, D, flow, O, pipe, S } from '@mobily/ts-belt';
import { extractPackageIdFromIndexSource } from 'src/lib/packages';
import { CodeText, GivenPackageId, Package, TypesResource } from 'src/types';

export const TYPES_URL_HEADER = 'x-typescript-types';
export const REGISTRY_BASE_URL = `https://cdn.esm.sh`;

export function initRegistryClient(httpClient: HttpClient) {
  return {
    fetchPackage(givenPackageId: GivenPackageId): Task<Package, string> {
      const packageURL = buildPackageUrl(givenPackageId);
      const responseTask = httpClient.get<string>(packageURL);
      const packageIdTask = pipe(
        responseTask,
        T.flatMap(getData(`Package index file missing: ${givenPackageId}`)),
        T.map(CodeText.of),
        T.flatMap(flow(extractPackageIdFromIndexSource, T.fromResult)),
      );

      const typesResourceTask = buildTypesResource(
        responseTask,
        givenPackageId,
      );

      return T.zipWith(packageIdTask, typesResourceTask, Package.make);
    },
  };

  function buildTypesResource(
    responseTask: HttpTask<string>,
    givenPackageId: GivenPackageId,
  ) {
    const typesUrlTask = pipe(
      responseTask,
      T.flatMap(getHeader(TYPES_URL_HEADER)),
    );

    const typesRelativeUrlTask = pipe(
      typesUrlTask,
      T.map(S.replace(REGISTRY_BASE_URL, '')),
    );

    const typesTextTask = pipe(
      typesUrlTask,
      T.flatMap((typesUrl) => httpClient.get<string>(typesUrl)),
      T.flatMap(getData(`Package types file missing: ${givenPackageId}`)),
      T.map(CodeText.of),
    );

    return T.zipWith(typesRelativeUrlTask, typesTextTask, TypesResource.make);
  }
}

function buildPackageUrl(givenPackageId: GivenPackageId) {
  return `${REGISTRY_BASE_URL}/${givenPackageId}`;
}

const getData =
  <R, E>(errorValue: NonNullable<E>) =>
  (response: HttpResponse<R>): Task<R, E> =>
    pipe(response, D.get('data'), T.fromOption(errorValue));

const getHeader =
  (header: string) =>
  (response: HttpResponse<unknown>): Task<string, string> =>
    pipe(
      response,
      D.getUnsafe('headers'),
      D.getUnsafe(header),
      O.map(AX.ensureArray),
      O.flatMap(A.head),
      T.fromOption(`Header ${header} not found`),
    );
