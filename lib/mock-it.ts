export function MockIt<T>(object?: Partial<{ [ key in keyof T ]: T[key] }>,
                          extension?: Partial<{ [ key in keyof T ]: T[key] }>): T {
  const spyTarget = extension || object;
  if (!spyTarget) {
    return {} as T; // tslint:disable-line:no-object-literal-type-assertion
  }

  Object.keys(spyTarget).forEach((key) => {
    spyOn(spyTarget, key as keyof T).and.callThrough();
  });
  Object.assign(object, spyTarget);
  return object as T;
}

export function MockItStatic<T, K extends keyof T>(obj: T, key: K, stub: T[K]) {
  spyOn(obj, key).and.callFake(stub as any);
}
