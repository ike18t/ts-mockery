// Karma configuration
// Generated on Mon Dec 25 2017 20:41:30 GMT-0800 (PST)

module.exports = (config: any) => {
  config.set({
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    colors: true,
    files: [
      'karma-test-shim.ts',
      { pattern: 'lib/**/*.ts' }
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    reporters: ['dots', 'karma-typescript', 'kjhtml'],
    singleRun: true,

    karmaTypescriptConfig: {
      include: [ 'karma-test-shim.ts' ],
      tsconfig: './tsconfig.json'
    }
  });
};
