function makeModel () {
  var i
  var charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var cl = charList.length
  var model = {
    letters: ['a', 'b', 'c'],
    circular: {},
    foo: '{bar}',
    bar: '{foo}',
    pageContent: '<body>hello</body>',
    undefinedVar: undefined,
    emptyString: '',
    definedParent: { undefinedMember: undefined, emptyMember: '' },
    camelLetters: ['a', 'b', 'c'],
    missingLetter: ['a', undefined, 'c'],
    names: { jack: 'guy', jill: 'girl', hill: 'landscape' },
    objects: [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }],
    missingNumbers: [{ a: undefined, b: undefined, c: undefined }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }],
    objectOfObjects: { one: { a: 1, b: 2, c: 3 }, two: { a: 4, b: 5, c: 6 }, three: { a: 7, b: 8, c: 9 } },
    nestedObjects: [
      {
        num: 1,
        children: [
          'one',
          'two',
          'three'
        ]
      },
      {
        num: 2,
        children: [
          'four',
          'five',
          'six'
        ]
      },
      {
        num: 3,
        children: [
          'seven',
          'eight',
          'nine'
        ]
      }
    ],
    something: 'Some content',
    dynamicValue: 'Some content',
    somethingMore: 'More content',
    somethingElse: true,
    varWithVarInside: 'Variable with a variable inside: {subVar}',
    subVar: 'And another: {something}',
    dynamicInclude: 'misc/variable',
    escapeTest: '<span>raw html</span>',
    doubleFlagEscapeTest: '<h1>double bars</h1> {something}',
    nullVar: null,
    emptyArray: [],
    hello: 'world',
    number: 10,
    nameReference: 'jack',
    4: 'STRING!',
    largeDataSet: [],
    teddyObject: {
      name: 'test'
    },
    teddyNull: null,
    obj: {
      one: {
        prop: 'prop_one',
        other_prop: 'other_prop_one'
      },
      two: {
        prop: 'prop_two',
        other_prop: 'other_prop_two'
      }
    },
    moreNestedObjects: [
      {
        num: 1,
        children: [
          {
            num: 1,
            children: [
              'one',
              'two',
              'three'
            ]
          },
          {
            num: 2,
            children: [
              'four',
              'five',
              'six'
            ]
          },
          {
            num: 3,
            children: [
              'seven',
              'eight',
              'nine'
            ]
          }
        ]
      },
      {
        num: 2,
        children: [
          {
            num: 1,
            children: [
              'one',
              'two',
              'three'
            ]
          },
          {
            num: 2,
            children: [
              'four',
              'five',
              'six'
            ]
          },
          {
            num: 3,
            children: [
              'seven',
              'eight',
              'nine'
            ]
          }
        ]
      },
      {
        num: 3,
        children: [
          {
            num: 1,
            children: [
              'one',
              'two',
              'three'
            ]
          },
          {
            num: 2,
            children: [
              'four',
              'five',
              'six'
            ]
          },
          {
            num: 3,
            children: [
              'seven',
              'eight',
              'nine'
            ]
          }
        ]
      }
    ]
  }

  model.circular.circular = model.circular

  function randChars (n) {
    var i
    var s = ''
    for (i = 0; i < n; i++) {
      s += charList.charAt(Math.floor(Math.random() * cl))
    }
    return s
  }

  for (i = 0; i < 5000; i++) {
    model.largeDataSet.push({
      one: randChars(64),
      two: randChars(64),
      three: randChars(64)
    })
  }

  return model
}

if (typeof module !== 'undefined') {
  module.exports = makeModel
} else {
  var model = makeModel() // eslint-disable-line no-unused-vars
}
