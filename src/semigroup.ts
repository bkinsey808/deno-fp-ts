import {
  Semigroup,
  concatAll as semigroupConcatAll,
  struct as semigroupStruct,
  tuple as semigroupTuple,
  intercalate,
  reverse as semigroupReverse,
  max as semigroupMax,
  min as semigroupMin,
  getMeetSemigroup,
  getJoinSemigroup,
  first,
  last,
  fold as semigroupFold,
} from 'https://esm.sh/fp-ts/Semigroup';
import {
  SemigroupAll as semigroupAll,
  SemigroupAny as semigroupAny,
} from 'https://esm.sh/fp-ts/boolean';
import {
  SemigroupSum as semigroupSum,
  SemigroupProduct as semigroupProduct,
  Ord as numberOrd,
  MonoidSum as monoidSum,
  MonoidProduct as monoidProduct,
} from 'https://esm.sh/fp-ts/number';
import { Semigroup as stringSemigroup } from 'https://esm.sh/fp-ts/string';
import { pipe, getSemigroup } from 'https://esm.sh/fp-ts/function';
import { contramap as ordContramap, ordNumber } from 'https://esm.sh/fp-ts/Ord';
import { getMonoid as arrayGetMonoid } from 'https://esm.sh/fp-ts/Array';
import { concatAll as monoidConcatAll } from 'https://esm.sh/fp-ts/Monoid';

import {
  assertStrictEquals,
  assertEquals,
} from 'https://deno.land/std@0.111.0/testing/asserts.ts';
import { getApplySemigroup, some, none } from 'https://esm.sh/fp-ts/Option';

// semigroup has an associative binary operation called concat.
// associative means the order you run concat on x, y, and z does not matter.
// concat(x, concat(y, z)) = concat(concat(x, y), z)

export const semigroupString: Semigroup<string> = {
  concat: (x, y) => x + y,
};

export const semigroupSumDerived: Semigroup<number> = {
  concat: (x, y) => x + y,
};

export const semigroupProductDerived: Semigroup<number> = {
  concat: (x, y) => x * y,
};

const sum = semigroupConcatAll(semigroupSum)(0);
assertStrictEquals(sum([1, 2, 3, 4]), 10);

const sumAlternative1 = semigroupConcatAll(semigroupSumDerived)(0);
assertStrictEquals(sumAlternative1([1, 2, 3, 4]), 10);

const sumAlternative2 = semigroupFold(semigroupSum)(0);
assertStrictEquals(sumAlternative2([1, 2, 3, 4]), 10);

const sumAlternative3 = monoidConcatAll(monoidSum);
assertStrictEquals(sumAlternative3([1, 2, 3, 4]), 10);

const product = semigroupConcatAll(semigroupProduct)(1);
assertStrictEquals(product([1, 2, 3, 4]), 24);

const productAlternative1 = semigroupConcatAll(semigroupProductDerived)(1);
assertStrictEquals(productAlternative1([1, 2, 3, 4]), 24);

const productAlternative2 = semigroupFold(semigroupProduct)(1);
assertStrictEquals(productAlternative2([1, 2, 3, 4]), 24);

const productAlternative3 = monoidConcatAll(monoidProduct);
assertStrictEquals(productAlternative3([1, 2, 3, 4]), 24);

assertStrictEquals(semigroupAll.concat(true, true), true);
assertStrictEquals(semigroupAll.concat(true, false), false);

const semigroupAllTrue = semigroupConcatAll(semigroupAll)(true);
const semigroupAnyTrue = semigroupConcatAll(semigroupAny)(true);

assertStrictEquals(semigroupAllTrue([true, false]), false);
assertStrictEquals(semigroupAnyTrue([true, false]), true);

const x = 'x';
const y = 'y';
const z = 'z';

assertStrictEquals(semigroupString.concat(x, y), 'xy');
assertStrictEquals(
  semigroupString.concat(x, semigroupString.concat(y, z)),
  'xyz',
);
assertStrictEquals(
  semigroupString.concat(semigroupString.concat(x, y), z),
  'xyz',
);

const concatString = semigroupConcatAll(semigroupString)('');
assertStrictEquals(concatString([x, y, z]), 'xyz');

const semigroupStringIntercalatePlus = pipe(
  stringSemigroup,
  intercalate(' + '),
);

assertStrictEquals(semigroupStringIntercalatePlus.concat('a', 'b'), 'a + b');

assertStrictEquals(semigroupReverse(stringSemigroup).concat('a', 'b'), 'ba');

interface Point {
  readonly x: number;
  readonly y: number;
}

const semigroupPointSum = semigroupStruct<Point>({
  x: semigroupSum,
  y: semigroupSum,
});

const p1: Point = { x: 1, y: 2 };
const p2: Point = { x: 3, y: 4 };
assertEquals(semigroupPointSum.concat(p1, p2), {
  x: 4,
  y: 6,
});

const semigroupTupleConcatSum = semigroupTuple(stringSemigroup, semigroupSum);
assertEquals(semigroupTupleConcatSum.concat(['a', 1], ['b', 2]), ['ab', 3]);

const semigroupTupleConcatSumAll = semigroupTuple(
  stringSemigroup,
  semigroupSum,
  semigroupAll,
);
assertEquals(
  semigroupTupleConcatSumAll.concat(['a', 1, true], ['b', 2, false]),
  ['ab', 3, false],
);

const semigroupNumberMax = semigroupMax(numberOrd);
assertStrictEquals(semigroupNumberMax.concat(1, 2), 2);

const semigroupNumberMin = semigroupMin(numberOrd);
assertStrictEquals(semigroupNumberMin.concat(1, 2), 1);

assertStrictEquals(first<number>().concat(1, 2), 1);
assertStrictEquals(last<number>().concat(1, 2), 2);

const semigroupPointPredicate: Semigroup<(p: Point) => boolean> =
  getSemigroup(semigroupAll)<Point>();

const isPositiveX = (p: Point): boolean => p.x >= 0;
const isPositiveY = (p: Point): boolean => p.y >= 0;
const isPositiveXY = semigroupPointPredicate.concat(isPositiveX, isPositiveY);

assertStrictEquals(isPositiveXY({ x: 1, y: 1 }), true);
assertStrictEquals(isPositiveXY({ x: 1, y: -1 }), false);
assertStrictEquals(isPositiveXY({ x: -1, y: 1 }), false);
assertStrictEquals(isPositiveXY({ x: -1, y: -1 }), false);

const semigroupOptionNumber = getApplySemigroup(semigroupSumDerived);

assertStrictEquals(semigroupOptionNumber.concat(some(1), none), none);
assertEquals(semigroupOptionNumber.concat(some(1), some(2)), some(3));

// from https://dev.to/gcanti/getting-started-with-fp-ts-semigroup-2mf7
interface Customer {
  name: string;
  favoriteThings: Array<string>;
  registeredAt: number; // since epoch
  lastUpdatedAt: number; // since epoch
  hasMadePurchase: boolean;
}

const semigroupCustomer: Semigroup<Customer> = semigroupStruct({
  // keep the longer name
  name: semigroupMax(ordContramap((s: string) => s.length)(numberOrd)),
  // accumulate things
  favoriteThings: arrayGetMonoid<string>(), // <= arrayGetMonoid returns a Semigroup for `Array<string>` see later
  // keep the least recent date
  registeredAt: semigroupMin(ordNumber),
  // keep the most recent date
  lastUpdatedAt: semigroupMax(ordNumber),
  // Boolean semigroup under disjunction
  hasMadePurchase: semigroupAny,
});

const c1 = {
  name: 'Giulio',
  favoriteThings: ['math', 'climbing'],
  registeredAt: new Date(2018, 1, 20).getTime(),
  lastUpdatedAt: new Date(2018, 2, 18).getTime(),
  hasMadePurchase: false,
};

const c2 = {
  name: 'Giulio Canti',
  favoriteThings: ['functional programming'],
  registeredAt: new Date(2018, 1, 22).getTime(),
  lastUpdatedAt: new Date(2018, 2, 9).getTime(),
  hasMadePurchase: true,
};

const c3 = {
  name: 'Giulio Canti',
  favoriteThings: ['math', 'climbing', 'functional programming'],
  registeredAt: new Date(2018, 1, 20).getTime(),
  lastUpdatedAt: new Date(2018, 2, 18).getTime(),
  hasMadePurchase: true,
};

assertEquals(semigroupCustomer.concat(c1, c2), c3);

// this is a semigroup that is not a monoid.
// We can't find an empty value such that concat(x, empty) = x
const semigroupSpace: Semigroup<string> = {
  concat: (x, y) => x + ' ' + y,
};
assertStrictEquals(semigroupSpace.concat('a', 'b'), 'a b');

/** Takes the minimum of two values */
const derivedSemigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber);

/** Takes the maximum of two values  */
const derivedSemigroupMax: Semigroup<number> = getJoinSemigroup(ordNumber);

assertStrictEquals(derivedSemigroupMin.concat(2, 1), 1);
assertStrictEquals(derivedSemigroupMax.concat(2, 1), 2);
