import { pipe, flow } from 'https://esm.sh/fp-ts/function';

import { assertStrictEquals } from 'https://deno.land/std@0.111.0/testing/asserts.ts';

const add1 = (num: number): number => num + 1;

const multiply2 = (num: number): number => num * 2;

assertStrictEquals(pipe(1, add1, multiply2), 4);

const toString = (num: number): string => `${num}`;

assertStrictEquals(pipe(1, add1, multiply2, toString), '4');

assertStrictEquals(
  pipe(1, flow(add1, multiply2, toString)),
  flow(add1, multiply2, toString)(1),
);

interface Foo {
  bar: string;
}

const foo = {
  bar: 'hello',
  // eslint-disable-next-line fp-ts-strict/option-over-undefined
} as Foo | undefined;

assertStrictEquals(
  pipe(foo, (f) => f?.bar),
  'hello',
);

assertStrictEquals(flow((f: typeof foo) => f?.bar)(foo), 'hello');
