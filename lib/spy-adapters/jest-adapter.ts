import { SpyAdapter } from "./spy-adapter";

export class JestAdapter implements SpyAdapter {
  getSpy() {
    return jest.fn();
  }

  // tslint:disable-next-line:ban-types
  spyAndCallFake<T, K extends keyof T>(
    object: T,
    key: K,
    stub: T[K] & (() => unknown),
  ) {
    jest.spyOn(object as any, key as any).mockImplementation(stub); // eslint-disable-line @typescript-eslint/no-explicit-any
    (object[key] as jest.Mock).mockClear();
  }

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
    if (typeof object[key] === typeof Function) {
      jest.spyOn(object as any, key as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}
