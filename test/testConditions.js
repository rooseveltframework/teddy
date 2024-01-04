const conditions = [
  {
    describe: 'Conditionals',
    tests: [
      {
        message: 'should evaluate <if something> as true (conditionals/if.html)',
        template: 'if.html',
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate <if something and notDefined> as false (conditionals/and.html)',
        template: 'and.html',
        expected: '<p>and: false</p>'
      }
    ]
  }
]

module.exports = conditions
