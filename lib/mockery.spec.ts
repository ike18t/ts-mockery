import { Mockery } from './mockery';

describe('Mockery', () => {
  interface ObjectToNest {
    string: string;
    stringFunction: () => string;
  }

  class Foo {
    array: ObjectToNest[];
    nestedObject: ObjectToNest;
    string = ':-)';
    booleanFunction = () => true;
    functionWithParam = (par: string) => par;
    stringFunction = (buzz: string): string => buzz.toUpperCase();
    voidFunction = (i: number): void => undefined;
  }

  describe('of', () => {
    it('mocks the supplied method', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });

      expect(mock.stringFunction('bye')).toEqual('hi');
    });

    it('mocks multiple methods', () => {
      const mock = Mockery.of<Foo>({ array: [{ stringFunction: () => 'string' }],
                                     booleanFunction: () => false,
                                     stringFunction: () => 'hi' });

      expect(mock.stringFunction('whatevs')).toBe('hi');
      expect(mock.booleanFunction()).toBe(false);
    });

    it('adds a spy to the supplied method on the mock object', () => {
      const mock = Mockery.of<Foo>({ stringFunction: () => 'hi' });
      mock.stringFunction('bye');

      expect(mock.stringFunction).toHaveBeenCalledWith('bye');
    });

    it('works with no arguments', () => {
      expect(() => Mockery.of<Foo>()).not.toThrow(); /* tslint:disable-line:no-unnecessary-callback-wrapper */
    });

    it('auto creates spies', () => {
      const mock = Mockery.of<Foo>();
      mock.stringFunction('bye');

      expect(mock.stringFunction).toHaveBeenCalledWith('bye');
    });

    it('works with nested types', () => {
      const mock = Mockery.of<Foo>({ nestedObject : { stringFunction : () => 'hi' } });

      expect(mock.nestedObject.stringFunction()).toEqual('hi');
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
  });
});
