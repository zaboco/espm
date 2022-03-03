import { packageIdentifierFromSpecifier } from '#main/shared/packages';
import { expectToEqual } from '#test-helpers/assertions';
import {
  assertResultError,
  assertResultSuccess,
} from '#test-helpers/resultAssertions';
import { pipe } from '@mobily/ts-belt';
import { suite } from 'uvu';

const it = suite('shared/packages - packageIdentifierFromSpecifier');

const pkgName = 'react';
const scopedPkg = `@types/react`;
const version = '17';
const invalidSpecifier = '@@react';

it('converts the specifier, if it is fully defined', () =>
  pipe(
    `${pkgName}@${version}`,
    packageIdentifierFromSpecifier,
    assertResultSuccess((id) => {
      expectToEqual(id, { name: pkgName, version: version });
    }),
  ));

it('defaults the version to "latest", if not specified', () =>
  pipe(
    pkgName,
    packageIdentifierFromSpecifier,
    assertResultSuccess((id) => {
      expectToEqual(id, { name: pkgName, version: 'latest' });
    }),
  ));

it('matches scoped packages', () =>
  pipe(
    `${scopedPkg}@${version}`,
    packageIdentifierFromSpecifier,
    assertResultSuccess((id) => {
      expectToEqual(id, { name: scopedPkg, version: version });
    }),
  ));

it('returns Error if the package specifier is invalid', () =>
  pipe(
    invalidSpecifier,
    packageIdentifierFromSpecifier,
    assertResultError((err) => {
      expectToEqual(err, `Package specifier is invalid: ${invalidSpecifier}`);
    }),
  ));

it.run();
