import { Task } from '#ts-belt-extra';
import * as assert from 'uvu/assert';

export const assertTaskSuccess =
  <R, E>(res?: (r: R) => void) =>
  (task: Task<R, E>) => {
    task.fork((e) => {
      assert.unreachable(
        `Should have succeed. Got error [${stringify(e)}] instead.`,
      );
    }, res ?? (() => {}));
  };

export const assertTaskError =
  <R, E>(rej?: (e: E) => void) =>
  (task: Task<R, E>) => {
    task.fork(rej ?? (() => {}), (r) => {
      assert.unreachable(`Should have failed. Got [${stringify(r)}] instead.`);
    });
  };

function stringify(o: unknown) {
  return JSON.stringify(o, null, 2);
}
