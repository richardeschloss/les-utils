export default {
  require: [],
  serial: false,
  ignoredByWatcher: ['server/downloads', 'localhost.key', 'localhost.crt'],
  files: [
    'test/array.js',
    'test/datetime.js',
    'test/files.js',
    'test/format.js',
    'test/model.js',
    'test/network.js',
    'test/object.js',
    'test/promise.js',
    'test/rexter.js',
    'test/security.js',
    'test/stats.js',
    'test/string.js'
  ],
  tap: false,
  verbose: false
}