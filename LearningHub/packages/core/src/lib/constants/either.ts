type Left<L> = {
  type: 'left';
  value: L;
};

type Right<R> = {
  type: 'right';
  value: R;
};

type Either<L, R> = Left<L> | Right<R>;

const left = <L>(value: L): Left<L> => ({
  type: 'left',
  value,
});

const right = <R>(value: R): Right<R> => ({
  type: 'right',
  value,
});

export type { Either };
export { right, left };
