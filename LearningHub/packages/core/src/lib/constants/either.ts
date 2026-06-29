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

function unwrap<L extends { message: string }, R>(r: Either<L, R>): R {
  if (r.type === 'left') throw new Error(r.value.message);
  return r.value;
}

export type { Either };
export { right, left, unwrap };
