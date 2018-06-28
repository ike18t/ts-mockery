import { JasmineAdapter } from './spy-adapters/jasmine-adapter';
import { JestAdapter } from './spy-adapters/jest-adapter';
import { NoopAdapter } from './spy-adapters/noop-adapter';
import { SpyAdapter } from './spy-adapters/spy-adapter';

export class SpyAdapterFactory {
  static get(framework: 'jasmine' | 'jest' | 'noop'): SpyAdapter {
    return new this.frameworks[framework]();
  }

  private static readonly frameworks = {
    jasmine: JasmineAdapter,
    jest: JestAdapter,
    noop: NoopAdapter
  };

}
