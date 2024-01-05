const conditions = [
  {
    describe: 'Conditionals',
    tests: [
      {
        message: 'should evaluate <if something> as true (conditionals/if.html)',
        template: 'conditionals/if.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate <if something and notDefined> as false (conditionals/and.html)',
        test: (teddy, template, model) => teddy.render(template, model),
        template: 'conditionals/and.html',
        expected: '<p>and: false</p>'
      }
    ]
  }
]

module.exports = conditions
