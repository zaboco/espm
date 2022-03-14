import { HttpClient, HttpResponse } from '#interfaces/httpClient.api';
import { logger } from '#logger/index';
import { buildPackageIndexUrl } from '#main/registry/url';
import { CodeText, CodeTexts } from '#main/shared/codeText';
import { PackageSpecifier } from '#main/shared/packages';
import { AX, pipeTask, T, Task } from '#ts-belt-extra';
import { A, D, O, Option, pipe } from '@mobily/ts-belt';
import { ImportSpecifier } from 'es-module-lexer';
import { RegistryPackage, RegistryPackages, RegistryResource } from './types';
import * as esModuleLexer from 'es-module-lexer';

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
            T.recover<Option<RegistryResource>, string>(O.None),
          ),
        ),
        T.map(RegistryPackages.make),
      );
    },
  };

  function buildTypedefResource(
    indexResponse: HttpResponse<string>,
  ): Task<RegistryResource, string> {
    return pipe(
      indexResponse,
      getHeader(TYPES_URL_HEADER),
      T.bindTo('url'),
      T.bind('code', ({ url }) =>
        pipeTask(httpClient.get<string>(url), getCodeData),
      ),
      T.bind('imports', ({ code }) => extractImports(code)),
    );
  }

  function extractImports(
    code: CodeText,
  ): Task<readonly RegistryResource[], string> {
    return pipe(
      code,
      esModuleLexer.parse,
      ([imports]) => imports,
      A.map(buildImportResource),
      T.all,
    );
  }

  function buildImportResource(
    importSpecifier: ImportSpecifier,
  ): Task<RegistryResource, string> {
    return pipe(
      importSpecifier.n,
      T.fromOption(`Invalid import: ${importSpecifier}`),
      T.bindTo('url'),
      T.bind('code', ({ url }) =>
        pipeTask(httpClient.get<string>(url), getCodeData),
      ),
      T.bind('imports', () => T.of([])),
    );
  }
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
