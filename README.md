# ts-mockery

[![npm version](https://badge.fury.io/js/ts-mockery.svg)](https://badge.fury.io/js/ts-mockery)
[![Node.js CI](https://github.com/ike18t/ts-mockery/actions/workflows/test.yml/badge.svg)](https://github.com/ike18t/ts-mockery/actions/workflows/test.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7a40cfa333b296dee4a2/test_coverage)](https://codeclimate.com/github/ike18t/ts-mockery/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/7a40cfa333b296dee4a2/maintainability)](https://codeclimate.com/github/ike18t/ts-mockery/maintainability)

**Simple, type-safe mocking library for TypeScript**

Create type-safe mocks with full IntelliSense support, nested object mocking, and automatic spy setup. Works seamlessly with Jest and Jasmine.

[📚 Interactive Examples on StackBlitz](https://stackblitz.com/edit/ts-mockery-examples?file=tests.ts)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Why ts-mockery?](#why-ts-mockery)
- [Core Features](#core-features)
  - [Creating Mocks](#creating-mocks)
  - [Updating Mocks](#updating-mocks)
  - [Promise Support](#promise-support)
  - [Static Method Mocking](#static-method-mocking)
    - [Mocking Imported Modules](#mocking-imported-modules)
  - [Utility Functions](#utility-functions)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Installation

```bash
npm install --save-dev ts-mockery
```

**Requirements:**

- TypeScript 4.5+
- Jest or Jasmine testing framework

## Quick Start

```typescript
import { Mock } from 'ts-mockery';

interface UserService {
  getUser(id: number): Promise<{ id: number; name: string; email: string }>;
  updateUser(user: { id: number; name: string }): void;
}

// Create a type-safe mock
const userServiceMock = Mock.of<UserService>({
  getUser: () => Promise.resolve({ id: 1, name: 'John' }), // email is optional
  updateUser: Mock.noop // Auto-spied function
});

// Use in tests
const result = await userServiceMock.getUser(1);
expect(result.id).toBe(1);
expect(userServiceMock.updateUser).toHaveBeenCalled();
```

## Why ts-mockery?

**🔒 Type Safety First**

- Full TypeScript support with IntelliSense
- Compile-time error detection
- Partial object support with `RecursivePartial<T>`

**🎯 Developer Experience**

- Intuitive API design
- Automatic spy setup for mocked functions
- Deep nested object mocking
- Promise-aware type handling

**🧪 Testing Framework Agnostic**

- Works with Jest and Jasmine
- Consistent API across frameworks
- Easy configuration and setup

**⚡ Advanced Features**

- Static method mocking
- Circular reference handling
- Proxy-based lazy mocking
- Comprehensive Promise support

## Core Features

### Creating Mocks

#### Basic Mocking

```typescript
interface ApiClient {
  baseUrl: string;
  timeout: number;
  request(path: string): Promise<any>;
}

// Create a partial mock - only specify what you need
const apiMock = Mock.of<ApiClient>({
  baseUrl: 'https://api.example.com',
  request: () => Promise.resolve({ data: 'test' })
});
// timeout is automatically undefined (optional)
```

#### Nested Object Mocking

```typescript
interface UserProfile {
  user: {
    id: number;
    profile: {
      name: string;
      email: string;
      preferences: {
        theme: string;
        notifications: boolean;
      };
    };
  };
}

const profileMock = Mock.of<UserProfile>({
  user: {
    id: 1,
    profile: {
      name: 'John',
      // email is optional
      preferences: {
        theme: 'dark'
        // notifications is optional
      }
    }
  }
});
```

#### Array Mocking

```typescript
interface DataService {
  users: Array<{ id: number; name: string; active: boolean }>;
  tags: string[];
}

const dataMock = Mock.of<DataService>({
  users: [
    { id: 1, name: 'John' }, // active is optional
    { id: 2, name: 'Jane', active: true }
  ],
  tags: ['typescript', 'testing']
});
```

### Updating Mocks

```typescript
interface Calculator {
  add(a: number, b: number): number;
  multiply(a: number, b: number): number;
  history: number[];
}

const calculator = Mock.of<Calculator>({
  add: (a, b) => a + b,
  history: []
});

// Update the mock with additional properties
Mock.extend(calculator).with({
  multiply: (a, b) => a * b,
  history: [1, 2, 3]
});
```

### Promise Support

ts-mockery provides full Promise support with type-safe partial resolved values:

```typescript
interface ApiService {
  fetchUser(id: number): Promise<{
    id: number;
    name: string;
    email: string;
    profile: { avatar: string };
  }>;
  updateUser(data: {
    name: string;
  }): Promise<{ success: boolean; message: string }>;
  deleteUser(id: number): Promise<void>;
}

const apiMock = Mock.of<ApiService>({
  // Promise resolved values support partial objects
  fetchUser: () =>
    Promise.resolve({
      id: 1,
      name: 'John'
      // email and profile are optional due to RecursivePartial
    }),

  // Return minimal required data
  updateUser: () => Promise.resolve({ success: true }),

  // Void promises work seamlessly
  deleteUser: () => Promise.resolve()
});
```

#### Nested Promise Support

```typescript
interface ComplexService {
  processData(): Promise<{
    result: {
      data: { id: number; value: string };
      metadata: { timestamp: Date; version: number };
    };
  }>;
}

const serviceMock = Mock.of<ComplexService>({
  processData: () =>
    Promise.resolve({
      result: {
        data: { id: 1, value: 'test' }
        // metadata is optional
      }
    })
});
```

### Static Method Mocking

```typescript
class FileUtils {
  static readFile(path: string): string {
    // Implementation
  }

  static writeFile(path: string, content: string): void {
    // Implementation
  }
}

// Mock static methods
Mock.staticMethod(FileUtils, 'readFile', () => 'mocked content');
Mock.staticMethod(FileUtils, 'writeFile', Mock.noop);

// Use in tests
const content = FileUtils.readFile('/path/to/file');
expect(content).toBe('mocked content');
```

#### Mocking Imported Modules

You can also mock functions from imported modules:

```typescript
// utils.ts
export const calculateTax = (amount: number) => amount * 0.1;
export const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

// In your test file
import * as Utils from './utils';
import { Mock } from 'ts-mockery';

// Mock specific functions from imported modules
Mock.staticMethod(Utils, 'calculateTax', () => 5.0);
Mock.staticMethod(Utils, 'formatCurrency', (amount) => `€${amount}`);

// Use in tests
const tax = Utils.calculateTax(100);
const formatted = Utils.formatCurrency(50);

expect(tax).toBe(5.0);
expect(formatted).toBe('€50');
expect(Utils.calculateTax).toHaveBeenCalledWith(100);
```

### Utility Functions

#### Mock.noop - No-op Functions

```typescript
interface EventHandler {
  onClick: () => void;
  onSubmit: (data: any) => void;
  onError: (error: Error) => void;
}

const handlerMock = Mock.of<EventHandler>({
  onClick: Mock.noop, // Automatically spied
  onSubmit: Mock.noop, // Automatically spied
  onError: Mock.noop // Automatically spied
});

// All functions are spied and can be tested
expect(handlerMock.onClick).toHaveBeenCalled();
```

#### Mock.all - Proxy-based Lazy Mocking

```typescript
interface LargeService {
  method1(): string;
  method2(): number;
  method3(): boolean;
  // ... many more methods
}

// Creates spies on-demand as methods are accessed
const serviceMock = Mock.all<LargeService>();

// Only creates spy when first accessed
const result = serviceMock.method1();
expect(serviceMock.method1).toHaveBeenCalled();
```

#### Mock.from - Handling Complex Objects

Use `Mock.from` when dealing with:

- Class inheritance hierarchies
- Objects with circular references (e.g., RxJS Observables)
- Complex prototype chains

```typescript
class BaseService {
  protected baseMethod(): void {}
}

class UserService extends BaseService {
  getUser(): User {}
}

// Mock.of might not handle inheritance correctly
const mock1 = Mock.of<UserService>(new BaseService()); // ❌ May have issues

// Mock.from handles inheritance and circular references
const mock2 = Mock.from<UserService>(new BaseService()); // ✅ Works correctly
```

**Circular Reference Handling:**

```typescript
import { of } from 'rxjs';

interface ReactiveService {
  data$: Observable<any>;
}

// Mock.of might throw RangeError with circular references
const mock1 = Mock.of<ReactiveService>({ data$: of(someValue) }); // ❌ May throw

// Mock.from handles circular references safely
const mock2 = Mock.from<ReactiveService>({ data$: of(someValue) }); // ✅ Works
```

## Configuration

**Set up ts-mockery in your test configuration:**

### Jest Setup

Create a setup file (e.g., `jest-setup.ts`):

```typescript
import { Mock } from 'ts-mockery';

Mock.configure('jest');
```

Add to your `jest.config.js`:

```javascript
module.exports = {
  setupFiles: ['<rootDir>/jest-setup.ts'],
  restoreMocks: true // Important: Required for static method mocking
};
```

### Jasmine Setup

Add to your Karma configuration or test setup:

```typescript
import { Mock } from 'ts-mockery';

Mock.configure('jasmine');
```

### Custom Spy Adapter

```typescript
import { Mock, SpyAdapter } from 'ts-mockery';

const customAdapter: SpyAdapter = {
  getSpy: (property: string) => /* custom spy implementation */,
  spyAndCallFake: (object, key, stub) => /* custom spy setup */,
  spyAndCallThrough: (object, key) => /* custom spy setup */
};

Mock.configure(customAdapter);
```

## API Reference

### Mock.of<T>(stubs?: RecursivePartial<T>): T

Creates a mock object with optional property stubs.

### Mock.extend<T>(object: T): ExtendedWith<T>

Returns an object with a `.with()` method for updating mocks.

### Mock.from<T>(object: RecursivePartial<T>): T

Creates a mock handling complex objects and circular references.

### Mock.staticMethod<T, K>(object: T, key: K, stub: Function): void

Mocks a static method on a class or function from an imported module.

### Mock.noop: () => any

Returns a no-op function that is automatically spied.

### Mock.all<T>(): T

Creates a proxy-based mock that generates spies on-demand.

### Mock.configure(adapter: 'jest' | 'jasmine' | SpyAdapter): void

Configures the underlying spy framework.

## Advanced Usage

### Working with Generic Types

```typescript
interface Repository<T> {
  find(id: string): Promise<T>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const userRepo = Mock.of<Repository<User>>({
  find: () => Promise.resolve({ id: '1', name: 'John' }), // email optional
  save: Mock.noop,
  delete: () => Promise.resolve(true)
});
```

### Conditional Mocking

```typescript
interface ConfigService {
  isFeatureEnabled(feature: string): boolean;
  getConfig(): { env: string; debug: boolean; apiUrl: string };
}

const configMock = Mock.of<ConfigService>({
  isFeatureEnabled: (feature) => feature === 'newFeature',
  getConfig: () => ({ env: 'test', debug: true }) // apiUrl optional
});
```

### Method Chaining

```typescript
interface FluentBuilder {
  withName(name: string): FluentBuilder;
  withAge(age: number): FluentBuilder;
  build(): { name: string; age: number };
}

const builderMock = Mock.of<FluentBuilder>({
  withName: function (name) {
    return this;
  },
  withAge: function (age) {
    return this;
  },
  build: () => ({ name: 'test', age: 25 })
});
```

## Troubleshooting

### Common Issues

**Circular Reference Errors**

```typescript
// ❌ May throw RangeError
const mock = Mock.of<ServiceWithObservables>({ data$: of(value) });

// ✅ Use Mock.from instead
const mock = Mock.from<ServiceWithObservables>({ data$: of(value) });
```

**Static Method Mocking Not Working**

- Ensure `restoreMocks: true` in Jest configuration
- Make sure Mock.configure() is called before tests
- Static method mocking requires proper spy framework setup

**Module Import Mocking Issues**

- Import modules using `import * as Module from './module'` syntax for best results
- Ensure the imported module is not tree-shaken or optimized away
- Module mocking works best with functions exported at the module level

**Promise Type Issues**

```typescript
// ✅ Promise resolved values automatically support partial objects
const mock = Mock.of<ApiService>({
  getUser: () => Promise.resolve({ id: 1 }) // name, email, etc. are optional
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/ike18t/ts-mockery.git
cd ts-mockery
npm install
npm test
```

### Running Tests

```bash
npm run test:jest    # Run Jest tests
npm run test:jasmine # Run Jasmine tests
npm test             # Run all tests
```

---

**Made with ❤️ by the TypeScript community**

For more examples and advanced usage, visit our [StackBlitz Examples](https://stackblitz.com/edit/ts-mockery-examples?file=tests.ts).
