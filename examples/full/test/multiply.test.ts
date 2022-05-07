import * as assert from 'uvu/assert';
import { suite } from 'uvu';

const test = suite('multiply');

test('simple', () => {
  assert.equal(3 * 5, 15);
});

test.run();
