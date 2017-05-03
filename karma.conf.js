// Karma configuration

module.exports = function(config) {
  var configuration = {
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'teddy.js',
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
      '/templates/': '/base/test/templates/',
    },
    preprocessors: {
      'teddy.js': ['coverage'],
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
      subdir: function(browser) {
        return browser.toLowerCase().split(/[ /-]/)[0];
      }
    },
    client: {
      mocha: {
        reporter: 'html'
      }
    },
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    browsers: ['Chrome'],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    concurrency: 1
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};
