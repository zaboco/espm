import { HttpClient, HttpResponse } from '#interfaces/httpClient.api';
import { buildPackageIndexUrl } from '#main/registry/url';
import { CodeTexts } from '#main/shared/codeText';
import { PackageSpecifier } from '#main/shared/packages';
import { AX, T, Task } from '#ts-belt-extra';
import { A, D, O, pipe } from '@mobily/ts-belt';
import {
  RegistryPackage,
  RegistryPackages,
  RegistryResource,
  Resources,
} from './types';

export const TYPES_URL_HEADER = 'x-typescript-types';

export function initRegistryClient(httpClient: HttpClient) {
  return {
    fetchPackage(
      packageSpecifier: PackageSpecifier,
    ): Task<RegistryPackage, string> {
      const packageIndexURL = buildPackageIndexUrl(packageSpecifier);

      const indexResponseTask = httpClient.get<string>(packageIndexURL);

      return pipe(
        indexResponseTask,
        T.flatMap((response) =>
          pipe(
            response,
            getData,
            T.map(CodeTexts.make),
            T.flatMap((source) =>
              pipe(
                response,
                buildTypedefResource,
                T.map((resource) =>
                  RegistryPackages.make(packageIndexURL, source, resource),
                ),
              ),
            ),
          ),
        ),
      );
    },
  };

  function buildTypedefResource(
    indexResponse: HttpResponse<string>,
  ): Task<RegistryResource, string> {
    return pipe(
      indexResponse,
      getHeader(TYPES_URL_HEADER),
      T.flatMap((typedefUrl) => {
        return pipe(
          typedefUrl,
          (typedefUrl) => httpClient.get<string>(typedefUrl),
          T.flatMap(getData),
          T.map(CodeTexts.make),
          T.map((code) => Resources.make(typedefUrl, code)),
        );
      }),
    );
  }
}

const getData = <R>(response: HttpResponse<R>): Task<R, string> =>
  pipe(
    response,
    D.getUnsafe('data'),
    O.fromFalsy,
    T.fromOption(`No data found for url: ${response.url}`),
  );

const getHeader =
  (header: string) =>
  (response: HttpResponse<unknown>): Task<string, string> =>
    pipe(
      response,
      D.getUnsafe('headers'),
      D.get(header),
      O.map(AX.ensureArray),
      O.flatMap(A.head),
      T.fromOption(`Header ${header} not found`),
    );
