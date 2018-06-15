import { SpyHelper } from './spy-helpers/spy-helper';
import { SpyHelperFactory } from './spy-helper-factory';

export type RecursivePartial<T> = Partial<{ [key in keyof T]: RecursivePartial<T[key]> | T[key] }>;

export interface ExtendedWith<T> {
  with(stubs: RecursivePartial<T> | T): T;
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

  private static get spyHelper(): SpyHelper {
    return SpyHelperFactory.get();
  }

  private static getHandler<T extends object>(): ProxyHandler<T> {
    return {
      get: (target: any, prop: any) => {
        if (target[prop]) {
          return target[prop];
        }
        return target[prop] = this.spyHelper.getSpy(prop);
      }
    };
  }

  private static withGenerator<T>(object: T): ExtendedWith<T> {
    return {
      with: (stubs: Overrides<T> = {} as T): T => {
        Object.keys(stubs).forEach((key: keyof Overrides<T>) => {
          this.spyHelper.spyAndCallThrough(stubs, key);
        });

        // tslint:disable-next-line:prefer-object-spread
        return Object.assign(object, stubs);
      }
    };
  }
}
