import {
  getRelativeUrlPath,
  replaceImportUrls,
  replaceImportPathsInCode,
} from '#main/registry/replaceImportUrls';
import {
  RegistryResource,
  TopLevelRegistryResource,
} from '#main/registry/types';
import { buildRegistryUrl } from '#main/registry/url';
import { CodeTexts } from '#main/shared/codeText';
import { expectToEqual } from '#test-helpers/assertions';
import * as esModuleLexer from 'es-module-lexer';
import { suite } from 'uvu';

const test = suite('replaceImportPaths');

test.before(() => esModuleLexer.init);

test('it replaces code import paths with relative paths', () => {
  const baseRelativePath = `prop-types@15.7.4/index`;
  const relativePathWithDtsExtension = `${baseRelativePath}.d.ts`;
  const importedTypedef: RegistryResource = {
    code: CodeTexts.make('whatever'),
    url: buildRegistryUrl(relativePathWithDtsExtension),
  };
  const typedef: TopLevelRegistryResource = {
    code: CodeTexts.make(`
import '${importedTypedef.url}';
`),
    url: buildRegistryUrl('react@17.0.33/index.d.ts'),
    imports: [importedTypedef],
  };

  const pkg = {
    originalUrl: buildRegistryUrl('whatever'),
    indexSource: CodeTexts.make('whatever'),
    typedef: typedef,
  };

  const expectedTypedefCode = CodeTexts.make(`
import '../${baseRelativePath}';
`);

  expectToEqual(replaceImportUrls(pkg), {
    ...pkg,
    typedef: {
      ...pkg.typedef,
      code: expectedTypedefCode,
    },
  });
});

test('replaceImportPathsInCode replaces absolute import paths with relative ones', () => {
  const import1Path = 'css/index';
  const import2Path = 'foo/index';
  const indexUrl = buildRegistryUrl('react/index.ts');
  const import1Url = buildRegistryUrl(import1Path);
  const import2Url = buildRegistryUrl(import2Path);

  const indexSource = CodeTexts.make(`
import '${import1Url}';
import { default } from '${import2Url}';
`);

  expectToEqual(
    replaceImportPathsInCode(indexSource, indexUrl),
    CodeTexts.make(`
import '../${import1Path}';
import { default } from '../${import2Path}';
`),
  );
});

test('getRelativeUrlPath returns a relative path from one url to another', () => {
  const importPath = 'css/index.d.ts';
  const indexUrl = buildRegistryUrl('react/index.ts');
  const importUrl = buildRegistryUrl(importPath);

  expectToEqual(getRelativeUrlPath(indexUrl, importUrl), `../${importPath}`);
});

test.run();
