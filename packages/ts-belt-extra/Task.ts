import { A, flow, O, Option, pipe, R as Res, Result } from '@mobily/ts-belt';

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

export const run =
  <R, E>(onRes: (r: R) => void) =>
  (task: Task<R, E>): void =>
    task.fork(() => {}, onRes);

export const rejected = <R, E>(e: E): Task<R, E> =>
  make((rej) => {
    rej(e);
  });

export const flatMap =
  <R, O, E>(fn: (r: R) => Task<O, E>) =>
  (task: Task<R, E>): Task<O, E> =>
    make((rej, res) => {
      task.fork(rej, (r) => {
        fn(r).fork(rej, res);
      });
    });

export const map =
  <R, O, _E>(fn: (r: R) => O) =>
  (task: Task<R, _E>): Task<O, _E> =>
    make((rej, res) => {
      task.fork(rej, flow(fn, res));
    });

export const zipWith = <R1, R2, O, _E>(
  t1: Task<R1, _E>,
  t2: Task<R2, _E>,
  fn: (r1: R1, r2: R2) => O,
): Task<O, _E> =>
  pipe(
    t1,
    flatMap((r1) =>
      pipe(
        t2,
        map((r2) => fn(r1, r2)),
      ),
    ),
  );

export const mapError =
  <_R, E, F>(fn: (r: E) => F) =>
  (task: Task<_R, E>): Task<_R, F> =>
    make((rej, res) => {
      task.fork(flow(fn, rej), res);
    });

export const tap = <R, E>(fn: (r: R) => void) =>
  map<R, R, E>((r) => {
    fn(r);
    return r;
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
    Res.match(result, res, rej);
  });

export const fromOption =
  <R, E>(errorValue: NonNullable<E>) =>
  (option: Option<R>): Task<R, E> =>
    pipe(option, O.toResult(errorValue), fromResult);

export function isTask<O, R, E>(
  potentialTask: Task<R, E> | O,
): potentialTask is Task<R, E> {
  return typeof potentialTask === 'object' && 'fork' in potentialTask;
}

export const sequence = <R, E>(
  tasks: readonly Task<R, E>[],
): Task<readonly R[], E> => {
  return A.reduce(tasks, of<readonly R[], E>([]), (acc, task) => {
    return pipe(
      acc,
      flatMap((a) =>
        pipe(
          task,
          map((r) => A.prepend(a, r)),
        ),
      ),
    );
  });
};

export const all = <R, E>(
  tasks: readonly Task<NonNullable<R>, NonNullable<E>>[],
): Task<R[], E> => {
  return make((rej, res) => {
    let settledCount = 0;
    const resolved: R[] = [];
    let wasRejected = false;

    const tryToSettle = () => {
      settledCount++;
      if (settledCount !== tasks.length) {
        return;
      }
      res(resolved);
    };

    A.forEachWithIndex(tasks, (index, task) => {
      if (wasRejected) {
        return;
      }
      task.fork(
        (e) => {
          if (wasRejected) {
            return;
          }
          wasRejected = true;
          rej(e);
        },
        (r) => {
          if (wasRejected) {
            return;
          }
          resolved[index] = r;
          tryToSettle();
        },
      );
    });
  });
};
