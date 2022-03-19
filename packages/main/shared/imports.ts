import { CodeText } from '#main/shared/codeText';
import { AX } from '#ts-belt-extra';
import { A, D, G, O, Option, pipe } from '@mobily/ts-belt';
import { ImportSpecifier as LexerImportSpecifier } from 'es-module-lexer';
import * as esModuleLexer from 'es-module-lexer';

export interface ImportSpecifier {
  path: string;
  startIndex: number;
  endIndex: number;
}

export function extractImportPaths(code: CodeText): readonly string[] {
  return pipe(extractImports(code), A.map(D.getUnsafe('path')));
}

export function extractImports(code: CodeText): ReadonlyArray<ImportSpecifier> {
  return pipe(
    code,
    esModuleLexer.parse,
    ([imports]) => imports,
    A.map(importSpecifierFromLexer),
    AX.filterGuarded(G.isNotNullable),
  );
}

function importSpecifierFromLexer(
  lexerImport: LexerImportSpecifier,
): Option<ImportSpecifier> {
  return lexerImport.n === undefined
    ? O.None
    : O.Some({
        path: lexerImport.n,
        startIndex: lexerImport.s,
        endIndex: lexerImport.e,
      });
}
