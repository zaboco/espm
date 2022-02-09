import { flow, O, Option, pipe, R, Result } from '@mobily/ts-belt';

export type Task<R, E> = { fork: Fork<R, E> };
type Fork<R, E> = (rej: (e: E) => void, res: (r: R) => void) => void;

export const make = <R, E>(fork: Fork<R, E>): Task<R, E> => ({ fork });

export const of = <R, _E>(r: R): Task<R, _E> =>
  make((_rej, res) => {
    res(r);
  });

export const fork =
  <R, E>(onRej: (e: E) => void, onRes: (r: R) => void) =>
  (task: Task<R, E>): void => {
    task.fork(onRej, onRes);
  };

export const rejected = <E>(e: E): Task<never, E> =>
  make((rej) => {
    rej(e);
  });

export const flatMap =
  <R1, R2, E>(fn: (r: R1) => Task<R2, E>) =>
  (task: Task<R1, E>): Task<R2, E> =>
    make((rej, res) => {
      task.fork(rej, (r) => {
        fn(r).fork(rej, res);
      });
    });

export const map =
  <R1, R2, E>(fn: (r: R1) => R2) =>
  (task: Task<R1, E>): Task<R2, E> =>
    make((rej, res) => {
      task.fork(rej, flow(fn, res));
    });

export const fromPromise = <R, E>(
  thunk: () => Promise<R>,
  errorMapper: (err: any) => E,
): Task<R, E> =>
  make((rej, res) => {
    thunk().then(res, flow(errorMapper, rej));
  });

export const fromResult = <TR, TE>(result: Result<TR, TE>): Task<TR, TE> =>
  make((rej, res) => {
    R.match(result, res, rej);
  });

export const fromOption =
  <R, E>(errorValue: NonNullable<E>) =>
  (option: Option<R>): Task<R, E> =>
    pipe(option, O.toResult(errorValue), fromResult);
