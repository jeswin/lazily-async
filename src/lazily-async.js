/* @flow */
type PredicateType<T> = (
  val: T,
  i?: number,
  seq?: SequenceFnType<T>
) => boolean;

type SequenceFnType<T> = () => AsyncGenerator<T, void, void>;

export class Seq<T> {
  seq: SequenceFnType<T>;

  static of(list) {
    return new Seq(sequence(list));
  }

  constructor(seq: SequenceFnType<T>) {
    this.seq = seq;
  }

  async *[Symbol.asyncIterator]() {
    for await (const i of this.seq()) {
      yield i;
    }
  }

  concat(seq: Seq<T>): Seq<T> {
    return new Seq(concat(this.seq, seq.seq));
  }

  async every(fn: PredicateType<T>): Promise<boolean> {
    return await every(this.seq, fn);
  }

  exit(fn: PredicateType<T>, result?: any): Seq<T> {
    return new Seq(exit(this.seq, fn, result));
  }

  exitAfter(fn: PredicateType<T>, result?: any): Seq<T> {
    return new Seq(exitAfter(this.seq, fn, result));
  }

  filter(fn: PredicateType<T>): Seq<T> {
    return new Seq(filter(this.seq, fn));
  }

  async find(fn: PredicateType<T>): Promise<?T> {
    return await find(this.seq, fn);
  }

  async first(predicate: PredicateType<T>): Promise<?T> {
    return await first(this.seq, predicate);
  }

  async includes(item: T): Promise<boolean> {
    return await includes(this.seq, item);
  }

  async last(predicate: PredicateType<T>): Promise<?T> {
    return await last(this.seq, predicate);
  }

  map<TOut>(
    fn: (val: T, i: number, seq: SequenceFnType<T>) => TOut
  ): Seq<TOut> {
    return new Seq(map(this.seq, fn));
  }

  async reduce<TAcc>(
    fn: (acc: TAcc, item: T, i?: number, seq?: SequenceFnType<T>) => TAcc,
    initialValue: TAcc,
    fnShortCircuit?: (
      acc: TAcc,
      item?: T,
      i?: number,
      seq?: SequenceFnType<T>
    ) => boolean
  ): Promise<TAcc> {
    return await reduce(this.seq, fn, initialValue, fnShortCircuit);
  }

  reverse(): Seq<T> {
    return new Seq(reverse(this.seq));
  }

  slice(begin: number, end?: number): Seq<T> {
    return new Seq(slice(this.seq, begin, end));
  }

  async some(fn: PredicateType<T>): Promise<boolean> {
    return await some(this.seq, fn);
  }

  sort(fn: (a: T, b: T) => number): Seq<T> {
    return new Seq(sort(this.seq, fn));
  }

  async toArray(): Promise<Array<T>> {
    return await toArray(this.seq);
  }
}

export function sequence<T>(list: AsyncIterable<T>): SequenceFnType<T> {
  return async function* gen() {
    for await (const item of list) {
      yield item;
    }
  };
}

export function concat<T>(
  seq: SequenceFnType<T>,
  newSeq: SequenceFnType<T>
): SequenceFnType<T> {
  return async function*() {
    for await (const i of seq()) {
      yield i;
    }
    for await (const j of newSeq()) {
      yield j;
    }
  };
}

export async function every<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): Promise<boolean> {
  let i = 0;
  for await (const item of seq()) {
    if (!await fn(item, i, seq)) {
      return false;
    }
    i++;
  }
  return true;
}

export function exit<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>,
  result?: any
): SequenceFnType<T> {
  return async function*() {
    let i = 0;
    for await (const item of seq()) {
      if (await fn(item, i, seq)) {
        return result;
      }
      yield item;
      i++;
    }
  };
}

export function exitAfter<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>,
  result?: any
): SequenceFnType<T> {
  return async function*() {
    let i = 0;
    for await (const item of seq()) {
      if (await fn(item, i, seq)) {
        yield item;
        return result;
      }
      yield item;
      i++;
    }
  };
}

export async function find<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): Promise<?T> {
  let i = 0;
  for await (const item of seq()) {
    if (await fn(item, i, seq)) {
      return item;
    }
    i++;
  }
}

export function filter<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): SequenceFnType<T> {
  return async function*() {
    let i = 0;
    for await (const item of seq()) {
      if (await fn(item, i, seq)) {
        yield item;
      }
      i++;
    }
  };
}

export async function first<T>(
  _seq: SequenceFnType<T>,
  predicate: PredicateType<T>
): Promise<?T> {
  const seq = predicate ? filter(_seq, predicate) : _seq;
  for await (const item of seq()) {
    return item;
  }
}

export async function includes<T>(
  seq: SequenceFnType<T>,
  what: T
): Promise<boolean> {
  return await some(seq, item => item === what);
}

export async function last<T>(
  _seq: SequenceFnType<T>,
  predicate: PredicateType<T>
): Promise<?T> {
  const seq = predicate ? filter(_seq, predicate) : _seq;

  let prev;
  for await (const item of seq()) {
    prev = item;
  }
  return prev;
}

export function map<T, TOut>(
  seq: SequenceFnType<T>,
  fn: (val: T, i: number, seq: SequenceFnType<T>) => TOut
): SequenceFnType<TOut> {
  return async function*() {
    let i = 0;
    for await (const item of seq()) {
      yield await fn(item, i, seq);
      i++;
    }
  };
}

export async function reduce<T, TAcc>(
  seq: SequenceFnType<T>,
  fn: (acc: TAcc, item: T, i?: number, seq?: SequenceFnType<T>) => TAcc,
  initialValue: TAcc,
  fnShortCircuit?: (
    acc: TAcc,
    item?: T,
    i?: number,
    seq?: SequenceFnType<T>
  ) => boolean
): Promise<TAcc> {
  let acc = initialValue;
  let i = 0;
  for await (const item of seq()) {
    acc = await fn(acc, item, i, seq);
    if (fnShortCircuit && (await fnShortCircuit(acc, item, i, seq))) {
      return acc;
    }
    i++;
  }
  return acc;
}

export function reverse<T>(seq: SequenceFnType<T>): SequenceFnType<T> {
  return async function*() {
    const all = (await toArray(seq)).reverse();
    for (const item of all) {
      yield item;
    }
  };
}

export function slice<T>(
  seq: SequenceFnType<T>,
  begin: number,
  end?: number
): SequenceFnType<T> {
  return async function*() {
    let i = 0;
    for await (const item of seq()) {
      if (i >= begin && (!end || i < end)) {
        yield item;
      }
      i++;
      if (i === end) {
        return;
      }
    }
  };
}

export async function some<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): Promise<boolean> {
  let i = 0;
  for await (const item of seq()) {
    if (await fn(item, i, seq)) {
      return true;
    }
    i++;
  }
  return false;
}


export function sort<T>(
  seq: SequenceFnType<T>,
  fn: (a: T, b: T) => number
): SequenceFnType<T> {
  return async function*() {
    const all = (await toArray(seq)).sort(fn);
    for (const item of all) {
      yield item;
    }
  };
}

export async function toArray<T>(seq: SequenceFnType<T>): Promise<Array<T>> {
  const results = [];
  for await (const item of seq()) {
    results.push(item);
  }
  return results;
}
