import {
  apFirst as optionApFirst,
  apSecond as optionApSecond,
  getMonoid as optionGetMonoid,
  getOrd as optionGetOrd,
  fromNullable as optionFromNullable,
  fromNullableK as optionFromNullableK,
  toNullable,
  toUndefined,
  tryCatch,
  map as optionMap,
  Option,
  none,
  some,
  isNone,
  isSome,
  elem,
  exists,
  fromPredicate as optionFromPredicate,
  getLeft,
  getRight,
  guard,
  getOrElse,
  chainNullableK,
  match as optionMatch,
  alt as optionAlt,
  getEq as optionGetEq,
} from 'https://esm.sh/fp-ts/Option';
import {
  Eq as numberEq,
  SemigroupSum,
  Ord as numberOrd,
} from 'https://esm.sh/fp-ts/number';
import { first, last } from 'https://esm.sh/fp-ts/Semigroup';
import { right, left } from 'https://esm.sh/fp-ts/Either';
import { pipe } from 'https://esm.sh/fp-ts/function';
import {
  assertStrictEquals,
  assertEquals,
} from 'https://deno.land/std@0.111.0/testing/asserts.ts';

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
    optionFromNullable,
    optionMap(({ bar }) => bar),
  ),
  { _tag: 'Some', value: 'hello' },
);

assertEquals(
  pipe(
    undefined,
    optionFromNullable,
    optionMap(({ bar }) => bar),
  ),
  { _tag: 'None' },
);

// const multiplyOptionalByTwo: (num: Option<number>) => Option<number> =
//   optionMap((n) => n * 2);

const a: Option<string> = { _tag: 'Some', value: 'a' };
const b: Option<string> = { _tag: 'Some', value: 'b' };

assertEquals(optionApFirst(a)(b), b);
assertEquals(optionApSecond(a)(b), a);

const getOption = optionFromPredicate((n: number) => n >= 0);

assertEquals(getOption(-1), none);
assertEquals(getOption(1), some(1));

assertEquals(getLeft(right(1)), none);
assertEquals(getLeft(left('a')), some('a'));
assertEquals(getRight(right(1)), some(1));
assertEquals(getRight(left('a')), none);

assertEquals(guard(true), some(undefined));
assertEquals(guard(false), none);

assertStrictEquals(
  pipe(
    some(1),
    getOrElse(() => 0),
  ),
  1,
);

assertStrictEquals(
  pipe(
    none,
    getOrElse(() => 0),
  ),
  0,
);

assertStrictEquals(
  pipe(
    some(1),
    optionMatch(
      () => 'a none',
      (a) => `a some containing ${a}`,
    ),
  ),
  'a some containing 1',
);

assertStrictEquals(
  pipe(
    none,
    optionMatch(
      () => 'a none',
      (a) => `a some containing ${a}`,
    ),
  ),
  'a none',
);

assertEquals(
  pipe(
    some('a'),
    optionAlt(() => some('b')),
  ),
  some('a'),
);

assertEquals(
  pipe(
    none,
    optionAlt(() => some('b')),
  ),
  some('b'),
);

const optionNumberEq = optionGetEq(numberEq);
assertStrictEquals(optionNumberEq.equals(none, none), true);
assertStrictEquals(optionNumberEq.equals(none, some(1)), false);
assertStrictEquals(optionNumberEq.equals(some(1), none), false);
assertStrictEquals(optionNumberEq.equals(some(1), some(2)), false);
assertStrictEquals(optionNumberEq.equals(some(1), some(1)), true);

const monoidSum = optionGetMonoid(SemigroupSum);
assertStrictEquals(monoidSum.concat(none, none), none);
assertEquals(monoidSum.concat(some(1), none), some(1));
assertEquals(monoidSum.concat(none, some(1)), some(1));
assertEquals(monoidSum.concat(some(1), some(2)), some(3));

const optionNumberOrd = optionGetOrd(numberOrd);
assertStrictEquals(optionNumberOrd.compare(none, none), 0);
assertStrictEquals(optionNumberOrd.compare(none, some(1)), -1);
assertStrictEquals(optionNumberOrd.compare(some(1), none), 1);
assertStrictEquals(optionNumberOrd.compare(some(1), some(2)), -1);
assertStrictEquals(optionNumberOrd.compare(some(1), some(1)), 0);

const monoidFirstOptionNumber = optionGetMonoid<number>(first());
assertStrictEquals(monoidFirstOptionNumber.concat(none, none), none);
assertEquals(monoidFirstOptionNumber.concat(some(1), none), some(1));
assertEquals(monoidFirstOptionNumber.concat(none, some(2)), some(2));
assertEquals(monoidFirstOptionNumber.concat(some(1), some(2)), some(1));

const monoidLastOptionNumber = optionGetMonoid<number>(last());
assertStrictEquals(monoidLastOptionNumber.concat(none, none), none);
assertEquals(monoidLastOptionNumber.concat(some(1), none), some(1));
assertEquals(monoidLastOptionNumber.concat(none, some(2)), some(2));
assertEquals(monoidLastOptionNumber.concat(some(1), some(2)), some(2));

interface Employee {
  readonly company?: {
    readonly address?: {
      readonly street?: {
        readonly name?: string;
      };
    };
  };
}

const employee1: Employee = {
  company: { address: { street: { name: 'high street' } } },
};

assertEquals(
  pipe(
    optionFromNullable(employee1.company),
    chainNullableK((company) => company.address),
    chainNullableK((address) => address.street),
    chainNullableK((street) => street.name),
  ),
  some('high street'),
);

const employee2: Employee = { company: { address: { street: {} } } };

assertStrictEquals(
  pipe(
    optionFromNullable(employee2.company),
    chainNullableK((company) => company.address),
    chainNullableK((address) => address.street),
    chainNullableK((street) => street.name),
  ),
  none,
);

assertStrictEquals(optionFromNullable(undefined), none);
assertStrictEquals(optionFromNullable(null), none);
assertEquals(optionFromNullable(1), some(1));

// eslint-disable-next-line fp-ts-strict/option-over-undefined
const f = (s: string): number | undefined => {
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
};

const g = optionFromNullableK(f);

assertEquals(g('1'), some(1));
assertStrictEquals(g('a'), none);

assertStrictEquals(pipe(some(1), toNullable), 1);
assertStrictEquals(pipe(none, toNullable), null);

assertStrictEquals(pipe(some(1), toUndefined), 1);
assertStrictEquals(pipe(none, toUndefined), undefined);

assertStrictEquals(
  tryCatch(() => {
    throw new Error();
  }),
  none,
);

assertEquals(
  tryCatch(() => 1),
  some(1),
);

assertStrictEquals(isNone(some(1)), false);
assertStrictEquals(isNone(none), true);

assertStrictEquals(isSome(some(1)), true);
assertStrictEquals(isSome(none), false);

assertStrictEquals(pipe(some(1), elem(numberEq)(1)), true);
assertStrictEquals(pipe(some(1), elem(numberEq)(2)), false);
assertStrictEquals(pipe(none, elem(numberEq)(1)), false);

assertStrictEquals(
  pipe(
    some(1),
    exists((n) => n > 0),
  ),
  true,
);

assertStrictEquals(
  pipe(
    some(1),
    exists((n) => n > 1),
  ),
  false,
);
assertStrictEquals(
  pipe(
    none,
    exists((n) => n > 0),
  ),
  false,
);
