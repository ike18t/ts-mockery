import { Mockery } from './mockery';
import { MY_THING, MY_COMPLEX_THING } from './mockery.spec.test-module';

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
    it('works with arrays', () => {
      const mock = Mockery.of<Array<Foo>>([{ string: 'foo' }, { string: 'bar' }]);

      expect(mock[0].string).toBe('foo');
      expect(mock[1].string).toBe('bar');
    });

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

    it('mocks multiple level nested functions with arrays', () => {
      const mock = Mockery.of<Foo>({ array : [{ anotherNestedObject: { function : () => false } }] });
      mock.array[0].anotherNestedObject.function();

      expect(mock.array[0].anotherNestedObject.function).toHaveBeenCalled();
    });

    it('recursively mocks function return array objects', () => {
      const obj = {
        ect: () => ({stuff: [{foo: 1, bar: 'hi'}, {foo: 2, bar: ''}, {foo: 3, bar: ''}]})
      };

      Mockery.of<typeof obj>({
        ect: () => ({stuff: [{}]}) // <-- This fails!!
      });
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

    it('Throws error when trying to mock circular reference', () => {
      const myObject: any = {};
      myObject.foo = myObject; // tslint:disable-line:no-unsafe-any

      const errorMessage = `Return value of foo has a circular reference.\nConsider using Mock.from instead.`;

      expect(() => Mockery.of<any>(myObject)).toThrow(new Error(errorMessage)); // tslint:disable-line:no-unsafe-any
    });
  });

  describe('resetMockExtensions', () => {
    it('resets to the original value after the test is complete', () => {
      Mockery.extend(MY_THING).with({foo: 'fake foo', bar: undefined, baz: 'fake baz'});
      Mockery.resetMockExtensions();

      expect(MY_THING).toEqual({foo: 'foo', bar: 'bar'});
    });

    it('resets to the original value after the test is complete', () => {
      Mockery.extend(MY_THING).with({foo: 'fake foo', bar: undefined, baz: 'fake baz'});
      Mockery.resetMockExtensions();

      expect(MY_THING).toEqual({foo: 'foo', bar: 'bar'});
    });

    it('resets complex objects to the original value after the test is complete', () => {
      Mockery.extend(MY_COMPLEX_THING).with({name: 'fake name'});
      Mockery.extend(MY_COMPLEX_THING.address).with({street: 'fake street'});
      Mockery.resetMockExtensions();

      expect(MY_COMPLEX_THING).toEqual({
        address: {
          city: 'Foovile',
          street: '123 Foo St',
        },
        name: 'foo',
      });
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

    it('Throws error when trying to extend a mock with circular reference', () => {
      const myObject: any = {};
      myObject.foo = myObject; // tslint:disable-line:no-unsafe-any
      const errorMessage = `Return value of foo has a circular reference.\nConsider using Mock.from instead.`;

      // tslint:disable-next-line:no-unsafe-any
      expect(() => Mockery.extend<any>({}).with(myObject)).toThrow(new Error(errorMessage));
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

  describe('all', () => {
    it('returns a spy for uncalled methods', () => {
      const mock = Mockery.all<Foo>();
      expect(mock.booleanFunction).not.toHaveBeenCalled();
    });

    it('returns a spy for called methods', () => {
      const mock = Mockery.all<Foo>();
      mock.objectFunction();
      expect(mock.objectFunction).toHaveBeenCalled();
    });

    it('returns undefined for called methods', () => {
      const mock = Mockery.all<Foo>();
      const result = mock.objectFunction();
      expect(result).toBeUndefined();
    });

    it('you can extend an all object', () => {
      const mock = Mockery.all<Foo>();
      Mockery.extend(mock).with({ stringFunction: () => 'hola' });
      expect(mock.stringFunction('whatevs')).toBe('hola');
    });
  });
});
