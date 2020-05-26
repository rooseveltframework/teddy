// Karma configuration
module.exports = function (config) {
  // default browsers to test on
  const testBrowsers = [
    'ChromeHeadless',
    'FirefoxHeadless'
  ]

  const configuration = {
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'dist/teddy.js',
      'test/models/*.js',
      'node_modules/chai/chai.js',
      'node_modules/chai-string/chai-string.js',
      'test/templates/**/*',
      'test/*.js',
      'test/client.html'
    ],
    reporters: ['spec', 'coverage'],
    port: 8000,
    proxies: {
      '/templates/': '/base/test/templates/'
    },
    preprocessors: {
      'dist/teddy.js': ['coverage'],
      'test/templates/**/*': ['html2js']
    },
    html2JsPreprocessor: {
      stripPrefix: 'test/templates/'
    },
    specReporter: {
      maxLogLines: 5,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: false,
      suppressSkipped: false,
      showSpecTiming: true
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
      subdir: function (browser) {
        return browser.toLowerCase().split(/[ /-]/)[0]
      }
    },
    client: {
      mocha: {
        timeout: 5000,
        reporter: 'html'
      }
    },
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    browsers: testBrowsers,
    concurrency: 1
  }

  config.set(configuration)
}
