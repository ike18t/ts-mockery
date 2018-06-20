import { SpyHelperFactory } from './spy-helper-factory';

export type RecursivePartial<T> =
  Partial<{ [key in keyof T]:
              T[key] extends Function ? T[key] : // tslint:disable-line:ban-types
              T[key] extends Array<any> ? Array<Partial<T[key][number]>> :
              RecursivePartial<T[key]> | T[key] }>;

export interface ExtendedWith<T> {
  with(stubs: Overrides<T>): T;
}

export type Overrides<T> = RecursivePartial<T> | T;

export class Mockery {
  public static extend<T>(object: T) {
    return this.withGenerator<T>(object);
  }

  public static of<T extends object>(stubs: Overrides<T> = {} as T): T {
    const stubbed = this.extend<T>({} as T).with(stubs);
    return new Proxy(stubbed, this.getHandler<T>());
  }

  private static readonly spyHelper = SpyHelperFactory.get();

  private static getHandler<T extends object>(): ProxyHandler<T> {
    return {
      get: (target: T, prop: keyof T) => {
        if (target[prop]) {
          return target[prop];
        }
        return target[prop] = this.spyHelper.getSpy(prop.toString()); // tslint:disable-line:no-unsafe-any
      }
    };
  }

  private static withGenerator<T>(object: T): ExtendedWith<T> {
    return {
      with: (stubs: Overrides<T> = {} as T): T => {
        Object.keys(stubs).forEach((key) => {
          this.spyHelper.spyAndCallThrough(stubs, key as keyof Overrides<T>);
        });

        return Object.assign(object, stubs); // tslint:disable-line:prefer-object-spread
      }
    };
  }
}
