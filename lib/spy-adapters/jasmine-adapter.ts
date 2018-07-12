import { SpyAdapter } from './spy-adapter';

export class JasmineAdapter implements SpyAdapter {
  getSpy(property: string) {
    return jasmine.createSpy(property);
  }

  // tslint:disable-next-line:ban-types
  spyAndCallFake<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function) {
    const value = object[key];
    // tslint:disable-next-line:no-unsafe-any
    const spy = ((jasmine as any).isSpy(value) ? value : spyOn(object, key)) as jasmine.Spy;
    spy.calls.reset();
    spy.and.callFake(stub);
  }

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
    const value = object[key];
    // tslint:disable-next-line:no-unsafe-any
    if (typeof value === typeof Function && !(jasmine as any).isSpy(value)) {
      spyOn(object, key).and.callThrough();
    }
  }
}
