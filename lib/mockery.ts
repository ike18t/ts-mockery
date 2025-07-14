import { SpyAdapterFactory } from './spy-adapter-factory';
import { SpyAdapter } from './spy-adapters/spy-adapter';

export type RecursivePartial<T> = Partial<{
  [key in keyof T]: T[key] extends Promise<infer P>
    ? Promise<RecursivePartial<P>>
    : T[key] extends (...a: Array<infer U>) => infer R
      ? R extends Promise<infer P>
        ? (...a: Array<U>) => Promise<RecursivePartial<P>>
        : (...a: Array<U>) => RecursivePartial<R>
      : T[key] extends Array<unknown>
        ? Array<RecursivePartial<T[key][number]>>
        : T[key] extends string | number | boolean | null | undefined
          ? T[key]
          : RecursivePartial<T[key]>;
}>;

export interface ExtendedWith<T> {
  with(stubs: RecursivePartial<T>): T;
}

export class Mockery {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static get noop(): () => any {
    return this.spyAdapter.getSpy('any');
  }

  public static all<T extends object>() {
    const handler: ProxyHandler<T> = {
      // @ts-expect-error: prop wants to be a string, but we know it's a keyof T
      get: (target: T, prop: keyof T) => {
        if (!target[prop] && prop !== 'then') {
          target[prop] = this.spyAdapter.getSpy('any'); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }
        return target[prop];
      }
    };
    return new Proxy({}, handler) as T;
  }

  public static configure(spyAdapter: 'jasmine' | 'jest' | SpyAdapter) {
    this.spyAdapter =
      typeof spyAdapter === 'string'
        ? SpyAdapterFactory.get(spyAdapter)
        : spyAdapter;
  }

  public static extend<T>(object: T) {
    return this.withGenerator<T>(object);
  }

  public static from<T>(object: RecursivePartial<T>) {
    return object as T;
  }

  public static of<T extends Array<unknown>>(
    stubs?: Array<RecursivePartial<T[number]>>
  ): T;
  public static of<T extends ReadonlyArray<unknown>>(
    stubs?: ReadonlyArray<RecursivePartial<T[number]>>
  ): T;
  public static of<T extends object>(stubs?: RecursivePartial<T>): T;
  public static of<T extends object>(stubs = {} as T): T {
    if (Array.isArray(stubs)) {
      return stubs as T;
    }
    return this.extend<T>({} as T).with(stubs);
  }

  public static staticMethod<T, K extends keyof T>(
    object: T,
    key: K,
    stub: T[K] & (() => unknown)
  ): void {
    this.spyAdapter.spyAndCallFake(object, key, stub);
  }

  private static spyAdapter: SpyAdapter = SpyAdapterFactory.get('noop');

  private static spyOnTheStubbedFunctions<T>(object: T, key: keyof T) {
    if (typeof object[key] === typeof Function) {
      this.spyAdapter.spyAndCallThrough(object, key);
    } else if (typeof object[key] === typeof {} && object[key] !== null) {
      Object.keys(object[key] as typeof Object).forEach((subKey) => {
        this.spyOnTheStubbedFunctions(object[key], subKey as any); // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      });
    }
  }

  private static withGenerator<T>(object: T): ExtendedWith<T> {
    return {
      with: (stubs: RecursivePartial<T> = {} as RecursivePartial<T>): T => {
        let currentKey = '';
        try {
          Object.keys(stubs).forEach((key) => {
            currentKey = key;
            this.spyOnTheStubbedFunctions(
              stubs as unknown as T,
              key as keyof RecursivePartial<T>
            );
          });
        } catch (e) {
          if (e instanceof RangeError) {
            throw new Error(
              `Return value of ${currentKey} has a circular reference.\nConsider using Mock.from instead.`
            );
          }
          throw e;
        }
        return Object.assign(object as object, stubs as T);
      }
    };
  }
}
