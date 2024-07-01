export interface SpyAdapter {
  getSpy(property: string): any; // eslint-disable-line @typescript-eslint/no-explicit-any

  spyAndCallFake<T, K extends keyof T>(
    object: T,
    key: K,
    stub: T[K] & (() => unknown)
  ): void;

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K): void;
}
