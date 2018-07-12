import { SpyAdapter } from './spy-adapter';

export class NoopAdapter implements SpyAdapter {
  getSpy() {
    return;
  }

  spyAndCallFake() {
    return;
  }

  spyAndCallThrough() {
    return;
  }
}
