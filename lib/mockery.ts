import { SpyAdapterFactory } from './spy-adapter-factory';
import { SpyAdapter } from './spy-adapters/spy-adapter';

export type RecursivePartial<T> =
  Partial<{ [key in keyof T]:
              T[key] extends (...a: Array<infer U>) => any ? (...a: Array<U>) => Partial<ReturnType<T[key]>> : // tslint:disable-line
              T[key] extends Array<any> ? Array<Partial<T[key][number]>> :
              RecursivePartial<T[key]> | T[key] }>;

export interface ExtendedWith<T> {
  with(stubs: RecursivePartial<T>): T;
}

export class Mockery {
  public static configure(spyAdapter: 'jasmine' | 'jest' | SpyAdapter) {
    this.spyAdapter = typeof spyAdapter === 'string' ? SpyAdapterFactory.get(spyAdapter) : spyAdapter;
  }

  public static extend<T>(object: T) {
    return this.withGenerator<T>(object);
  }

  public static of<T extends object>(stubs: RecursivePartial<T> = {} as T): T {
    return this.extend<T>({} as T).with(stubs);
  }

  // tslint:disable-next-line:ban-types
  public static staticMethod<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function): void {
    this.spyAdapter.spyAndCallFake(object, key, stub);
  }

  private static spyAdapter: SpyAdapter = SpyAdapterFactory.get('noop');

  private static spyOnTheStubbedFunctions<T>(object: T, key: keyof T) {
    if (typeof object[key] === typeof Function) {
      this.spyAdapter.spyAndCallThrough(object, key);
    } else if (typeof object[key] === typeof {}) {
      Object.keys(object[key] as any).forEach((subKey) => {
        this.spyOnTheStubbedFunctions<any>(object[key], subKey);
      });
    }
  }

  private static withGenerator<T>(object: T): ExtendedWith<T> {
    return {
      with: (stubs: RecursivePartial<T> = {} as T): T => {
        Object.keys(stubs).forEach((key) => {
          this.spyOnTheStubbedFunctions(stubs, key as keyof RecursivePartial<T>);
        });
        return Object.assign(object, stubs); // tslint:disable-line:prefer-object-spread
      }
    };
  }
}
