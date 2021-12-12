import {
  delay,
  Task,
  of as taskOf,
  getRaceMonoid,
} from 'https://esm.sh/fp-ts/Task';
import { assertStrictEquals } from 'https://deno.land/std@0.111.0/testing/asserts.ts';

// Task represents an asynchronous computation that yields a value and never fails
// you can convert a task to a promise by invoking it

const raceMonoidTaskString = getRaceMonoid<string>();
const fa = delay(20)(taskOf('a')) as Task<string>;
const fb = delay(10)(taskOf('b')) as Task<string>;

// x is a Task
// const x = raceMonoidTaskString.concat(fa, fb);
// y is a Promise
// const y = x();

assertStrictEquals(await raceMonoidTaskString.concat(fa, fb)(), 'b');
