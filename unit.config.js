import baseConfig from './ava.config.js'

export default {
  ...baseConfig,
  serial: true,
  files: [
    // 'test/specs/array.js'
    // 'test/specs/datetime.js',
    'test/specs/format.js'
    // 'test/specs/language.js',
    // 'test/specs/network.js',
    // 'test/specs/object.js'
    // 'test/specs/promise.js',
    // 'test/specs/rexter.js',
    // 'test/specs/security.js',
    // 'test/specs/string.js'
  ]
}
