module.exports = {
  cliOptions: {},
  bundlerCustomizer: (browserify) => browserify.transform('brfs')
}
