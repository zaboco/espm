import * as assert from 'uvu/assert';

export function expectToEqual<T>(actual: T, expected: T): void {
  return assert.equal(actual, expected);
}
