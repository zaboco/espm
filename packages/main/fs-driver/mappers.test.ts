import { Package, Resource, TopLevelResource } from '#main/core/types';
import {
  buildDepPath,
  buildTypedefPath,
  packageToFsActions,
} from '#main/fs-driver/mappers';
import { CodeTexts } from '#main/shared/codeText';
import { expectToEqual } from '#test-helpers/assertions';
import { pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';

const test = suite('fs-driver/mappers');

test('it adds typedef files to deps, with alias', () => {
  const { pkg, importedTypedef, typedef } = generatePkg();
  pipe(pkg, packageToFsActions, (actions) =>
    expectToEqual(actions, [
      {
        type: 'sequence',
        actions: [
          {
            type: 'writeFile',
            path: buildDepPath(typedef.path),
            contents: typedef.code,
          },
          {
            type: 'writeFile',
            path: buildDepPath(importedTypedef.path),
            contents: importedTypedef.code,
          },
          {
            type: 'writeFile',
            path: buildTypedefPath(pkg.identifier),
            contents: typedef.indexCode,
          },
        ],
      },
    ]),
  );
});

function generatePkg() {
  const importedTypedef: Resource = {
    code: CodeTexts.make(''),
    path: 'v69/csstype@3.0.11/index.d.ts',
  };
  const baseTypedefPath = `v69/@types/react@17.0.33/index`;
  const typedef: TopLevelResource = {
    code: CodeTexts.make(''),
    path: `${baseTypedefPath}.d.ts`,
    imports: [importedTypedef],
    indexCode: CodeTexts.make(`export * from '../../${baseTypedefPath}'`),
  };
  const pkg: Package = {
    identifier: { name: 'react', version: '17.0.2' },
    typedef: typedef,
  };
  return { pkg, typedef, importedTypedef };
}

test.run();
