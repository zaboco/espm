import { equal } from 'uvu/assert';
import { suite } from 'uvu';

const test = suite('add');

test('simple', () => {
  equal(1 + 2, 3);
});

test('big numbers', () => {
  equal(23 + 52, 75);
});

test.run();
