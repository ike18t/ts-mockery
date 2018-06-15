import { Mockery } from './mockery';

describe('Mockery', () => {
  class Bah {
    foo: string;
    bar = (buzz: string) => buzz.toUpperCase();
  }

  it('mocks the supplied method', () => {
    const mock = Mockery.of<Bah>({ bar: () => 'hi' });
    const result = mock.bar('bye');
    expect(mock.bar).toHaveBeenCalledWith('bye');
    expect(result).toEqual('hi');
  });

  it('allows you to overwrite preexisting mock', () => {
    const mock = Mockery.of<Bah>({ bar: () => 'hi' });
    Mockery.extend(mock).with({ bar: () => 'foooo' });
    const result = mock.bar('bye');
    expect(result).toEqual('foooo');
  });

  it('allows you to use an empty constructor', () => {
    expect(() => Mockery.of<Bah>()).not.toThrow(); /* tslint:disable-line:no-unnecessary-callback-wrapper */
  });

  it('allows you to use an empty constructor', () => {
    const mock = Mockery.of<Bah>();
    Mockery.extend(mock).with({ bar: () => 'foooo' });
    const result = mock.bar('bye');
    expect(result).toEqual('foooo');
  });

  it('auto creates spies', () => {
    const mock = Mockery.of<Bah>();
    mock.bar('bye');
    expect(mock.bar).toHaveBeenCalledWith('bye');
  });
});
