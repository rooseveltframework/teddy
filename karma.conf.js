// Karma configuration

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'teddy.js',
      'node_modules/mocha/mocha.js',
      'test/models/*.js',
      'node_modules/chai/chai.js',
      'node_modules/chai-string/chai-string.js',
      {pattern: 'test/templates/**/*', included: false},
      'test/*.js',
      'test/client.html'
    ],
    reporters: ['progress', 'coverage'],
    port: 8000,
    proxies: {
      '/templates/': '/base/test/templates/',
    },
    preprocessors: {
      'teddy.js': ['coverage']
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
      subdir: function(browser) {
        return browser.toLowerCase().split(/[ /-]/)[0];
      }
    },
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    browsers: ['Chrome'],
    concurrency: 1
  });
};
