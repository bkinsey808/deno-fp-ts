import {
  Eq,
  fromEquals,
  struct as eqStruct,
  tuple,
  contramap as eqContramap,
  eqStrict,
} from 'https://esm.sh/fp-ts/Eq';
import { Eq as eqString } from 'https://esm.sh/fp-ts/string';
import { Eq as eqNumber } from 'https://esm.sh/fp-ts/number';
import { Eq as eqBoolean } from 'https://esm.sh/fp-ts/boolean';
import { getEq } from 'https://esm.sh/fp-ts/Array';

import { assertStrictEquals } from 'https://deno.land/std@0.111.0/testing/asserts.ts';

// a setoid is a set equipped with an equivalence relation
// contract: must provide equals method

// Symmetric
// Transitive
// Reflexive

assertStrictEquals(eqNumber.equals(10, 10), true);
assertStrictEquals(eqString.equals('abc', 'def'), false);

const elem =
  <A>(eq: Eq<A>): ((a: A, as: Array<A>) => boolean) =>
  (a, as) =>
    as.some((item) => eq.equals(item, a));

const elem2 =
  <A>(eq: Eq<A>) =>
  (a: A, as: Array<A>) =>
    as.some((item) => eq.equals(item, a));

assertStrictEquals(elem(eqNumber)(1, [1, 2, 3]), true);
assertStrictEquals(elem2(eqNumber)(4, [1, 2, 3]), false);

type Point = {
  x: number;
  y: number;
};

const eqPoint: Eq<Point> = eqStruct({
  x: eqNumber,
  y: eqNumber,
});

const p1 = { x: 1, y: 2 };
const p2 = { x: 1, y: 2 };

assertStrictEquals(eqPoint.equals(p1, p2), true);

interface Dog {
  type: 'Dog';
  dogName: string;
}

interface Fish {
  type: 'Fish';
  fishIsCalled: string;
}

type Animal = Dog | Fish;

const eqDog = eqStruct({
  type: eqString,
  dogName: eqString,
});

const eqFish = eqStruct({
  type: eqString,
  fishIsCalled: eqString,
});

const eqAnimal: Eq<Animal> = fromEquals((x: Animal, y: Animal) => {
  if (x.type === 'Dog' && y.type === 'Dog') {
    return eqDog.equals(x, y);
  }
  if (x.type === 'Fish' && y.type === 'Fish') {
    return eqFish.equals(x, y);
  }
  return false;
});

const dog1: Animal = {
  type: 'Dog',
  dogName: 'Fido',
};

const dog2: Animal = {
  type: 'Dog',
  dogName: 'Fido',
};

assertStrictEquals(eqAnimal.equals(dog1, dog2), true);

type Artist = {
  artistId: number;
  name: string;
};

// Two artists are equal if their `artistId` field is equal
const eqArtist: Eq<Artist> = eqContramap((artist: Artist) => artist.artistId)(
  eqNumber,
);

// We can now pass in two Artist objects and check for equality
assertStrictEquals(
  eqArtist.equals({ artistId: 1, name: 'EDEN' }, { artistId: 1, name: 'eden' }),
  true,
);
assertStrictEquals(
  eqArtist.equals({ artistId: 1, name: 'ATO' }, { artistId: 2, name: 'ATO' }),
  false,
);

interface Album {
  artist: Artist;
  title: string;
  albumId: number;
}

// contramap takes in a function that takes in something of type B and returns something of type A
// It then returns a function that takes in something of type Eq<A> and returns a new Eq<B>
// see https://cedricdose.com/pages/posts/functional-programming-eq-type-class
const eqAlbumBySameArtist: Eq<Album> = eqContramap(
  (album: Album) => album.artist,
)(eqArtist);

// Now we can check if an album is made by the same artist
assertStrictEquals(
  eqAlbumBySameArtist.equals(
    { artist: { artistId: 1, name: 'EDEN' }, title: 'no future', albumId: 1 },
    { artist: { artistId: 1, name: 'eden' }, title: 'vertigo', albumId: 5 },
  ),
  true,
);

const tupleStringNumberBoolean = tuple(eqString, eqNumber, eqBoolean);
assertStrictEquals(
  tupleStringNumberBoolean.equals(['a', 1, true], ['a', 1, true]),
  true,
);
assertStrictEquals(
  tupleStringNumberBoolean.equals(['a', 1, true], ['b', 1, true]),
  false,
);
assertStrictEquals(
  tupleStringNumberBoolean.equals(['a', 1, true], ['a', 2, true]),
  false,
);
assertStrictEquals(
  tupleStringNumberBoolean.equals(['a', 1, true], ['a', 1, false]),
  false,
);

// equivalent to ramda Ramda eqBy(Math.abs, 5, -5)
const eqAbs = eqContramap((x: number) => Math.abs(x))(eqNumber);
assertStrictEquals(eqAbs.equals(5, -5), true);

// equivalent to ramda Ramda eqBy
const eqBy = <A>(f: (a: A) => A, eq: Eq<A>) => eqContramap(f)(eq);

const eqAbs2 = eqBy(Math.abs, eqNumber);
assertStrictEquals(eqAbs2.equals(5, -5), true);

// equivalent to ramda Ramda eqProps
const eqProps = <A>(prop: keyof A, eq: Eq<A[keyof A]>) =>
  eqContramap((a: A) => a[prop])(eq);

const o1 = { a: 1, b: 2, c: 3, d: 4 };
const o2 = { a: 10, b: 20, c: 3, d: 40 };
assertStrictEquals(eqProps('a', eqString).equals(o1, o2), false);
assertStrictEquals(eqProps('c', eqString).equals(o1, o2), true);

const o3 = o1;

assertStrictEquals(
  // strict equality
  eqStrict.equals(o1, o3),
  true,
);

interface HTMLElement {
  className: string;
  type: string;
  zIndex: number;
  children: Array<HTMLElement>;
  id: string;
  position: {
    x: number;
    y: number;
  };
}

// credit: https://slides.com/vineetkumar-4/functional-programming-ii#/3/0/2
// specifying the type is necessary because of the recursive structure.
const htmlEquality: Eq<HTMLElement> = eqStruct({
  className: eqString,
  type: eqString,
  zIndex: eqNumber,
  children: {
    equals: (xs: HTMLElement[], ys: HTMLElement[]) =>
      // combinator pattern: create new "things" from previously defined "things"
      getEq(htmlEquality).equals(xs, ys),
  },
  id: eqString,
  position: eqStruct({ x: eqNumber, y: eqNumber }),
});

const html1 = {
  className: '',
  type: 'div',
  zIndex: 1,
  children: [],
  id: 'html1',
  position: {
    x: 10,
    y: 20,
  },
};

const html2 = {
  className: '',
  type: 'div',
  zIndex: 1,
  children: [html1],
  id: 'html2',
  position: {
    x: 10,
    y: 20,
  },
};

assertStrictEquals(htmlEquality.equals(html1, html1), true);
assertStrictEquals(htmlEquality.equals(html1, html2), false);
assertStrictEquals(htmlEquality.equals(html2, html2), true);

const getId = (el: HTMLElement) => el.id;

// Contravariant Functor
const eqById = eqContramap(getId)(eqString);

assertStrictEquals(eqById.equals(html1, html2), false);
