import {
  right,
  left,
  filterOrElse,
  flatten,
  fromPredicate as eitherFromPredicate,
  getOrElse,
  match as eitherMatch,
  foldMap,
  reduce as eitherReduce,
  reduceRight as eitherReduceRight,
  sequence,
  Either,
  chain,
  getApplicativeValidation,
  mapLeft,
  map as eitherMap,
  tryCatch,
  fromOption as eitherFromOption,
} from 'https://esm.sh/fp-ts/Either';
import {
  some,
  none,
  Applicative as optionApplicative,
} from 'https://esm.sh/fp-ts/Option';
import { sequenceT as applySequenceT } from 'https://esm.sh/fp-ts/Apply';
import {
  getSemigroup as nonEmptyArrayGetSemigroup,
  NonEmptyArray,
} from 'https://esm.sh/fp-ts/NonEmptyArray';
import { Monoid as stringMonoid } from 'https://esm.sh/fp-ts/string';
import { pipe } from 'https://esm.sh/fp-ts/function';
import {
  assertStrictEquals,
  assertEquals,
} from 'https://deno.land/std@0.111.0/testing/asserts.ts';

const greaterThanZero = (n: number): boolean => n > 0;

assertEquals(
  pipe(
    right(1),
    filterOrElse(greaterThanZero, () => 'error'),
  ),
  right(1),
);

assertEquals(
  pipe(
    right(-1),
    filterOrElse(greaterThanZero, () => 'error'),
  ),
  left('error'),
);

assertEquals(
  pipe(
    left('a'),
    filterOrElse(greaterThanZero, () => 'error'),
  ),
  left('a'),
);

assertEquals(flatten(right(right('a'))), right('a'));
assertEquals(flatten(right(left('e'))), left('e'));
assertEquals(flatten(left('e')), left('e'));

assertEquals(
  pipe(
    1,
    eitherFromPredicate(greaterThanZero, () => 'error'),
  ),
  right(1),
);
assertEquals(
  pipe(
    -1,
    eitherFromPredicate(greaterThanZero, () => 'error'),
  ),
  left('error'),
);

assertStrictEquals(
  pipe(
    right(1),
    getOrElse(() => 0),
  ),
  1,
);

assertStrictEquals(
  pipe(
    left('error'),
    getOrElse(() => 0),
  ),
  0,
);

const onLeft = (errors: Array<string>): string =>
  `Errors: ${errors.join(', ')}`;

const onRight = (value: number): string => `Ok: ${value}`;

assertStrictEquals(pipe(right(1), eitherMatch(onLeft, onRight)), 'Ok: 1');
assertStrictEquals(
  pipe(left(['error 1', 'error 2']), eitherMatch(onLeft, onRight)),
  'Errors: error 1, error 2',
);

const yell = (a: string) => `${a}!`;

assertStrictEquals(pipe(right('a'), foldMap(stringMonoid)(yell)), 'a!');

assertStrictEquals(
  pipe(left('e'), foldMap(stringMonoid)(yell)),
  stringMonoid.empty,
);

const prefixStartWith = 'prefix';
const concat = (a: string, b: string) => `${a}:${b}`;

assertStrictEquals(
  pipe(right('a'), eitherReduce(prefixStartWith, concat)),
  'prefix:a',
);

assertStrictEquals(
  pipe(left('e'), eitherReduce(prefixStartWith, concat)),
  'prefix',
);

const postfixStartWith = 'postfix';

assertStrictEquals(
  pipe(right('a'), eitherReduceRight(postfixStartWith, concat)),
  'a:postfix',
);

assertStrictEquals(
  pipe(left('e'), eitherReduceRight(postfixStartWith, concat)),
  'postfix',
);

assertEquals(
  pipe(right(some('a')), sequence(optionApplicative)),
  some(right('a')),
);

assertEquals(pipe(right(none), sequence(optionApplicative)), none);

const unsafeHead = <A>(as: ReadonlyArray<A>): A => {
  if (as.length > 0) {
    // eslint-disable-next-line fp-ts-strict/array-head
    return as[0];
  } else {
    throw new Error('empty array');
  }
};

const head = <A>(as: ReadonlyArray<A>): Either<Error, A> =>
  tryCatch(
    () => unsafeHead(as),
    (e) => (e instanceof Error ? e : new Error('unknown error')),
  );

assertEquals(head([]), left(new Error('empty array')));
assertEquals(head([1, 2, 3]), right(1));

assertEquals(
  pipe(
    some(1),
    eitherFromOption(() => 'error'),
  ),
  right(1),
);

assertEquals(
  pipe(
    none,
    eitherFromOption(() => 'error'),
  ),
  left('error'),
);

// from https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja
const minLength = (s: string): Either<string, string> =>
  s.length >= 6 ? right(s) : left('at least 6 characters');

const oneCapital = (s: string): Either<string, string> =>
  /[A-Z]/g.test(s) ? right(s) : left('at least one capital letter');

const oneNumber = (s: string): Either<string, string> =>
  /[0-9]/g.test(s) ? right(s) : left('at least one number');

const failFirstValidatePassword = (s: string): Either<string, string> =>
  pipe(minLength(s), chain(oneCapital), chain(oneNumber));

assertEquals(failFirstValidatePassword('ab'), left('at least 6 characters'));

const applicativeValidation = getApplicativeValidation(
  nonEmptyArrayGetSemigroup<string>(),
);

const lift =
  <E, A>(
    check: (a: A) => Either<E, A>,
  ): ((a: A) => Either<NonEmptyArray<E>, A>) =>
  (a) =>
    pipe(
      check(a),
      mapLeft((a) => [a]),
    );

const minLengthV = lift(minLength);
const oneCapitalV = lift(oneCapital);
const oneNumberV = lift(oneNumber);

const validatePassword = (s: string): Either<NonEmptyArray<string>, string> =>
  pipe(
    applySequenceT(applicativeValidation)(
      minLengthV(s),
      oneCapitalV(s),
      oneNumberV(s),
    ) as Either<NonEmptyArray<string>, string>,
    eitherMap(() => s),
  );

assertEquals(
  validatePassword('ab'),
  left([
    'at least 6 characters',
    'at least one capital letter',
    'at least one number',
  ]),
);

interface Person {
  name: string;
  age: number;
}

// Person constructor
const toPerson = ([name, age]: [string, number]): Person => ({
  name,
  age,
});

const validateName = (s: string): Either<NonEmptyArray<string>, string> =>
  s.length === 0 ? left(['Invalid name']) : right(s);

const validateAge = (s: string): Either<NonEmptyArray<string>, number> =>
  isNaN(+s) ? left(['Invalid age']) : right(+s);

const validateAge2 = (s: string): Either<NonEmptyArray<string>, number> =>
  isNaN(+s) || +s <= 1 ? left(['Too young']) : right(+s);

const validatePerson = (
  name: string,
  age: string,
): Either<NonEmptyArray<string>, Person> =>
  pipe(
    applySequenceT(applicativeValidation)(
      validateName(name),
      validateAge(age),
      validateAge2(age),
    ) as Either<NonEmptyArray<string>, [string, number]>,
    eitherMap(toPerson),
  );

assertEquals(validatePerson('', '1'), left(['Invalid name', 'Too young']));
assertEquals(validatePerson('a', '1'), left(['Too young']));
assertEquals(validatePerson('a', '2'), right({ name: 'a', age: 2 }));
