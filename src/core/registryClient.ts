import { AX, pipeTask, T, Task } from '#lib/ts-belt-extra';
import { HttpClient, HttpResponse, HttpTask } from '#types/httpClient.api';
import { A, D, O, pipe, R, Result, S } from '@mobily/ts-belt';
import {
  extractPackageIdFromIndexSource,
  packageIdentifierFromId,
} from 'src/lib/packages';
import { CodeText, Package, PackageSpecifier, TypesResource } from 'src/types';

export const TYPES_URL_HEADER = 'x-typescript-types';
export const REGISTRY_BASE_URL = `https://cdn.esm.sh`;

export function initRegistryClient(httpClient: HttpClient) {
  return {
    fetchPackage(packageSpecifier: PackageSpecifier): Task<Package, string> {
      const packageURL = buildPackageUrl(packageSpecifier);
      const responseTask = httpClient.get<string>(packageURL);

      const getPackageIdentifierResult = (response: HttpResponse<string>) =>
        pipe(
          response,
          getDataResult(`Package index file missing: ${packageSpecifier}`),
          R.map(CodeText.of),
          R.flatMap(extractPackageIdFromIndexSource),
          R.flatMap(packageIdentifierFromId),
        );

      const packageIdentifierTask = pipe(
        responseTask,
        T.map(getPackageIdentifierResult),
        T.flatMap(T.fromResult),
      );

      const typesResourceTask = buildTypesResource(
        responseTask,
        packageSpecifier,
      );

      return T.zipWith(packageIdentifierTask, typesResourceTask, Package.make);
    },
  };

  function buildTypesResource(
    responseTask: HttpTask<string>,
    packageSpecifier: PackageSpecifier,
  ) {
    const typesUrlTask = pipeTask(responseTask, getHeader(TYPES_URL_HEADER));

    const typesRelativeUrlTask = pipeTask(
      typesUrlTask,
      S.replace(REGISTRY_BASE_URL, ''),
    );

    const typesTextTask = pipeTask(
      typesUrlTask,
      (typesUrl) => httpClient.get<string>(typesUrl),
      getData(`Package types file missing: ${packageSpecifier}`),
      CodeText.of,
    );

    return T.zipWith(typesRelativeUrlTask, typesTextTask, TypesResource.make);
  }
}

function buildPackageUrl(packageSpecifier: PackageSpecifier) {
  return `${REGISTRY_BASE_URL}/${packageSpecifier}`;
}

const getData =
  <R, E>(errorValue: NonNullable<E>) =>
  (response: HttpResponse<R>): Task<R, E> =>
    pipe(response, D.get('data'), T.fromOption(errorValue));

const getDataResult =
  <R, E>(errorValue: NonNullable<E>) =>
  (response: HttpResponse<R>): Result<R, E> =>
    pipe(response, D.get('data'), R.fromNullable(errorValue));

// const getOptionalData =
//   <R, E>(errorValue: NonNullable<E>) =>
//     (response: HttpResponse<R>): Task<R, E> =>
//       pipe(response, D.get('data'), T.fromOption(errorValue));

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
