/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */
import { SpyAdapter } from "./spy-adapter";

export class JasmineAdapter implements SpyAdapter {
  getSpy(property: string) {
    return jasmine.createSpy(property);
  }

  spyAndCallFake<T, K extends keyof T>(
    object: T,
    key: K,
    stub: T[K] & (() => unknown),
  ) {
    const value = object[key];
    const spy = (
      (jasmine as any).isSpy(value) ? value : spyOn(object, key)
    ) as jasmine.Spy;
    spy.calls.reset();
    spy.and.callFake(stub);
  }

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
    const value = object[key];
    if (typeof value === typeof Function && !(jasmine as any).isSpy(value)) {
      spyOn(object, key).and.callThrough();
    }
  }
}
