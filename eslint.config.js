import mocha from 'eslint-plugin-mocha'

export default [
  {
    plugins: {
      mocha
    },
    rules: {
      'mocha/no-exclusive-tests': 'error'
    }
  }
]
