module.exports = {
  'roots': [
    '<rootDir>/lib'
  ],
  'transform': {
    '^.+\\.ts$': 'ts-jest'
  },
  'restoreMocks': true,
  'testRegex': '(.*\\.spec)\\.ts$',
  'setupFiles': ['./jest-setup.ts'],
  'moduleFileExtensions': [
    'ts',
    'js',
  ]
}
