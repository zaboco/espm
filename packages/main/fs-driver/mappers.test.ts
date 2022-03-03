import { Package } from '#main/core/types';
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
  const pkg = generatePkg();
  const expectedTypesRealPath = buildDepPath(pkg.typedef.path);

  pipe(pkg, packageToFsActions, (actions) =>
    expectToEqual(actions, [
      {
        type: 'sequence',
        actions: [
          {
            type: 'writeFile',
            path: expectedTypesRealPath,
            contents: pkg.typedef.code,
          },
          {
            type: 'symlink',
            from: buildTypedefPath(pkg.identifier),
            to: expectedTypesRealPath,
          },
        ],
      },
    ]),
  );
});

function generatePkg(): Package {
  return {
    identifier: { name: 'react', version: '17.0.2' },
    typedef: {
      code: CodeTexts.make(''),
      path: '@types/react/index.d.ts',
    },
  };
}

test.run();
