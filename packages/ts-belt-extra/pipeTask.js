import { flatMap, isTask, of } from './Task';

export function pipeTask(task, ...fns) {
  let resultTask = task;

  for (const fn of fns) {
    resultTask = flatMap((v) => {
      const result = fn(v);
      return isTask(result) ? result : of(result);
    })(resultTask);
  }

  return resultTask;
}
