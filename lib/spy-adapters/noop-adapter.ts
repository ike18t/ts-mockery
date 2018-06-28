import { SpyAdapter } from './spy-adapter';

export class NoopAdapter implements SpyAdapter {
  getSpy(property: string) {
    return;
  }

  // tslint:disable-next-line:ban-types
  spyAndCallFake<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function) {
    return;
  }

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K) {
    return;
  }
}
