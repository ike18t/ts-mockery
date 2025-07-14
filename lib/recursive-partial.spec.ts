import { expectTypeOf } from 'expect-type';
import { RecursivePartial } from './mockery';

const typeTest = () => expect(true).toBe(true);

interface SimpleObject {
  name: string;
  age: number;
  isActive: boolean;
}

interface NestedObject {
  user: {
    id: number;
    profile: {
      name: string;
      email: string;
    };
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

interface WithMethods {
  getName(): string;
  setAge(age: number): void;
  calculateTotal(a: number, b: number): number;
  getUser(): { id: number; name: string };
}

interface WithArrays {
  tags: string[];
  users: Array<{ id: number; name: string }>;
  matrix: number[][];
}

interface WithOptionalFields {
  required: string;
  optional?: number;
  nested?: {
    value: string;
    optional?: boolean;
  };
}

interface ComplexNested {
  service: {
    api: {
      get(path: string): Promise<unknown>;
      post(path: string, data: unknown): Promise<unknown>;
    };
    cache: {
      get(key: string): string | null;
      set(key: string, value: string): void;
    };
  };
  config: {
    endpoints: string[];
    timeout: number;
  };
}

interface WithPromises {
  getData(): Promise<{ id: number; name: string }>;
  processData(data: string): Promise<void>;
  asyncProperty: Promise<boolean>;
  nestedPromise: {
    fetchUser(): Promise<{ email: string; profile: { avatar: string } }>;
    saveUser(user: { id: number }): Promise<{ success: boolean }>;
  };
}

describe('RecursivePartial - Simple Objects', () => {
  it('allows partial assignment of simple properties', () => {
    expectTypeOf<Record<string, never>>().toExtend<
      RecursivePartial<SimpleObject>
    >();
    expectTypeOf<{ name: string }>().toExtend<RecursivePartial<SimpleObject>>();
    expectTypeOf<{ age: number }>().toExtend<RecursivePartial<SimpleObject>>();
    expectTypeOf<{ name: string; age: number }>().toExtend<
      RecursivePartial<SimpleObject>
    >();
    expectTypeOf<{ name: string; age: number; isActive: boolean }>().toExtend<
      RecursivePartial<SimpleObject>
    >();
    typeTest();
  });

  it('maintains correct types for provided properties', () => {
    const partial: RecursivePartial<SimpleObject> = { name: 'test', age: 25 };
    expectTypeOf(partial.name).toEqualTypeOf<string | undefined>();
    expectTypeOf(partial.age).toEqualTypeOf<number | undefined>();
    expectTypeOf(partial.isActive).toEqualTypeOf<boolean | undefined>();
  });

  it('rejects wrong types', () => {
    expectTypeOf<{ name: number }>().not.toExtend<
      RecursivePartial<SimpleObject>
    >();
    expectTypeOf<{ age: string }>().not.toExtend<
      RecursivePartial<SimpleObject>
    >();
    expectTypeOf<{ isActive: string }>().not.toExtend<
      RecursivePartial<SimpleObject>
    >();
    typeTest();
  });
});

describe('RecursivePartial - Nested Objects', () => {
  it('allows partial assignment of nested properties', () => {
    expectTypeOf<Record<string, never>>().toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{ user: Record<string, never> }>().toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{ user: { id: number } }>().toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{ user: { profile: Record<string, never> } }>().toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{ user: { profile: { name: string } } }>().toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{
      user: {
        id: number;
        profile: { name: string };
      };
      settings: { theme: string };
    }>().toExtend<RecursivePartial<NestedObject>>();
    typeTest();
  });

  it('maintains correct nested types', () => {
    const partial: RecursivePartial<NestedObject> = {
      user: {
        id: 1,
        profile: { name: 'test' }
      }
    };
    expectTypeOf(partial.user).toExtend<
      { id?: number; profile?: { name?: string; email?: string } } | undefined
    >();
    expectTypeOf(partial.settings).toExtend<
      { theme?: string; notifications?: boolean } | undefined
    >();
    typeTest();
  });

  it('rejects wrong nested types', () => {
    expectTypeOf<{ user: { id: string } }>().not.toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{ user: { profile: { name: number } } }>().not.toExtend<
      RecursivePartial<NestedObject>
    >();
    expectTypeOf<{ settings: { theme: number } }>().not.toExtend<
      RecursivePartial<NestedObject>
    >();
    typeTest();
  });
});

describe('RecursivePartial - Methods', () => {
  it('allows method stubs with compatible signatures', () => {
    expectTypeOf<{
      getName: () => string;
    }>().toExtend<RecursivePartial<WithMethods>>();
    expectTypeOf<{
      setAge: (_age: number) => void;
    }>().toExtend<RecursivePartial<WithMethods>>();
    expectTypeOf<{
      calculateTotal: (_a: number, _b: number) => number;
    }>().toExtend<RecursivePartial<WithMethods>>();
    typeTest();
  });

  it('allows method stubs that return RecursivePartial of return type', () => {
    expectTypeOf<{
      getUser: () => { id: number };
    }>().toExtend<RecursivePartial<WithMethods>>();
    expectTypeOf<{
      getUser: () => { name: string };
    }>().toExtend<RecursivePartial<WithMethods>>();
    expectTypeOf<{
      getUser: () => Record<string, never>;
    }>().toExtend<RecursivePartial<WithMethods>>();
    typeTest();
  });

  it('maintains method parameter types', () => {
    const partial: RecursivePartial<WithMethods> = {
      setAge: () => {},
      calculateTotal: () => 0
    };
    expectTypeOf(partial.setAge).toExtend<
      ((_age: number) => void) | undefined
    >();
    expectTypeOf(partial.calculateTotal).toExtend<
      ((_a: number, _b: number) => number) | undefined
    >();
    typeTest();
  });
});

describe('RecursivePartial - Arrays', () => {
  it('allows array properties with partial elements', () => {
    expectTypeOf<{
      tags: string[];
    }>().toExtend<RecursivePartial<WithArrays>>();
    expectTypeOf<{
      users: Array<{ id: number } | { name: string }>;
    }>().toExtend<RecursivePartial<WithArrays>>();
    expectTypeOf<{
      matrix: number[][];
    }>().toExtend<RecursivePartial<WithArrays>>();
    typeTest();
  });

  it('maintains array element types as RecursivePartial', () => {
    const partial: RecursivePartial<WithArrays> = {
      users: [{ id: 1 }, { name: 'test' }]
    };
    expectTypeOf(partial.users).toExtend<
      Array<{ id?: number; name?: string }> | undefined
    >();
    typeTest();
  });

  it('rejects incompatible array element types', () => {
    expectTypeOf<{
      tags: number[];
    }>().not.toExtend<RecursivePartial<WithArrays>>();
    expectTypeOf<{
      users: Array<{ id: string }>;
    }>().not.toExtend<RecursivePartial<WithArrays>>();
    typeTest();
  });
});

describe('RecursivePartial - Optional Fields', () => {
  it('handles optional fields correctly', () => {
    expectTypeOf<Record<string, never>>().toExtend<
      RecursivePartial<WithOptionalFields>
    >();
    expectTypeOf<{ required: string }>().toExtend<
      RecursivePartial<WithOptionalFields>
    >();
    expectTypeOf<{ optional: number }>().toExtend<
      RecursivePartial<WithOptionalFields>
    >();
    expectTypeOf<{
      nested: { value: string };
    }>().toExtend<RecursivePartial<WithOptionalFields>>();
    expectTypeOf<{
      nested: { optional: boolean };
    }>().toExtend<RecursivePartial<WithOptionalFields>>();
    typeTest();
  });

  it('maintains optional field types', () => {
    const partial: RecursivePartial<WithOptionalFields> = {
      required: 'test',
      nested: { value: 'test' }
    };
    expectTypeOf(partial.required).toExtend<string | undefined>();
    expectTypeOf(partial.optional).toExtend<number | undefined>();
    expectTypeOf(partial.nested).toExtend<
      { value?: string; optional?: boolean } | undefined
    >();
    typeTest();
  });
});

describe('RecursivePartial - Complex Nested', () => {
  it('handles deeply nested structures with methods', () => {
    // Test that deeply nested structures compile correctly with Promise transformations
    const partial: RecursivePartial<ComplexNested> = {
      service: {
        api: {
          get: (_path: string) => Promise.resolve({}),
          post: (_path: string, _data: unknown) => Promise.resolve({})
        },
        cache: {
          get: (_key) => 'cached',
          set: (_key, _value) => {}
        }
      },
      config: {
        endpoints: ['api/v1'],
        timeout: 5000
      }
    };

    expect(partial.service).toBeDefined();
    expect(partial.config).toBeDefined();
    typeTest();
  });

  it('maintains deep nested method types', () => {
    const partial: RecursivePartial<ComplexNested> = {
      service: {
        api: {
          get: () => Promise.resolve({} as Record<string, never>)
        }
      }
    };
    // Just verify the basic structure compiles and partial.service exists
    expectTypeOf(partial.service).not.toBeUndefined();
    if (partial.service) {
      expectTypeOf(partial.service.api).not.toBeUndefined();
    }
  });
});

describe('RecursivePartial - Promises', () => {
  it('supports basic Promise properties with RecursivePartial resolved values', () => {
    // Promise<T> becomes Promise<RecursivePartial<T>>
    expectTypeOf<{
      asyncProperty: Promise<boolean>;
    }>().toExtend<RecursivePartial<WithPromises>>();
    typeTest();
  });

  it('supports Promise-returning methods with RecursivePartial resolved values', () => {
    // Methods returning Promise<T> become (...args) => Promise<RecursivePartial<T>>
    expectTypeOf<{
      getData: () => Promise<{ id: number; name: string }>;
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      getData: () => Promise<{ id: number }>;
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      getData: () => Promise<{ name: string }>;
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      getData: () => Promise<Record<string, never>>;
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      processData: (data: string) => Promise<void>;
    }>().toExtend<RecursivePartial<WithPromises>>();
    typeTest();
  });

  it('supports nested Promise structures with RecursivePartial resolved values', () => {
    expectTypeOf<{
      nestedPromise: {
        fetchUser: () => Promise<{
          email: string;
          profile: { avatar: string };
        }>;
      };
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      nestedPromise: {
        fetchUser: () => Promise<{ email: string }>;
      };
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      nestedPromise: {
        fetchUser: () => Promise<{ profile: { avatar: string } }>;
      };
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      nestedPromise: {
        saveUser: (user: { id: number }) => Promise<{ success: boolean }>;
      };
    }>().toExtend<RecursivePartial<WithPromises>>();
    expectTypeOf<{
      nestedPromise: {
        saveUser: (user: { id: number }) => Promise<Record<string, never>>;
      };
    }>().toExtend<RecursivePartial<WithPromises>>();
    typeTest();
  });

  it('maintains correct Promise type signatures with RecursivePartial', () => {
    const partial: RecursivePartial<WithPromises> = {
      getData: () => Promise.resolve({ id: 1, name: 'test' }),
      asyncProperty: Promise.resolve(true),
      nestedPromise: {
        fetchUser: () =>
          Promise.resolve({
            email: 'test@example.com',
            profile: { avatar: 'avatar.jpg' }
          }),
        saveUser: (_user: { id: number }) => Promise.resolve({ success: true })
      }
    };

    // Verify the Promise types are correctly typed with RecursivePartial
    expectTypeOf(partial.asyncProperty).toExtend<
      Promise<boolean> | undefined
    >();
    expectTypeOf(partial.getData).toExtend<
      (() => Promise<{ id?: number; name?: string }>) | undefined
    >();
    typeTest();
  });

  it('verifies Promise type safety with partial resolved values', () => {
    // Test that Promise types work correctly with partial resolved values
    const partialWithPromises: RecursivePartial<WithPromises> = {
      getData: () => Promise.resolve({ id: 1 }), // name is optional
      asyncProperty: Promise.resolve(true)
    };

    expect(partialWithPromises.getData).toBeDefined();
    expect(partialWithPromises.asyncProperty).toBeDefined();
    typeTest();
  });

  it('applies RecursivePartial to Promise resolved values', () => {
    // Test that Promise<T> becomes Promise<RecursivePartial<T>>
    const partial: RecursivePartial<WithPromises> = {
      getData: () => Promise.resolve({ id: 1 }), // name is optional due to RecursivePartial
      nestedPromise: {
        fetchUser: () => Promise.resolve({ email: 'test@example.com' }), // profile is optional
        saveUser: (_user: { id: number }) => Promise.resolve({}) // success is optional
      }
    };

    expect(partial.getData).toBeDefined();
    expect(partial.nestedPromise).toBeDefined();
    typeTest();
  });
});

describe('RecursivePartial - Edge Cases', () => {
  it('rejects objects with additional properties', () => {
    expectTypeOf<{ wrongProperty: string }>().not.toExtend<
      RecursivePartial<SimpleObject>
    >();
    expectTypeOf<{ user: { wrongNested: string } }>().not.toExtend<
      RecursivePartial<NestedObject>
    >();
    typeTest();
  });

  it('preserves the original type when fully specified', () => {
    const full: RecursivePartial<SimpleObject> = {
      name: 'test',
      age: 25,
      isActive: true
    };
    // All properties should be optional in RecursivePartial
    expectTypeOf(full.name).toEqualTypeOf<string | undefined>();
    expectTypeOf(full.age).toEqualTypeOf<number | undefined>();
    expectTypeOf(full.isActive).toEqualTypeOf<boolean | undefined>();
    typeTest();
  });

  it('handles null and undefined correctly', () => {
    expectTypeOf<{ name: undefined }>().toExtend<
      RecursivePartial<SimpleObject>
    >();
    expectTypeOf<{ user: undefined }>().toExtend<
      RecursivePartial<NestedObject>
    >();
    typeTest();
  });
});
