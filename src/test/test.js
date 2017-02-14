import "babel-polyfill";
import should from "should";
import sourceMapSupport from 'source-map-support';

import { Seq } from "../lazily-async";

sourceMapSupport.install();

async function toArray(seq) {
  const results = [];
  for await (const i of seq) {
    results.push(i);
  }
  return results;
}

describe("lazily-async", async () => {
  it(`should return a sequence`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
    const results = await toArray(seq);
    results.should.deepEqual([1, 2, 3, 4, 5])
  })

  it(`should map() results`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .map(async x => x * 2)
    const results = await toArray(seq);
    results.should.deepEqual([2, 4, 6, 8, 10])
  })

  it(`should filter() results`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .filter(async x => x > 2)
    const results = await toArray(seq);
    results.should.deepEqual([3, 4, 5])
  })

  it(`should exit() early`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .exit(async x => x > 3)
    const results = await toArray(seq);
    results.should.deepEqual([1, 2, 3])
  })

  it(`exit() should not interrupt valid results`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .map(async x => x * 2)
      .exit(async x => x > 4)
      .map(async x => x * 10);
      const results = await toArray(seq);
      results.should.deepEqual([20, 40])
  })

  it(`find()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .find(async x => x * 10 === 30)

    result.should.equal(3);
  })

  it(`reduce()`, async () => {
    const result =  await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .reduce(async (acc, x) => acc + x, 0)
    result.should.equal(15);
  })

  it(`first()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .first();
    result.should.equal(1);
  })

  it(`first(predicate)`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .first(async x => x > 3);
    result.should.equal(4);
  })

  it(`last()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .last();
    result.should.equal(5);
  })

  it(`last(predicate)`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .last(async x => x < 3);
    result.should.equal(2);
  })

  it(`every()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .every(async x => x <= 5);
    result.should.be.ok();
  })

  it(`every() negative`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .every(async x => x < 5);
    result.should.not.be.ok();
  })

  it(`some()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .some(async x => x === 3);
    result.should.be.ok();
  })

  it(`some() negative`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .every(async x => x === 10);
    result.should.not.be.ok();
  })

  it(`toArray()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .toArray();
    result.should.deepEqual([1, 2, 3, 4, 5])
  })

  it(`toPromises()`, async () => {
    const promises = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .toPromises();
    const result = await toArray(promises);
    result.should.deepEqual([1, 2, 3, 4, 5])
  })

  it(`includes()`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .includes(3);
    result.should.be.ok();
  })

  it(`includes() negative`, async () => {
    const result = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .includes(10);
    result.should.not.be.ok();
  })

  it(`concat()`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .concat(Seq.of([Promise.resolve(6), Promise.resolve(7), Promise.resolve(8)]));
    const results = await toArray(seq);
    results.should.deepEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  })

  it(`reverse()`, async () => {
    const seq = Seq.of([Promise.resolve(1), 2, 3]).reverse();
    const results = await toArray(seq);
    results.should.deepEqual([3, 2, 1])
  })

  it(`slice(begin)`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .slice(1);
    const results = await toArray(seq);
    results.should.deepEqual([2, 3, 4, 5])
  })

  it(`slice(begin, end)`, async () => {
    const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
      .slice(1, 4);
    const results = await toArray(seq);
    results.should.deepEqual([2, 3, 4])
  })
})
