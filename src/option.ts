import {
  fromNullable,
  map as optionMap,
  Option,
} from 'https://esm.sh/fp-ts/Option';
import { pipe, flow } from 'https://esm.sh/fp-ts/function';
import { assertEquals } from 'https://deno.land/std@0.111.0/testing/asserts.ts';

interface Foo {
  bar: string;
}

const foo = {
  bar: 'hello',
  // eslint-disable-next-line fp-ts-strict/option-over-undefined
} as Foo | undefined;

assertEquals(
  pipe(
    foo,
    fromNullable,
    optionMap(({ bar }) => bar),
  ),
  { _tag: 'Some', value: 'hello' },
);

assertEquals(
  pipe(
    undefined,
    fromNullable,
    optionMap(({ bar }) => bar),
  ),
  { _tag: 'None' },
);

// const multiplyOptionalByTwo: (num: Option<number>) => Option<number> =
//   optionMap((n) => n * 2);
