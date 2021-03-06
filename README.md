# lazily-async

Implements common array methods in a lazy manner. Nothing more.

There's a synchronous version of this library as well, called lazily.
See https://github.com/isotropy/lazily

## Installation
```
npm install lazily-async
```

## Create a sequence
```javascript
import { Seq } from "lazily-async";

const seq = Seq.of([1, 2, 3])
for await (const i of seq) {
  console.log(i)
}
```

## It's lazy
Sequences are lazy. For example, in the following example only one map() action is performed irrespective of the length of the sequence.

```javascript
const seq = await Seq.of([1, 2, 3])
  .map(async x => x * 2)
  .first();
```

## toArray()
```javascript
await Seq.of([1, 2, 3])
  .toArray()
// [1, 2, 3]
```

## map(fn)
```javascript
await Seq.of([1, 2, 3])
  .map(async x => x * 2)
  .toArray()
// [2, 4, 6]
```

## flatMap(fn)
```javascript
await Seq.of([1, 2, 3])
  .flatMap(async x => [x*10, x*20])
  .toArray()
// [11, 21, 12, 22, 13, 23]
```

## filter(predicate)
```javascript
await Seq.of([1, 2, 3, 4])
  .filter(async x => x > 2)
  .toArray()
//[3, 4]
```

## exit(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .exit(async x => x > 3)
  .toArray()
// [1, 2, 3]
```

## exitAfter(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .exitAfter(async x => x > 3)
  .toArray()
// [1, 2, 3, 4]
```

## find(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .find(x => x * 10 === 30)
// 3
```

## reduce(fn)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .reduce(async (acc, x) => acc + x, 0)
// 15
```

## short-circuited reduce(fn, initialValue, stopPredicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .reduce(async (acc, x) => acc + x, 0, async acc => acc > 6)
// 10
```

## first()
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .first();
// 1
```

## first(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .first(async x => x > 3);
// 4
```

## last()
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .last();
// 5
```

## last(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .last(async x => x < 3);
// 2
```

## every(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .every(async x => x <= 5);
// true
```

## some(predicate)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .some(x => x === 3);
// true
```

## includes(item)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .includes(3);
// true
```

## concat(seq)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .concat(Seq.of([6, 7, 8)]))
  .toArray();
// [1, 2, 3, 4, 5, 6, 7, 8]
```

## reverse()
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .reverse()
  .toArray();
// [5, 4, 3, 2, 1]
```

## slice(begin, end)
```javascript
await Seq.of([1, 2, 3, 4, 5])
  .slice(2, 4)
  .toArray();
// [3, 4, 5]
```
