import { G } from '@mobily/ts-belt';

export const ensureArray = <A>(oneOrMany: A | A[]): A[] =>
  G.isArray(oneOrMany) ? oneOrMany : [oneOrMany];

export const filterGuarded =
  <X, Y extends X>(predicate: (value: X) => value is Y) =>
  (xs: readonly X[]): Y[] => {
    return xs.filter(predicate);
  };
