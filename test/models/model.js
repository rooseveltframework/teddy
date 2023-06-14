function makeModel () {
  let i
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const cl = charList.length
  const model = {
    letters: ['a', 'b', 'c'],
    circular: {},
    foo: '{bar}',
    bar: '{foo}',
    pageContent: '<p>hello</p>',
    undefinedVar: undefined,
    emptyString: '',
    zero: 0,
    definedParent: { undefinedMember: undefined, emptyMember: '' },
    camelLetters: ['a', 'b', 'c'],
    missingLetter: ['a', undefined, 'c'],
    coolArray: [
      'one',
      'two',
      '',
      'three'
    ],
    names: { jack: 'guy', jill: 'girl', hill: 'landscape' },
    nameList: [
      'jack',
      'jill',
      'hill'
    ],
    objOfNames: {
      nameList: { jack: 'guy', jill: 'girl', hill: 'landscape' }
    },
    arrayOfNames: [
      {
        jack: 'guy', jill: 'girl', hill: 'landscape'
      }
    ],
    arrayOfNamesTwoMembers: [
      {
        jack: 'guy', jill: 'girl', hill: 'landscape'
      },
      {
        jack: 'man', jill: 'woman', hill: 'scenary'
      }
    ],
    objects: [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }],
    arrays: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
    missingNumbers: [{ a: undefined, b: undefined, c: undefined }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }],
    objectOfObjects: { one: { a: 1, b: 2, c: 3 }, two: { a: 4, b: 5, c: 6 }, three: { a: 7, b: 8, c: 9 } },
    special: {
      number: 2
    },
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
    somethingTrue: true,
    somethingFalse: false,
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
    complexJSONString: '{"content":{"appTitle":"Some App","pageTitle":"{content.appTitle}"},"currentYear":1858,"mainDomain":"localhost:43711","NODE_ENV":"development"}',
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
    nestedObj: {
      'Thing With Name 1': {
        'Subthing With Name 1': [
          'a', 'b', 'c'
        ],
        'Subthing With Name 2': [
          'd', 'e', 'f'
        ],
        'Subthing With Name 3': [
          'g', 'h', 'i'
        ]
      },
      'Thing With Name 2': {
        'Subthing With Name 4': [
          'j', 'k', 'l'
        ],
        'Subthing With Name 5': [
          'm', 'n', 'o'
        ],
        'Subthing With Name 6': [
          'p', 'q', 'r'
        ]
      },
      'Thing With Name 3': {
        'Subthing With Name 7': [
          's', 't', 'u'
        ],
        'Subthing With Name 8': [
          'v', 'w', 'x'
        ],
        'Subthing With Name 9': [
          'y', 'z', '.'
        ]
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
    ],
    moreNestedObjectsWithoutArray: {
      num: 1,
      children: [
        {
          num: 1,
          bool: true,
          children: [
            'one',
            'two',
            'three'
          ]
        },
        {
          num: 2,
          bool: false,
          children: [
            'four',
            'five',
            'six'
          ]
        },
        {
          num: 3,
          bool: true,
          children: [
            'seven',
            'eight',
            'nine'
          ]
        }
      ]
    },
    nestedObjectWithTeddyVars: [
      {
        num: 1,
        children: [
          {
            stuff: '<if something>Something Exists</if>'
          }
        ]
      },
      {
        num: 2,
        children: [
          {
            stuff: '<if something>Something Exists</if>'
          }
        ]
      }
    ],
    objectWithArrayInIt: {
      memberArray: [
        {
          foo: 'value1',
          bar: 'value2'
        },
        {
          baz: 'value3',
          zar: 'value4'
        }
      ]
    }
  }

  function randChars (n) {
    let i
    let s = ''
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
  const model = makeModel() // eslint-disable-line no-unused-vars
}
