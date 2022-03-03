import { HttpClient, HttpResponse, HttpTask } from '#interfaces/httpClient.api';
import { buildPackageIndexUrl } from '#main/registry/url';
import { PackageSpecifier } from '#main/shared/packages';
import { CodeTexts } from '#main/shared/codeText';
import { AX, pipeTask, T, Task } from '#ts-belt-extra';
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

      const indexSourceTask = pipeTask(
        indexResponseTask,
        getData,
        CodeTexts.make,
      );

      const typesResourceTask = buildTypedefResource(indexResponseTask);

      return T.zipWith(
        indexSourceTask,
        typesResourceTask,
        (indexSource, typedef) =>
          RegistryPackages.make(packageIndexURL, indexSource, typedef),
      );
    },
  };

  function buildTypedefResource(
    indexResponseTask: HttpTask<string>,
  ): Task<RegistryResource, string> {
    const typedefUrlTask = pipeTask(
      indexResponseTask,
      getHeader(TYPES_URL_HEADER),
    );

    const typedefCodeTask = pipeTask(
      typedefUrlTask,
      (typesUrl) => httpClient.get<string>(typesUrl),
      getData,
      CodeTexts.make,
    );

    return T.zipWith(typedefUrlTask, typedefCodeTask, Resources.make);
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
