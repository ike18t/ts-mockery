[![npm version](https://badge.fury.io/js/ts-mockery.svg)](https://badge.fury.io/js/ts-mockery)
[![Build Status](https://travis-ci.org/ike18t/ts-mockery.png?branch=master)](https://travis-ci.org/ike18t/ts-mockery)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7a40cfa333b296dee4a2/test_coverage)](https://codeclimate.com/github/ike18t/ts-mockery/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/7a40cfa333b296dee4a2/maintainability)](https://codeclimate.com/github/ike18t/ts-mockery/maintainability)

## ts-mockery

Simple type-safe mocking library for TypeScript.

[StackBlitz Examples](https://stackblitz.com/edit/ts-mockery-examples?file=tests.ts)

**NOTE:** As of 7/14/18 StackBlitz not up to version 2.8 yet.  What this means is that the tests pass because an appropriate version of typescript is installed under dependencies but the editor is still on an older version of typescript so some of the newer features of typescript is causing awkward feedback in the editor.

## Why use this?

* Usable with either Jasmine or Jest.
* The primary focus is type-safety.
* Spies are setup for mocked functions.
* Nested objects and arrays can be mocked with type-safety

## How do I use this?

#### To create a Mock:

```typescript
import { Mock } from 'ts-mockery';

interface ObjectToNest {
  anotherStringFunction: () => string;
  unusedFunction: () => void;
}

class ObjectToMock {
  nestedObject: ObjectToNest;
  string = ':-)';
  stringFunction = (buzz: string): string => buzz.toUpperCase();
}

Mock.of<ObjectToMock>({ string: 'not :-)' });
Mock.of<ObjectToMock>({ string: 'still not :-)', stringFunction: () => 'type-safe partial of return type' });
Mock.of<ObjectToMock>({ nestedObject: { anotherStringFunction: () => 'type-safe partial of return type' } });

```

#### To update a Mock:

```typescript
import { Mock } from 'ts-mockery';

interface ObjectToNest {
  anotherStringFunction: () => string;
  unusedFunction: () => void;
}

class ObjectToMock {
  nestedObject: ObjectToNest;
  string = ':-)';
  stringFunction = (buzz: string): string => buzz.toUpperCase();
}

const mock = Mock.of<ObjectToMock>({ string: 'not :-)' });
Mock.extend(mock).with({ string: 'still not :-)', stringFunction: () => 'type-safe partial of return type' });

```

More usage examples can be found @ [https://stackblitz.com/edit/ts-mockery-examples?file=tests.ts](https://stackblitz.com/edit/ts-mockery-examples?file=tests.ts)

**NOTE:** As of 7/14/18 StackBlitz not up to version 2.8 yet.  What this means is that the tests pass because an appropriate version of typescript is installed under dependencies but the editor is still on an older version of typescript so some of the newer features of typescript is causing awkward feedback in the editor.

#### To mock a static function:

```typescript
import { Mock } from 'ts-mockery';

class ObjectToMock {
  static staticFunction: () => 'hi';
}

Mock.static(ObjectToMock, 'staticFunction', () => 'not hi');

```

## How do I configure this?

Create a test setup file to be included in your Jest or Jasmine config.

```typescript
import { Mockery } from './lib/mockery';

// The argument to configure can be either jest, jasmine, noop, or an object that implements the exported SpyAdapater interface
Mockery.configure('jest');
```

The above can be added directly to your karma test shim if you'd like.

To configure in Jest add the mockery configuration into the jest config with the key "setupFiles" like so:

```
  setupFiles: ['./jest-setup.ts'],
```

**It is important that this file is included before tests run.**
