export default [
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
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition (conditionals/ifElse.html)',
        template: 'conditionals/ifElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <if something=\'Some content\'> as true (conditionals/ifValue.html)',
        template: 'conditionals/ifValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is set to \'Some content\'</p>'
      },
      {
        message: 'should evaluate <if emptyArray> as false (conditionals/ifEmptyArray.html)',
        template: 'conditionals/ifEmptyArray.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'emptyArray\' is considered falsey</p>'
      },
      {
        message: 'should evaluate <if something=\'no\'> as false and trigger <else> condition (conditionals/ifElseValue.html)',
        template: 'conditionals/ifElseValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is not set to \'no\'</p>'
      }
    ]
  }
]
