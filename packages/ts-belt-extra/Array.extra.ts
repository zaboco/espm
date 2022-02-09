import { G } from '@mobily/ts-belt';

export const ensureArray = <A>(oneOrMany: A | A[]): A[] =>
  G.isArray(oneOrMany) ? oneOrMany : [oneOrMany];
