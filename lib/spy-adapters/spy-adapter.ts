export interface SpyAdapter {
  getSpy(property: string): any; // tslint:disable-line

  // tslint:disable-next-line:ban-types
  spyAndCallFake<T, K extends keyof T>(object: T, key: K, stub: T[K] & Function): void;

  spyAndCallThrough<T, K extends keyof T>(object: T, key: K): void;
}
