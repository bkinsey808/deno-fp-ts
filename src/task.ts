import { delay, Task, of, getRaceMonoid } from 'https://esm.sh/fp-ts/Task';
import { assertStrictEquals } from 'https://deno.land/std@0.111.0/testing/asserts.ts';

const monoidTaskString = getRaceMonoid<string>();
const fa = delay(20)(of('a')) as Task<string>;
const fb = delay(10)(of('b')) as Task<string>;
assertStrictEquals(await monoidTaskString.concat(fa, fb)(), 'b');
