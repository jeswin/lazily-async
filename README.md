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

const seq = Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
for await (const i of seq) {
  console.log(i)
}
```

## It's lazy
Sequences are lazy. For example, the following example only one map() action is performed irrespective of the length of the sequence.
```javascript
const seq = await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  .map(x => x * 2)
  .first();
```

## toArray()
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  .toArray()
// [1, 2, 3]
```

## toPromises()
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  .toPromises()
//Returns a bunch of Promises
Promise.all(promises, (results) => console.log(results));
// [1, 2, 3]
```

## map(fn)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  .map(x => x * 2)
  .toArray()
// [2, 4, 6]
```

## filter(predicate)
```javascript
await Seq.of([Promise.resolve(1), 2, 3, 4])
  .filter(x => x > 2)
  .toArray()
//[3, 4]
```

## exit(predicate)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .exit(x => x > 3)
  .toArray()
// [1, 2, 3]
```

## exit(predicate) in the middle
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .map(x => x * 2)
  .exit(x => x > 4)
  .map(x => x * 10)
  .toArray();
// [20, 40]
```

## find(predicate)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .find(x => x * 10 === 30)
// 3
```

## reduce(fn)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .reduce((acc, x) => acc + x, 0)
// 15
```

## first()
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .first();
// 1
```

## last()
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .last();
// 5
```

## every(predicate)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .every(x => x <= 5);
// true
```

## some(predicate)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .some(x => x === 3);
// true
```

## includes(item)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .includes(3);
// true
```

## concat(seq)
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .concat(Seq.of([Promise.resolve(6), Promise.resolve(7), Promise.resolve(8)]))
  .toArray();
// [1, 2, 3, 4, 5, 6, 7, 8]
```

## reverse()
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .reverse()
  .toArray();
// [5, 4, 3, 2, 1]
```

## slice(begin, end)()
```javascript
await Seq.of([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)])
  .slice(2, 4)
  .toArray();
// [3, 4, 5]
```
