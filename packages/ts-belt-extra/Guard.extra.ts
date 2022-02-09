export type ItemType<A> = A extends ReadonlyArray<infer I> ? I : never;

export const isOneOf = <A extends ReadonlyArray<unknown>>(
  item: unknown,
  alternatives: A,
): item is ItemType<A> => alternatives.includes(item);
