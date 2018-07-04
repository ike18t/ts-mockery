import { SpyAdapterFactory } from './spy-adapter-factory';
import { SpyAdapter } from './spy-adapters/spy-adapter';

export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

export type RecursivePartial<T> =
  Partial<{ [key in keyof T]:
              T[key] extends Function ? () => Partial<ReturnType<T[key]>> : // tslint:disable-line:ban-types
              T[key] extends Array<any> ? Array<Partial<T[key][number]>> :
              RecursivePartial<T[key]> | T[key] }>;

export interface ExtendedWith<T> {
  with(stubs: Overrides<T>): T;
}

export type Overrides<T> = RecursivePartial<T> | T;

export class Mockery {
  public static configure(spyAdapter: 'jasmine' | 'jest' | SpyAdapter) {
    this.spyAdapter = typeof spyAdapter === 'string' ? SpyAdapterFactory.get(spyAdapter) : spyAdapter;
  }

  public static extend<T>(object: T) {
    return this.withGenerator<T>(object);
  }

  public static of<T extends object>(stubs: Overrides<T> = {} as T): T {
    const stubbed = this.extend<T>({} as T).with(stubs);
    return new Proxy(stubbed, this.getHandler<T>());
  }

  private static spyAdapter: SpyAdapter = SpyAdapterFactory.get('noop');

  private static getHandler<T extends object>(): ProxyHandler<T> {
    return {
      get: (target: T, prop: keyof T) => {
        if (target[prop]) {
          return target[prop];
        }
        return target[prop] = this.spyAdapter.getSpy(prop.toString()); // tslint:disable-line:no-unsafe-any
      }
    };
  }

  private static withGenerator<T>(object: T): ExtendedWith<T> {
    return {
      with: (stubs: Overrides<T> = {} as T): T => {
        Object.keys(stubs).forEach((key) => {
          this.spyAdapter.spyAndCallThrough(stubs, key as keyof Overrides<T>);
        });
        return Object.assign(object, stubs); // tslint:disable-line:prefer-object-spread
      }
    };
  }
}
