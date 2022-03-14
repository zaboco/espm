export const log =
  (tag: string) =>
  <V>(value: V): V => {
    console.log(tag, value);
    return value;
  };
