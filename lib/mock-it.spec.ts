import { MockIt } from './mock-it';

describe('MockIt', () => {
  it('should do stuff', () => {
    class Bah {
      foo: string;
      bar = (buzz: string) => buzz.toUpperCase();
    }
    const hi = MockIt<Bah>({ bar: () => 'hi' });
    hi.bar('bye');
    expect(hi.bar).toHaveBeenCalledWith('bye');
  });
});
