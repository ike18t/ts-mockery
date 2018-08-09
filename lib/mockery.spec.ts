import { Mockery } from './mockery';

describe('Mockery', () => {
  interface AnotherObjectToNest {
    function: () => boolean;
  }

  interface ObjectToNest {
    anotherNestedObject: AnotherObjectToNest;
    string: string;
    stringFunction: () => string;
  }

  class Foo {
    static static(): string {
      throw new Error();
    }
    any: any;
    array: ObjectToNest[] = [];
    nestedObject!: ObjectToNest;
    string = ':-)';
    anyFunction = (param: string): any => param;
    booleanFunction = () => true;
    functionWithParam = (param: string) => param;
    objectFunction = (): ObjectToNest => ({
      anotherNestedObject: { function: () => true },
      string: 'hi',
      stringFunction: () => 'hi'
    })
    async promiseFunction(): Promise<{ [bah: string]: boolean }> {
      return Promise.resolve({ a: true, b: false });
    }
    stringFunction = (buzz: string): string => buzz.toUpperCase();
    voidFunction = (): void => undefined;
  }

  describe('of', () => {
    it('mocks the supplied method', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });

      expect(mock.stringFunction('bye')).toEqual('hi');
    });

    it('mocks multiple methods', () => {
      const mock = Mockery.of<Foo>({ array: [{ stringFunction: () => 'string' }],
                                     booleanFunction: () => false,
                                     functionWithParam: () => 'hi',
                                     stringFunction: () => 'hi' });

      expect(mock.stringFunction('whatevs')).toBe('hi');
      expect(mock.booleanFunction()).toBe(false);
    });

    it('adds a spy to the supplied method on the mock object', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });
      mock.stringFunction('bye');

      expect(mock.stringFunction).toHaveBeenCalledWith('bye');
    });

    it('mocks a promise function', async () => {
      const mock = Mockery.of<Foo>({ promiseFunction: async () => Promise.resolve({ c: true, d: false }) });
      expect(await mock.promiseFunction()).toEqual({ c: true, d: false });
    });

    it('works with no arguments', () => {
      expect(() => Mockery.of<Foo>()).not.toThrow(); // tslint:disable-line:no-unnecessary-callback-wrapper
    });

    it('works with nested types', () => {
      const mock = Mockery.of<Foo>({ nestedObject : { stringFunction : () => 'hi' } });

      expect(mock.nestedObject.stringFunction()).toEqual('hi');
    });

    it('mocks multiple level nested functions', () => {
      const mock = Mockery.of<Foo>({ nestedObject : { anotherNestedObject: { function : () => false } } });
      mock.nestedObject.anotherNestedObject.function();

      expect(mock.nestedObject.anotherNestedObject.function).toHaveBeenCalled();
    });

    it('mocks partials function return types', () => {
      const mock = Mockery.of<Foo>({ objectFunction: () => ({ string: 'bah' }) });

      expect(mock.objectFunction().string).toBe('bah');
    });

    it('does not blow up when a value is null', () => {
      expect(() => { Mockery.of<Foo>({ any: null }); }).not.toThrow(); // tslint:disable-line:no-null-keyword
    });

    it('noops have independent spies', () => {
      const mock = Mockery.of<Foo>({ nestedObject: { stringFunction: Mockery.noop }, objectFunction: Mockery.noop });
      mock.objectFunction();
      expect(mock.objectFunction).toHaveBeenCalled();
      expect(mock.nestedObject.stringFunction).not.toHaveBeenCalled();
    });
  });

  describe('extend', () => {
    it('can extend an empty mock object', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ stringFunction: () => 'foooo' });

      expect(mock.stringFunction('bye')).toEqual('foooo');
    });

    it('extends the mock object with the supplied property', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ string: ':-)' });

      expect(mock.string).toEqual(':-)');
    });

    it('extends the mock object with spies for the supplied function', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ booleanFunction: () => false });

      mock.booleanFunction();
      expect(mock.booleanFunction).toHaveBeenCalled();
    });

    it('overrides preexisting mock', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });
      Mockery.extend(mock).with({ stringFunction: () => 'foooo' });

      expect(mock.stringFunction('bye')).toEqual('foooo');
    });

    it('mocks an already mocked method multiple times', () => {
      const mock = Mockery.of<Foo>({ booleanFunction: () => false });

      expect(mock.booleanFunction()).toBeFalsy();

      Mockery.extend(mock).with({ booleanFunction: () => true });

      expect(mock.booleanFunction()).toBeTruthy();

      Mockery.extend(mock).with({ booleanFunction: () => false });

      expect(mock.booleanFunction()).toBeFalsy();
      expect(mock.booleanFunction).toHaveBeenCalled();
    });

    it('mocks an already mocked property multiple times', () => {
      const mock = Mockery.of<Foo>({ string: 'first' });

      expect(mock.string).toEqual('first');

      Mockery.extend(mock).with({ string: 'second' });

      expect(mock.string).toEqual('second');

      Mockery.extend(mock).with({ string: 'third' });

      expect(mock.string).toEqual('third');
    });

    it('mocks partials function return types', () => {
      const mock = Mockery.of<Foo>({ objectFunction: () => ({ string: 'bah' }) });

      expect(mock.objectFunction().string).toBe('bah');
    });
  });

  describe('staticMethod', () => {
    it('does not call the underlying implememtation', () => {
      Mockery.staticMethod(Foo, 'static', () => 'hi');
      expect(() => { Foo.static(); }).not.toThrow();
    });

    it('calls fake', () => {
      Mockery.staticMethod(Foo, 'static', () => 'hi');
      expect(Foo.static()).toEqual('hi');
    });

    it('is a spy', () => {
      Mockery.staticMethod(Foo, 'static', () => 'hi');
      Foo.static();
      expect(Foo.static).toHaveBeenCalled(); //tslint:disable-line:no-unbound-method
    });

    it('resets the call count', () => {
      Mockery.staticMethod(Foo, 'static', () => 'hi');
      Foo.static();
      Mockery.staticMethod(Foo, 'static', () => 'hi');
      expect(Foo.static).not.toHaveBeenCalled(); //tslint:disable-line:no-unbound-method
    });

    it('overwrites spy fake', () => {
      Mockery.staticMethod(Foo, 'static', () => 'hi');
      Mockery.staticMethod(Foo, 'static', () => 'hello');
      expect(Foo.static()).toEqual('hello');
    });

    it('calls the underlying implememtation', () => {
      expect(() => { Foo.static(); }).toThrow();
    });
  });

  describe('noop', () => {
    it('returns a spy', () => {
      const anyFunc = Mockery.noop;
      anyFunc();
      expect(anyFunc).toHaveBeenCalled();
    });
  });
});
