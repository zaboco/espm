import { F, flow, pipe } from '@mobily/ts-belt';
import * as util from 'node:util';

export type Id<T, V> = {
  __tag: T;
  __value: V;
  toString: () => string;
  [util.inspect.custom]: () => string;
};

export function factory<T, V>(tag: T) {
  const of = (v: V): Id<T, V> => ({
    __tag: tag,
    __value: v,
    toString() {
      return `${tag}(${v})`;
    },
    [util.inspect.custom]() {
      return `${tag}(${v})`;
    },
  });

  const flatMap =
    <W>(fn: (v: V) => Id<T, W>) =>
    (id: Id<T, V>): Id<T, W> =>
      fn(id.__value);

  const map =
    (fn: (v: V) => V) =>
    (id: Id<T, V>): Id<T, V> =>
      pipe(id, flatMap(flow(fn, of)));

  const fold =
    (fn: (v: V) => V) =>
    (id: Id<T, V>): V =>
      fn(id.__value);

  return {
    of,
    // flatMap,
    // map,
    // fold,
    unwrap: fold(F.identity),
    tap: (fn: (v: V) => void) =>
      map((r) => {
        fn(r);
        return r;
      }),
  };
}
