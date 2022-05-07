import {
  RegistryPackage,
  RegistryResource,
  TopLevelRegistryResource,
} from '#main/registry/types';
import { CodeText, CodeTexts } from '#main/shared/codeText';
import { extractImports } from '#main/shared/imports';
import { A, D, O, pipe } from '@mobily/ts-belt';
import MagicString from 'magic-string';
import path from 'node:path';

export function replaceImportUrls(pkg: RegistryPackage): RegistryPackage {
  const updateResource = (res: RegistryResource) =>
    D.updateUnsafe(res, 'code', (code) =>
      replaceImportPathsInCode(code, res.url),
    );

  const updateTypedef = (typedef: TopLevelRegistryResource) =>
    pipe(
      typedef,
      D.updateUnsafe('imports', A.map(updateResource)),
      updateResource,
    );

  return D.updateUnsafe(pkg, 'typedef', O.map(updateTypedef));
}

export function replaceImportPathsInCode(
  srcCode: CodeText,
  srcUrl: string,
): CodeText {
  const s = new MagicString(srcCode);

  for (const imp of extractImports(srcCode)) {
    const relativePath = getRelativeUrlPath(srcUrl, imp.path);
    s.overwrite(imp.startIndex, imp.endIndex, relativePath);
  }

  return CodeTexts.make(s.toString());
}

export function getRelativeUrlPath(
  fromUrlPath: string,
  toUrlPath: string,
): string {
  try {
    const fromUrl = saferUrl(fromUrlPath);
    const toUrl = saferUrl(toUrlPath);
    return path.relative(path.dirname(fromUrl.pathname), toUrl.pathname);
  } catch {
    return toUrlPath;
  }
}

function saferUrl(urlString: string): URL {
  try {
    return new URL(urlString);
  } catch (e) {
    throw Error(`invalid URL: ${urlString}`);
  }
}
