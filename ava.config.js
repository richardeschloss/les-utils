export default {
  require: [],
  serial: false,
  ignoredByWatcher: ['server/downloads', 'localhost.key', 'localhost.crt', 'noext*'],
  files: ['test/*.js'],
  tap: false,
  verbose: true,
  watch: true,
  timeout: '10m'
}