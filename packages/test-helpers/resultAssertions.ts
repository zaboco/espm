import { R, Result } from '@mobily/ts-belt';
import * as assert from 'uvu/assert';

export const assertResultSuccess =
  <$R, $E>(res?: (r: $R) => void) =>
  (result: Result<$R, $E>): void => {
    R.match(result, res ?? (() => {}), (e) => {
      assert.unreachable(
        `Should have succeed. Got error [${stringify(e)}] instead.`,
      );
    });
  };

export const assertResultError =
  <$R, $E>(rej?: (e: $E) => void) =>
  (result: Result<$R, $E>): void => {
    R.match(
      result,
      (r) => {
        assert.unreachable(
          `Should have failed. Got [${stringify(r)}] instead.`,
        );
      },
      rej ?? (() => {}),
    );
  };

function stringify(o: unknown) {
  return JSON.stringify(o, null, 2);
}
