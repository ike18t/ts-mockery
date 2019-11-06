import { SpyAdapterFactory } from './spy-adapter-factory';
import { SpyAdapter } from './spy-adapters/spy-adapter';

export type RecursivePartial<T> =
  Partial<{ [key in keyof T]:
              T[key] extends (...a: Array<infer U>) => any ? (...a: Array<U>) => RecursivePartial<ReturnType<T[key]>> | ReturnType<T[key]>: // tslint:disable-line
              T[key] extends Array<any> ? Array<RecursivePartial<T[key][number]>> :
              RecursivePartial<T[key]> | T[key] }>;

export interface ExtendedWith<T> {
  with(stubs: RecursivePartial<T>): T;
}

interface MockCacheEntry {
  mockedObject: object;
  originalObject: object;
}

export class Mockery {
  public static get noop(): () => any {
    return this.spyAdapter.getSpy('any'); // tslint:disable-line:no-unsafe-any
  }

  public static all<T>() {
    const handler = {
      get: (target: T, prop: keyof T) => {
        if (!target[prop]) {
          target[prop] = this.spyAdapter.getSpy('any'); // tslint:disable-line:no-unsafe-any
        }
        return target[prop];
      }
    };
    return new Proxy({}, handler) as T;
  }

  public static configure(spyAdapter: 'jasmine' | 'jest' | SpyAdapter) {
    this.spyAdapter = typeof spyAdapter === 'string' ? SpyAdapterFactory.get(spyAdapter) : spyAdapter;
  }

  public static extend<T>(object: T) {
    return this.withGenerator<T>(object);
  }

  public static from<T>(object: RecursivePartial<T>) {
    return object as T;
  }

  public static of<T extends Array<any>>(stubs?: Array<RecursivePartial<T[number]>>): T;
  public static of<T extends ReadonlyArray<any>>(stubs?: ReadonlyArray<RecursivePartial<T[number]>>): T;
  public static of<T extends object>(stubs?: RecursivePartial<T>): T;
  public static of<T extends object>(stubs: any = {} as T): T {
    if (Array.isArray(stubs)) {
      return stubs as T;
    }
    // tslint:disable-next-line:no-unsafe-any
    return this.extend<T>({} as T).with(stubs);
  }

  public static resetMockExtensions() {
    Mockery.mockResetCache.reverse().forEach((entry) => {
      Object.keys(entry.mockedObject).forEach((mockKey) => {
        if (!(mockKey in entry.originalObject)) {
          delete (entry.mockedObject as any)[mockKey]; // tslint:disable-line:no-dynamic-delete
        }
      });
      Object.assign(entry.mockedObject, entry.originalObject);
    });
    Mockery.mockResetCache = [];
  }

  // tslint:disable-next-line:ban-types
  public static staticMethod<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function): void {
    this.spyAdapter.spyAndCallFake(object, key, stub);
  }

  private static mockResetCache: MockCacheEntry[] = [];
  private static spyAdapter: SpyAdapter = SpyAdapterFactory.get('noop');

  private static spyOnTheStubbedFunctions<T>(object: T, key: keyof T) {
    if (typeof object[key] === typeof Function) {
      this.spyAdapter.spyAndCallThrough(object, key);
    // tslint:disable-next-line:strict-type-predicates
    } else if (typeof object[key] === typeof {} && object[key] !== null) {
      Object.keys(object[key] as any).forEach((subKey) => {
        this.spyOnTheStubbedFunctions<any>(object[key], subKey);
      });
    }
  }

  private static withGenerator<T>(object: T): ExtendedWith<T> {
    return {
      with: (stubs: RecursivePartial<T> = {} as T): T => {
        let currentKey = '';
        try {
          Object.keys(stubs).forEach((key) => {
            currentKey = key;
            this.spyOnTheStubbedFunctions(stubs, key as keyof RecursivePartial<T>);
          });
        } catch (e) {
          if (e instanceof RangeError) {
            throw new Error(
              `Return value of ${currentKey} has a circular reference.\nConsider using Mock.from instead.`
            );
          }
          throw e;
        }
        Mockery.mockResetCache.push({mockedObject: object as any, originalObject: {...(object as any)}});
        return Object.assign(object, stubs); // tslint:disable-line:prefer-object-spread
      }
    };
  }
}

// tslint:disable-next-line:strict-type-predicates
if (typeof afterEach !== 'undefined') {
  afterEach(() => {
    Mockery.resetMockExtensions();
  });
}
