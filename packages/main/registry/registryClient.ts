import { HttpClient, HttpResponse } from '#interfaces/httpClient.api';
import { logger } from '#logger/index';
import { buildPackageIndexUrl } from '#main/registry/url';
import { CodeText, CodeTexts } from '#main/shared/codeText';
import { PackageSpecifier } from '#main/shared/packages';
import { AX, pipeTask, T, Task } from '#ts-belt-extra';
import { A, D, O, Option, pipe } from '@mobily/ts-belt';
import * as esModuleLexer from 'es-module-lexer';
import {
  RegistryPackage,
  RegistryPackages,
  RegistryResource,
  TopLevelResource,
} from './types';

export const TYPES_URL_HEADER = 'x-typescript-types';

export function initRegistryClient(httpClient: HttpClient) {
  return {
    fetchPackage(
      packageSpecifier: PackageSpecifier,
    ): Task<RegistryPackage, string> {
      return pipe(
        T.of<string, string>(buildPackageIndexUrl(packageSpecifier)),
        T.bindTo('originalUrl'),
        T.bind('indexResponse', ({ originalUrl }) =>
          httpClient.get<string>(originalUrl),
        ),
        T.bind('indexSource', ({ indexResponse }) =>
          getCodeData(indexResponse),
        ),
        T.bind('typedef', ({ indexResponse }) =>
          pipe(
            buildTypedefResource(indexResponse),
            T.tapError(() => {
              logger.warn(
                `[${packageSpecifier}] Types not found! Generating stub index.d.ts`,
              );
            }),
            T.recover<Option<TopLevelResource>, string>(O.None),
          ),
        ),
        T.map(RegistryPackages.make),
      );
    },
    traverseImports,
  };

  function buildTypedefResource(
    indexResponse: HttpResponse<string>,
  ): Task<TopLevelResource, string> {
    return pipe(
      indexResponse,
      getHeader(TYPES_URL_HEADER),
      T.bindTo('url'),
      T.bind('code', ({ url }) =>
        pipeTask(httpClient.get<string>(url), getCodeData),
      ),
      T.bind('imports', ({ code, url }) =>
        // need to drop the first import, since it's the top-level import itself
        pipeTask(traverseResourceImports({ code, url }, []), A.drop(1)),
      ),
    );
  }

  function traverseImports(
    url: string,
    alreadyVisitedUrls: readonly string[],
  ): Task<readonly RegistryResource[], string> {
    if (alreadyVisitedUrls.includes(url)) {
      return T.of<readonly RegistryResource[], string>([]);
    }

    return pipe(
      fetchResource(url),
      T.flatMap((r) => traverseResourceImports(r, alreadyVisitedUrls)),
    );
  }

  function traverseResourceImports(
    resource: RegistryResource,
    alreadyVisitedUrls: readonly string[],
  ): Task<readonly RegistryResource[], string> {
    return pipe(
      resource.code,
      extractImports,
      A.reduce(
        T.of<
          {
            newResources: readonly RegistryResource[];
            accAlreadyVisitedUrls: readonly string[];
          },
          string
        >({
          newResources: [resource],
          accAlreadyVisitedUrls: alreadyVisitedUrls.concat(resource.url),
        }),
        (accTask, importUrl) => {
          const importedResourcesTask = pipe(
            accTask,
            T.flatMap(({ accAlreadyVisitedUrls }) =>
              traverseImports(importUrl, accAlreadyVisitedUrls),
            ),
          );

          return T.zipWith(
            importedResourcesTask,
            accTask,
            (importedResources, { newResources, accAlreadyVisitedUrls }) => {
              return {
                newResources: newResources.concat(importedResources),
                accAlreadyVisitedUrls: accAlreadyVisitedUrls.concat(
                  importedResources.map((r) => r.url),
                ),
              };
            },
          );
        },
      ),
      T.map((acc) => acc.newResources),
    );
  }

  function fetchResource(url: string): Task<RegistryResource, string> {
    return pipeTask(httpClient.get<string>(url), getCodeData, (code) => ({
      code,
      url: url,
    }));
  }
}

function extractImports(code: CodeText): readonly string[] {
  return pipe(
    code,
    esModuleLexer.parse,
    ([imports]) => imports,
    A.map(D.getUnsafe('n')),
    AX.rejectNullables,
  );
}

const getCodeData = (response: HttpResponse<string>): Task<CodeText, string> =>
  pipe(
    response,
    D.getUnsafe('data'),
    O.fromFalsy,
    O.map(CodeTexts.make),
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
