export function MockIt<T>(object: Partial<{ [ key in keyof T ]: T[key] }>): T {
  Object.keys(object).forEach((key) => {
    spyOn(object, key as keyof T);
  });
  return object as T;
}

export function MockItStatic<T, K extends keyof T>(obj: T, key: K, stub: T[K]) {
  spyOn(obj, key).and.callFake(stub as any);
}
