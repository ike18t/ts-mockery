module.exports = {
  'roots': [
    '<rootDir>/lib'
  ],
  'transform': {
    '^.+\\.ts$': 'ts-jest'
  },
  'testRegex': '(.*\\.spec)\\.ts$',
  'setupFiles': ['./jest-setup.ts'],
  'moduleFileExtensions': [
    'ts',
    'js',
  ]
}
