import { SpyAdapter } from './spy-adapter';

export class JestAdapter implements SpyAdapter {
  getSpy() {
    return jest.fn();
  }

  // tslint:disable-next-line:ban-types
  spyAndCallFake<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function) {
    jest.spyOn(object, key).mockImplementation(stub as any);
  }

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
    if (typeof object[key] === 'function') { // tslint:disable-line
      jest.spyOn(object, key);
    }
  }
}
