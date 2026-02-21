declare module 'ramda/src/differenceWith' {
  function differenceWith<T>(
    predicate: (a: T, b: T) => boolean,
    first: ReadonlyArray<T>,
    second: ReadonlyArray<T>,
  ): T[];

  export default differenceWith;
}

