import { G, A } from '@mobily/ts-belt';

export const ensureArray = <A>(oneOrMany: A | A[]): A[] =>
  G.isArray(oneOrMany) ? oneOrMany : [oneOrMany];

export const rejectNullables = <X>(
  xs: readonly X[],
): readonly NonNullable<X>[] =>
  A.filter(xs, G.isNotNullable) as readonly NonNullable<X>[];
