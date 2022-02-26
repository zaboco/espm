import { Task } from './Task';

/**
 * Performs left-to-right function composition of tasks (the first argument must be a task).
 */
export declare function pipeTask<A, Err>(task: Task<A, Err>): Task<A, Err>;
export declare function pipeTask<A, B, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
): Task<B, Err>;
export declare function pipeTask<A, B, C, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
): Task<C, Err>;
export declare function pipeTask<A, B, C, D, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
): Task<D, Err>;
export declare function pipeTask<A, B, C, D, E, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
  fn4: (arg: D) => Task<E, Err> | E,
): Task<E, Err>;
export declare function pipeTask<A, B, C, D, E, F, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
  fn4: (arg: D) => Task<E, Err> | E,
  fn5: (arg: E) => Task<F, Err> | F,
): Task<F, Err>;
export declare function pipeTask<A, B, C, D, E, F, G, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
  fn4: (arg: D) => Task<E, Err> | E,
  fn5: (arg: E) => Task<F, Err> | F,
  fn6: (arg: F) => Task<G, Err> | G,
): Task<G, Err>;
export declare function pipeTask<A, B, C, D, E, F, G, H, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
  fn4: (arg: D) => Task<E, Err> | E,
  fn5: (arg: E) => Task<F, Err> | F,
  fn6: (arg: F) => Task<G, Err> | G,
  fn7: (arg: G) => Task<H, Err> | H,
): Task<H, Err>;
export declare function pipeTask<A, B, C, D, E, F, G, H, I, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
  fn4: (arg: D) => Task<E, Err> | E,
  fn5: (arg: E) => Task<F, Err> | F,
  fn6: (arg: F) => Task<G, Err> | G,
  fn7: (arg: G) => Task<H, Err> | H,
  fn8: (arg: H) => Task<I, Err> | I,
): Task<I, Err>;
export declare function pipeTask<A, B, C, D, E, F, G, H, I, J, Err>(
  task: Task<A, Err>,
  fn1: (arg: A) => Task<B, Err> | B,
  fn2: (arg: B) => Task<C, Err> | C,
  fn3: (arg: C) => Task<D, Err> | D,
  fn4: (arg: D) => Task<E, Err> | E,
  fn5: (arg: E) => Task<F, Err> | F,
  fn6: (arg: F) => Task<G, Err> | G,
  fn7: (arg: G) => Task<H, Err> | H,
  fn8: (arg: H) => Task<I, Err> | I,
  fn9: (arg: I) => Task<J, Err> | J,
): Task<J, Err>;
