import {
  Ord,
  contramap as ordContramap,
  ordString,
  fromCompare,
  reverse as ordReverse,
} from 'https://esm.sh/fp-ts/Ord';
import { Ord as ordNumber } from 'https://esm.sh/fp-ts/number';
import {
  sort,
  sortBy,
  getOrd as arrayGetOrd,
} from 'https://esm.sh/fp-ts/Array';

import {
  assertStrictEquals,
  assertEquals,
} from 'https://deno.land/std@0.111.0/testing/asserts.ts';

// import { log } from 'https://esm.sh/fp-ts/Console';

// Ord: Totally ordered data type

// Contract:
// Must extend setoid (Eq)
// Must provide compare function
//  -1 is for x < y
//  0 is for x === y
//  1 is for x > 1

// reflexive
// anti-symmetric
// transitive

// Ord type class
// => used for ordering things it contains types that admit a total ordering

// Mostly taken from https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e

// Our interface for the Ord type class
// For something to be a member of the Ord type class it has to implement an compare method that returns an Ordering
// It also needs an equals method that returns true from the Eq type class

// We are going to create an ordering for this type
type Song = {
  releaseYear: number;
  title: string;
  artistId: number;
};

// We would like to order songs by the year they were released
const ordByReleaseYear: Ord<Song> = ordContramap(
  (song: Song) => song.releaseYear,
)(ordNumber);

const ordByArtistId: Ord<Song> = ordContramap((song: Song) => song.artistId)(
  ordNumber,
);

const ordByTitle: Ord<Song> = ordContramap((song: Song) => song.title)(
  ordString,
);

const s1: Song = { title: 'good morning', releaseYear: 2020, artistId: 1 };
const s2: Song = { title: 'take care', artistId: 1, releaseYear: 2018 };

// Let's compare two songs
assertStrictEquals(ordByReleaseYear.compare(s1, s2), 1); // because 2020 > 2018

// sort
assertEquals(sort(ordByReleaseYear)([s1, s2]), [s2, s1]); // not reference equal
assertEquals(sortBy([ordByReleaseYear, ordByArtistId, ordByTitle])([s1, s2]), [
  s2,
  s1,
]); // not reference equal

interface Obj {
  a: number;
}

// credit: https://slides.com/vineetkumar-4/functional-programming-ii#/6/0/1
const ordObjByKey = <Obj>(key: keyof Obj) =>
  fromCompare((obj1: Obj, obj2: Obj) =>
    obj1[key] < obj2[key] ? -1 : obj1[key] > obj2[key] ? 1 : 0,
  );
const ordObjByA = ordObjByKey<Obj>('a');

const o1: Obj = { a: 20 };
const o2: Obj = { a: 3 };
const o3: Obj = { a: 34 };

const sortObjByA = sort(ordObjByA);
const sortObjByKey = <ObjType>(key: keyof ObjType) => sort(ordObjByKey(key));
assertEquals(sortObjByA([o1, o2, o3]), [o2, o1, o3]);
assertEquals(sortObjByKey('a')([o1, o2, o3]), [o2, o1, o3]);

const ordArrayObjByA = arrayGetOrd(ordObjByA);
const ordArrayObjByKey = <ObjType>(key: keyof ObjType) =>
  arrayGetOrd(ordObjByKey(key));
assertStrictEquals(ordArrayObjByA.compare([{ a: 20 }], [{ a: 30 }]), -1);
assertStrictEquals(ordArrayObjByKey('a').compare([{ a: 20 }], [{ a: 30 }]), -1);

interface HasZIndex {
  zIndex: number;
}

// Contravariant Functor
const sortByZIndex = sort(ordContramap((x: HasZIndex) => x.zIndex)(ordNumber));

assertEquals(sortByZIndex([{ zIndex: 113 }, { zIndex: 10 }, { zIndex: 11 }]), [
  { zIndex: 10 },
  { zIndex: 11 },
  { zIndex: 113 },
]);

// from https://dev.to/gcanti/getting-started-with-fp-ts-ord-5f1e

const min =
  <A>(O: Ord<A>): ((x: A, y: A) => A) =>
  (x, y) =>
    O.compare(x, y) === 1 ? y : x;
assertStrictEquals(min(ordNumber)(2, 1), 1);

type User = {
  name: string;
  age: number;
};

const byAge: Ord<User> = ordContramap((user: User) => user.age)(ordNumber);

const getYounger = min(byAge);

assertEquals(
  getYounger({ name: 'Guido', age: 48 }, { name: 'Giulio', age: 45 }),
  { name: 'Giulio', age: 45 },
);

const max = <A>(ord: Ord<A>): ((x: A, y: A) => A) => min(ordReverse(ord));

const getOlder = max(byAge);
assertEquals(
  getOlder({ name: 'Guido', age: 48 }, { name: 'Giulio', age: 45 }),
  { name: 'Guido', age: 48 },
);
