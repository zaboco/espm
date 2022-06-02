import * as assert from 'uvu/assert';
import { suite } from 'uvu';

const test = suite('add');

test('simple', () => {
  assert.equal(1 + 2, 3);
});

test('big numbers', () => {
  assert.equal(23 + 52, 75);
});

test.run();
