[![npm version](https://badge.fury.io/js/ts-mockery.svg)](https://badge.fury.io/js/ts-mockery)
[![Build Status](https://travis-ci.org/ike18t/ts-mockery.png?branch=master)](https://travis-ci.org/ike18t/ts-mockery)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7a40cfa333b296dee4a2/test_coverage)](https://codeclimate.com/github/ike18t/ts-mockery/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/7a40cfa333b296dee4a2/maintainability)](https://codeclimate.com/github/ike18t/ts-mockery/maintainability)

## ts-mockery

Simple type-safe mocking library for TypeScript.

[StackBlitz Examples](https://stackblitz.com/edit/ts-mockery-examples?file=tests.ts)


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


#### To mock a static method:

```typescript
import { Mock } from 'ts-mockery';

class ObjectToMock {
  static static: () => 'hi';
}

Mock.staticMethod(ObjectToMock, 'static', () => 'not hi');

```

#### Mock.from:
We noticed issues when we gave instantiated base class objects to `Mock.of`.  The reason being that the type checker does not look at the prototype.

```typescript
import { Mock } from 'ts-mockery';
Mock.of<SomeClass>(new BaseOfSomeClass());
```
now with `Mock.from`:

```typescript
import { Mock } from 'ts-mockery';
Mock.from<SomeClass>(new BaseOfSomeClass());
```

Also when setting mocked property to an observable there is a circular reference that would throw an `RangeError {}`

```typescript
import { Mock } from 'ts-mockery';
import { of } from 'rxjs';
Mock.of<SomeClass>({ something$: of(someValue) });
```

now with `Mock.from`:

```typescript
import { Mock } from 'ts-mockery';
import { of } from 'rxjs';
Mock.from<SomeClass>({ something$: of(someValue) });
```

#### To mock a function you do not care about:

We got you covered, ```Mock.noop``` will return you a spied on function.

```typescript
import { Mock } from 'ts-mockery';

class ObjectToMock {
  doNotCare: () => 'hi';
}

const mock = Mock.of<ObjectToMock>({ doNotCare: Mock.noop });
const result = mock.doNotCare();

expect(mock.doNotCare).toHaveBeenCalled();
expect(result).not.toBe('hi');
```

#### To mock an object you do not care about:

With Mock.all it will use a proxy to create spies as on demand.

```typescript
import { Mock } from 'ts-mockery';

class ObjectToMock {
  doNotCare: () => 'hi';
}

const mock = Mock.all<ObjectToMock>();
const result = mock.doNotCare();

expect(mock.doNotCare).toHaveBeenCalled();
expect(result).not.toBe('hi');
```


## How do I configure this?

Create a test setup file to be included in your Jest or Jasmine config.

```typescript
import { Mock } from 'ts-mockery';

// The argument to configure can be either jest, jasmine, noop, or an object that implements the exported SpyAdapater interface
Mock.configure('jest');
```

The above can be added directly to your karma test shim if you'd like.

To configure in Jest add the mockery configuration into the jest config with the key "setupFiles" like so:

```
  setupFiles: ['./jest-setup.ts'],
```

**It is important that this file is included before tests run.**

**Also Important**:

Jest for whatever reason does not reset mocks between tests by default.  This causes problems with the mocking of static methods.  If you intend to use static method mocking you can add "restoreMocks: true" to your jest config and all will be right in the world.
