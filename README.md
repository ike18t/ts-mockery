[![Build Status](https://travis-ci.org/ike18t/ts-mockery.png?branch=master)](https://travis-ci.org/ike18t/ts-mockery)
[![npm version](https://badge.fury.io/js/ts-mockery.svg)](https://badge.fury.io/js/ts-mockery)

# ts-mockery
Mocking library for TypeScript. 

* The primary focus is on type-safety.  
* Spies are setup for mocked\ functions.

## how do I use this?
```typescript
import { Mock } from 'ts-mockery';

interface ObjectToNest {
  string: string;
  stringFunction: () => string;
}

class ObjectToMock {
  array: ObjectToNest[];
  nestedObject: ObjectToNest;
  string = ':-)';
  booleanFunction = () => true;
  functionWithParam = (par: string) => par;
  objectFunction = (): ObjectToNest => ({ string: 'hi', stringFunction: () => 'hi' });
  stringFunction = (buzz: string): string => buzz.toUpperCase();
  voidFunction = (i: number): void => undefined;
}

Mock.of<ObjectToMock>({ string: 'a different value' });
Mock.of<ObjectToMock>({ nestedObject: { stringFunction: () => 'type-safe partial of return type' });
```
Usage Examples: [mockery.spec.ts](lib/mockery.spec.ts)