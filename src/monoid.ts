import {
  concatAll as monoidConcatAll,
  Monoid,
  reverse as monoidReverse,
  struct as monoidStruct,
} from 'https://esm.sh/fp-ts/Monoid';
import { Predicate } from 'https://esm.sh/fp-ts/Predicate';
import { getMonoid } from 'https://esm.sh/fp-ts/function';
import {
  MonoidAll as monoidBooleanAll,
  MonoidAny as monoidBooleanAny,
} from 'https://esm.sh/fp-ts/boolean';
import { MonoidSum } from 'https://esm.sh/fp-ts/number';
import { Monoid as stringMonoid } from 'https://esm.sh/fp-ts/string';

import {
  assertStrictEquals,
  assertEquals,
} from 'https://deno.land/std@0.111.0/testing/asserts.ts';

const lessThanOrEqualToFour: Predicate<number> = (n) => n <= 4;
const greaterThanOrEqualToZero: Predicate<number> = (n) => n >= 0;
const isOdd: Predicate<number> = (n) => n % 2 === 1;

// log({ lessThanOrEqualToFour, greaterThanOrEqualToZero })();

// const monoidBooleanAll = getMonoid(monoidBooleanAll)<number>();

// log(`"${monoidBooleanAll.empty}"!`)();

// const predicateAll = concatAll(monoidBooleanAll)([
//   lessThanOrEqualToFour,
//   greaterThanOrEqualToZero,
//   isOdd,
// ]);

const combinePredicates =
  (monoidBoolean: Monoid<boolean>) =>
  <PredicateArg>(predicates: Predicate<PredicateArg>[]) =>
    monoidConcatAll(getMonoid(monoidBoolean)<PredicateArg>())(predicates);

const arrayPredicates = [
  lessThanOrEqualToFour,
  greaterThanOrEqualToZero,
  isOdd,
];

const predicateAny = combinePredicates(monoidBooleanAny);
const predicateAll = combinePredicates(monoidBooleanAll);

assertStrictEquals(predicateAny(arrayPredicates)(11), true);
assertStrictEquals(predicateAll(arrayPredicates)(3), true);

// // // assert.deepStrictEqual(M1.concat(f, g)(3), false);

// // // const M2 = getMonoid(B.MonoidAny)<number>();

// // // assert.deepStrictEqual(M2.concat(f, g)(1), true);
// // // assert.deepStrictEqual(M2.concat(f, g)(3), true);

// compare with const sum = semigroupConcatAll(semigroupSum)(0);
const sum = monoidConcatAll(MonoidSum);
assertStrictEquals(sum([1, 2, 3, 4]), 10);

assertStrictEquals(monoidReverse(stringMonoid).concat('a', 'b'), 'ba');

interface Point {
  readonly x: number;
  readonly y: number;
}

const monoidPoint = monoidStruct<Point>({
  x: MonoidSum,
  y: MonoidSum,
});

assertEquals(monoidPoint.concat({ x: 1, y: 2 }, { x: 3, y: 4 }), {
  x: 4,
  y: 6,
});
