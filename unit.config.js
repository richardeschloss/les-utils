import baseConfig from './ava.config.js'

export default {
  ...baseConfig,
  serial: true,
  files: [
    'test/specs/language.js',
    'test/specs/network.js',
    'test/specs/promise.js',
    'test/specs/rexter.js',
    'test/specs/security.js',
    'test/specs/string.js'
  ]
}
