import {
  concatAll as monoidConcatAll,
  Monoid,
  reverse as monoidReverse,
  struct as monoidStruct,
  fold as monoidFold,
  getStructMonoid,
} from 'https://esm.sh/fp-ts/Monoid';
import {
  getApplyMonoid,
  getMonoid as monoidGetMonoid,
  some,
  none,
  Option,
} from 'https://esm.sh/fp-ts/Option';
import { Predicate } from 'https://esm.sh/fp-ts/Predicate';
import { first, last } from 'https://esm.sh/fp-ts/Semigroup';
import { getMonoid } from 'https://esm.sh/fp-ts/function';
import {
  MonoidAll as monoidBooleanAll,
  MonoidAny as monoidBooleanAny,
} from 'https://esm.sh/fp-ts/boolean';
import {
  MonoidSum as monoidSum,
  MonoidProduct as monoidProduct,
} from 'https://esm.sh/fp-ts/number';
import { Monoid as monoidString } from 'https://esm.sh/fp-ts/string';

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
const sum = monoidConcatAll(monoidSum);
assertStrictEquals(sum([1, 2, 3, 4]), 10);

assertStrictEquals(monoidReverse(monoidString).concat('a', 'b'), 'ba');

interface Point {
  readonly x: number;
  readonly y: number;
}

const monoidPoint = monoidStruct<Point>({
  x: monoidSum,
  y: monoidSum,
});

assertEquals(monoidPoint.concat({ x: 1, y: 2 }, { x: 3, y: 4 }), {
  x: 4,
  y: 6,
});

// from https://dev.to/gcanti/getting-started-with-fp-ts-monoid-ja0
assertStrictEquals(monoidFold(monoidSum)([1, 2, 3, 4]), 10);
assertStrictEquals(monoidFold(monoidProduct)([1, 2, 3, 4]), 24);
assertStrictEquals(monoidFold(monoidString)(['a', 'b', 'c']), 'abc');
assertStrictEquals(monoidFold(monoidBooleanAll)([true, false, true]), false);
assertStrictEquals(monoidFold(monoidBooleanAny)([true, false, true]), true);

const monoidOptionSum = getApplyMonoid(monoidSum);

assertStrictEquals(monoidOptionSum.concat(some(1), none), none);
assertEquals(monoidOptionSum.concat(some(1), some(2)), some(3));
assertEquals(monoidOptionSum.concat(some(1), monoidOptionSum.empty), some(1));

const monoidOptionFirstNumber = monoidGetMonoid<number>(first());
assertEquals(monoidOptionFirstNumber.concat(some(1), none), some(1));
assertEquals(monoidOptionFirstNumber.concat(none, some(1)), some(1));
assertEquals(monoidOptionFirstNumber.concat(some(1), some(2)), some(1));

const monoidOptionLastNumber = monoidGetMonoid<number>(last());
assertEquals(monoidOptionLastNumber.concat(some(1), none), some(1));
assertEquals(monoidOptionLastNumber.concat(none, some(1)), some(1));
assertEquals(monoidOptionLastNumber.concat(some(1), some(2)), some(2));

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  fontFamily: Option<string>;
  /** Controls the font size in pixels */
  fontSize: Option<number>;
  /** Limit the width of the minimap to render at most a certain number of columns. */
  maxColumn: Option<number>;
}

const monoidOptionLastString = monoidGetMonoid<string>(last());

const monoidSettings: Monoid<Settings> = getStructMonoid({
  fontFamily: monoidOptionLastString,
  fontSize: monoidOptionLastNumber,
  maxColumn: monoidOptionLastNumber,
});

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80),
};

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none,
};

/** userSettings overrides workspaceSettings */
assertEquals(monoidSettings.concat(workspaceSettings, userSettings), {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: some(80),
});
