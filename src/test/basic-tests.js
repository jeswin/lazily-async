import { Seq } from "../lazily-async";

export default function run() {

  async function toArray(seq) {
    const results = [];
    for await (const i of seq) {
      results.push(i);
    }
    return results;
  }

  describe("lazily-async", async () => {
    function getSequence() {
      function makePromise(val) {
        return new Promise((res, rej) => {
          setTimeout(() => res(val), parseInt(Math.random() * 10));
        });
      }
      return Seq.of([
        makePromise(1),
        makePromise(2),
        makePromise(3),
        makePromise(4),
        makePromise(5)
      ]);
    }

    it(`Seq(list) should return a sequence`, async () => {
      const seq = getSequence();
      const results = await toArray(seq);
      results.should.deepEqual([1, 2, 3, 4, 5]);
    });

    it(`Seq(seq) should return a sequence`, async () => {
      const _seq = getSequence();
      const seq = Seq.of(_seq);
      const results = await toArray(seq);
      results.should.deepEqual([1, 2, 3, 4, 5]);
    });

    /* 
    TODO:
      Well.... research this some more.
      should asyncIterator also be an iterator?
      Right now, it isn't. 
  */
    // it(`iteration`, async () => {
    //   const seq = getSequence();
    //   const results = [];
    //   for (const i of seq) {
    //     results.push(await i);
    //   }
    //   results.should.deepEqual([1, 2, 3, 4, 5]);
    // });

    it(`async iteration`, async () => {
      const seq = getSequence();
      const results = [];
      for await (const i of seq) {
        results.push(i);
      }
      results.should.deepEqual([1, 2, 3, 4, 5]);
    });

    it(`async iteration on async generator`, async () => {
      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
        yield 5;
      }
      const seq = Seq.of(gen());
      const results = [];
      for await (const i of seq) {
        results.push(i);
      }
      results.should.deepEqual([1, 2, 3, 4, 5]);
    });

    it(`concat()`, async () => {
      const seq = getSequence().concat(
        Seq.of([Promise.resolve(6), Promise.resolve(7), Promise.resolve(8)])
      );
      const results = await toArray(seq);
      results.should.deepEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it(`every()`, async () => {
      const result = await getSequence().every(async x => x <= 5);
      result.should.be.ok();
    });

    it(`every() negative`, async () => {
      const result = await getSequence().every(async x => x < 5);
      result.should.not.be.ok();
    });

    it(`exit() early`, async () => {
      const seq = getSequence().exit(async x => x > 3);
      const results = await toArray(seq);
      results.should.deepEqual([1, 2, 3]);
    });

    it(`exitAfter()`, async () => {
      const seq = getSequence().exitAfter(async x => x > 3);
      const results = await toArray(seq);
      results.should.deepEqual([1, 2, 3, 4]);
    });

    it(`exit() should not interrupt valid results`, async () => {
      const seq = getSequence()
        .map(async x => x * 2)
        .exit(async x => x > 4)
        .map(async x => x * 10);
      const results = await toArray(seq);
      results.should.deepEqual([20, 40]);
    });

    it(`filter()`, async () => {
      const seq = getSequence().filter(async x => x > 2);
      const results = await toArray(seq);
      results.should.deepEqual([3, 4, 5]);
    });

    it(`find()`, async () => {
      const result = await getSequence().find(async x => x * 10 === 30);

      result.should.equal(3);
    });

    it(`first()`, async () => {
      const result = await getSequence().first();
      result.should.equal(1);
    });

    it(`first(predicate)`, async () => {
      const result = await getSequence().first(async x => x > 3);
      result.should.equal(4);
    });

    it(`flatMap()`, async () => {
      const seq = getSequence().flatMap(async x => Seq.of([x + 10, x + 20]));
      const results = await toArray(seq);
      results.should.deepEqual([11, 21, 12, 22, 13, 23, 14, 24, 15, 25]);
    });

    it(`flatMap() with an array as child`, async () => {
      const seq = getSequence().flatMap(async x => [x + 10, x + 20]);
      const results = await toArray(seq);
      results.should.deepEqual([11, 21, 12, 22, 13, 23, 14, 24, 15, 25]);
    });

    it(`includes()`, async () => {
      const result = await getSequence().includes(3);
      result.should.be.ok();
    });

    it(`includes() negative`, async () => {
      const result = await getSequence().includes(10);
      result.should.not.be.ok();
    });

    it(`last()`, async () => {
      const result = await getSequence().last();
      result.should.equal(5);
    });

    it(`last(predicate)`, async () => {
      const result = await getSequence().last(async x => x < 3);
      result.should.equal(2);
    });

    it(`map()`, async () => {
      const seq = getSequence().map(async x => x * 2);
      const results = await toArray(seq);
      results.should.deepEqual([2, 4, 6, 8, 10]);
    });

    it(`reduce()`, async () => {
      const result = await getSequence().reduce(async (acc, x) => acc + x, 0);
      result.should.equal(15);
    });

    it(`reduce() short-circuited`, async () => {
      const result = await getSequence().reduce(
        async (acc, x) => acc + x,
        0,
        async acc => acc > 6
      );
      result.should.equal(10);
    });

    it(`reverse()`, async () => {
      const seq = Seq.of([Promise.resolve(1), 2, 3]).reverse();
      const results = await toArray(seq);
      results.should.deepEqual([3, 2, 1]);
    });

    it(`slice(begin)`, async () => {
      const seq = getSequence().slice(1);
      const results = await toArray(seq);
      results.should.deepEqual([2, 3, 4, 5]);
    });

    it(`slice(begin, end)`, async () => {
      const seq = getSequence().slice(1, 4);
      const results = await toArray(seq);
      results.should.deepEqual([2, 3, 4]);
    });

    it(`some()`, async () => {
      const result = await getSequence().some(async x => x === 3);
      result.should.be.ok();
    });

    it(`some() negative`, async () => {
      const result = await getSequence().every(async x => x === 10);
      result.should.not.be.ok();
    });

    it(`sort()`, async () => {
      const seq = Seq.of([Promise.resolve(3), 1, 2]).sort((a, b) => a - b);
      const results = await toArray(seq);
      results.should.deepEqual([1, 2, 3]);
    });

    it(`toArray()`, async () => {
      const result = await getSequence().toArray();
      result.should.deepEqual([1, 2, 3, 4, 5]);
    });
  });
}
