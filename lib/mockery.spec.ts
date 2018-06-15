import { Mockery } from './mockery';

describe('Mockery', () => {
  interface Bar {
    blah: string;
    blurg: string;
  }

  class Foo {
    blah: Bar;
    boo = ':-)';
    private bah = 'hi';
    bar = (buzz: string): string => buzz.toUpperCase();
    fighters = () => true;
    fightersVoid = (i: number): void => undefined;
    fightersWithParams = (par: string) => par;
    useBah = () => this.bah;
  }

  describe('of', () => {
    it('mocks the supplied method', () => {
      const mock = Mockery.of<Foo>({ bar: () => 'hi' });

      expect(mock.bar('bye')).toEqual('hi');
    });

    it('mocks multiple methods', () => {
      const mock = Mockery.of<Foo>({ bar: () => false, fighters: () => false });

      // mock.bar should not be able to return a boolean
      expect(mock.bar('whatevs')).toBe('yo');
    });

    it('adds a spy to the supplied method on the mock object', () => {
      const mock = Mockery.of<Foo>({ bar: () => 'hi' });
      mock.bar('bye');

      expect(mock.bar).toHaveBeenCalledWith('bye');
    });

    it('works with no arguments', () => {
      expect(() => Mockery.of<Foo>()).not.toThrow(); /* tslint:disable-line:no-unnecessary-callback-wrapper */
    });

    it('auto creates spies', () => {
      const mock = Mockery.of<Foo>();
      mock.bar('bye');

      expect(mock.bar).toHaveBeenCalledWith('bye');
    });

    it('works with nested types', () => {
      const mock = Mockery.of<Foo>({ blah : { blurg : 'hi' } });

      expect(mock.blah.blurg).toEqual('hi');
    });
  });

  describe('extend', () => {
    it('can extend an empty mock object', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ bar: () => 'foooo' });

      expect(mock.bar('bye')).toEqual('foooo');
    });

    it('extends the mock object with the supplied property', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ bar: ':-)' });
      expect(mock.bar).toEqual(':-)');
    });

    it('extends the mock object with the supplied function', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ fighters: () => false });
      expect(mock.fighters()).toBeFalsy();
    });

    it('extends the mock object with spies for the supplied function', () => {
      const mock = Mockery.of<Foo>();
      Mockery.extend(mock).with({ fighters: () => false });

      mock.fighters();
      expect(mock.fighters).toHaveBeenCalled();
    });

    it('overrides preexisting mock', () => {
      const mock = Mockery.of<Foo>({ bar: () => 'hi' });
      Mockery.extend(mock).with({ bar: () => 'foooo' });

      expect(mock.bar('bye')).toEqual('foooo');
    });

    it('mocks an already mocked method multiple times', () => {
      const mock = Mockery.of<Foo>({ fighters: () => false });

      expect(mock.fighters()).toBeFalsy();

      Mockery.extend(mock).with({ fighters: () => true });

      expect(mock.fighters()).toBeTruthy();

      Mockery.extend(mock).with({ fighters: () => false });

      expect(mock.fighters()).toBeFalsy();
      expect(mock.fighters).toHaveBeenCalled();
    });

    it('mocks an already mocked property multiple times', () => {
      const mock = Mockery.of<Foo>({ bar: 'first' });

      expect(mock.bar).toEqual('first');

      Mockery.extend(mock).with({ bar: 'second' });

      expect(mock.bar).toEqual('second');

      Mockery.extend(mock).with({ bar: 'third' });

      expect(mock.bar).toEqual('third');
    });
  });
});
