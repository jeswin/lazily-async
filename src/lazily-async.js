export class Seq {
  static of(list) {
    return new Seq(sequence(list));
  }

  constructor(seq) {
    this.seq = seq;
  }

  *[Symbol.iterator]() {
    for (const i of this.seq()) {
      yield i;
    }
  }

  async *[Symbol.asyncIterator]() {
    for await (const i of this.seq()) {
      yield i;
    }
  }

  concat(seq) {
    return new Seq(concat(this.seq, seq.seq));
  }

  async every(fn) {
    return await every(this.seq, fn)
  }

  exit(fn, result) {
    return new Seq(exit(this.seq, fn, result));
  }

  exitAfter(fn, result) {
    return new Seq(exit(this.seq, fn, result));
  }

  filter(fn) {
    return new Seq(filter(this.seq, fn));
  }

  async find(fn) {
    return await find(this.seq, fn);
  }

  async first(predicate) {
    return await first(this.seq, predicate);
  }

  async includes(item) {
    return await includes(this.seq, item);
  }

  async last(predicate) {
    return await last(this.seq, predicate);
  }

  map(fn) {
    return new Seq(map(this.seq, fn));
  }

  async reduce(fn, initialValue) {
    return await reduce(this.seq, fn, initialValue)
  }

  slice(begin, end) {
    return new Seq(slice(this.seq, begin, end));
  }

  async some(fn) {
    return await some(this.seq, fn)
  }

  reverse() {
    return new Seq(reverse(this.seq));
  }

  async toArray() {
    return await toArray(this.seq);
  }

  toPromises() {
    return toPromises(this.seq);
  }
}

export function sequence(list) {
  return function* gen() {
    for (const item of list) {
      yield item;
    }
  };
}


export function concat(seq, newSeq) {
  return function*() {
    for (const i of seq()) {
      yield i;
    }
    for (const j of newSeq()) {
      yield j;
    }
  }
}

export async function every(seq, fn) {
  for await (const item of seq()) {
    if (!await fn(item)) {
      return false;
    }
  }
  return true;
}

export function exit(seq, fn, result) {
  return async function*() {
    for await (const item of seq()) {
      if (await fn(item)) {
        return
      }
      yield item;
    }
  };
}

export function exitAfter(seq, fn, result) {
  return async function*() {
    for await (const item of seq()) {
      if (await fn(item)) {
        yield item;
        return
      }
      yield item;
    }
  };
}

export async function find(seq, fn) {
  for await (const item of seq()) {
    if (await fn(item)) {
      return item;
    }
  }
}

export function filter(seq, fn) {
  return async function*() {
    for await (const item of seq()) {
      if (await fn(item)) {
        yield item;
      }
    }
  }
}

export async function first(_seq, predicate) {
  const seq = predicate ? filter(_seq, predicate) : _seq;
  for await (const item of seq()) {
    return item;
  }
}

export async function includes(seq, what) {
  return await some(seq, item => item === what);
}

export async function last(_seq, predicate) {
  const seq = predicate ? filter(_seq, predicate) : _seq;

  let prev;
  for await (const item of seq()) {
    prev = item;
  }
  return prev;
}

export function map(seq, fn) {
  return async function*() {
    for await (const item of seq()) {
      yield await fn(item);
    }
  }
}

export async function reduce(seq, fn, initialValue) {
  let acc = initialValue;
  for await (const item of seq()) {
    acc = await fn(acc, item);
  }
  return acc;
}

export function reverse(seq) {
  return async function*() {
    const all = toPromises(seq).reverse();
    for (const item of all) {
      yield item;
    }
  }
}

export function slice(seq, begin, end) {
  return async function*() {
    let i = 0;
    for (const item of seq()) {
      if (i >= begin && (!end || i < end)) {
        yield item;
      }
      i++;
      if (i === end) {
        return;
      }
    }
  }
}

export async function some(seq, fn) {
  for await (const item of seq()) {
    if (await fn(item)) {
      return true;
    }
  }
  return false;
}

export async function toArray(seq) {
  const results = [];
  for await (const item of seq()) {
    results.push(item);
  }
  return results;
}

export function toPromises(seq) {
  const results = [];
  for (const item of seq()) {
    results.push(item);
  }
  return results;
}
