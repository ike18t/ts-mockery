import { MockIt } from './mock-it';

describe('MockIt', () => {
  class Bah {
    foo: string;
    bar = (buzz: string) => buzz.toUpperCase();
  }

  it('should mock the supplied method', () => {
    const mock = MockIt<Bah>({ bar: () => 'hi' });
    const result = mock.bar('bye');
    expect(mock.bar).toHaveBeenCalledWith('bye');
    expect(result).toEqual('hi');
  });

  it('should allow you to overwrite preexisting mock', () => {
    const mock = MockIt<Bah>({ bar: () => 'hi' });
    MockIt<Bah>(mock, { bar: () => 'foooo' });
    const result = mock.bar('bye');
    expect(result).toEqual('foooo');
  });

  it('should allow you to use an empty constructor', () => {
    expect(() => MockIt<Bah>()).not.toThrow(); /* tslint:disable-line:no-unnecessary-callback-wrapper */
  });

  it('should allow you to use an empty constructor', () => {
    const mock = MockIt<Bah>();
    MockIt<Bah>(mock, { bar: () => 'foooo' });
    const result = mock.bar('bye');
    expect(result).toEqual('foooo');
  });
});
