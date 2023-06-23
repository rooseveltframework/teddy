/* eslint-env mocha */

if (typeof process === 'object') {
  const chai = require('chai')
  var assert = chai.assert // eslint-disable-line
  const chaiString = require('chai-string')
  var makeModel = require('./models/model') // eslint-disable-line
  var teddy = require('../') // eslint-disable-line
  var model // eslint-disable-line
  var playwright = require('playwright') // eslint-disable-line
  var path = require('path') // eslint-disable-line

  chai.use(chaiString)
}

describe('Misc', function () {
  before(function () {
    teddy.setTemplateRoot('test/templates')
    model = makeModel()
    if (typeof process === 'object') {
      if (process.env.NODE_ENV === 'test') {
        teddy.setVerbosity(0)
      } else if (process.env.NODE_ENV === 'cover') {
        teddy.setVerbosity(3)
      }
    }
  })

  it('should not escape HTML entities present in {variables} which are properly {flagged|p|s} (misc/barPandSTest.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/barPandSTest.html', model), '<h1>double bars</h1> {something}')
  })

  it('should not escape HTML entities present in {variables} which are properly {flagged|s|p} (misc/barSandPTest.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/barSandPTest.html', model), '<h1>double bars</h1> {something}')
  })

  it('should render {variables} (misc/variable.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/variable.html', model), '<p>Some content</p>')
  })

  it('should render multiple {variables} (misc/multipleVariables.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/multipleVariables.html', model), '<p>Some content</p> <h5>More content</h5>')
  })

  it('should render nested {variables} (misc/nestedVars.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/nestedVars.html', model), '<p>Variable with a variable inside: And another: Some content</p>')
  })

  it('should not render nested {variables|p} (misc/nestedVarsParseFlag.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/nestedVarsParseFlag.html', model), '<p>Variable with a variable inside: {subVar}</p>')
  })

  it('should properly escape HTML entities present in {variables} (misc/varEscaping.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/varEscaping.html', model), '<p>&lt;span&gt;raw html&lt;/span&gt;</p>')
  })

  it('should not escape HTML entities present in {variables} which are properly {flagged|s} (misc/varNoEscaping.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/varNoEscaping.html', model), '<div><span>raw html</span></div>')
  })

  it('should not parse any code in <noteddy> tags (misc/varNoParsing.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/varNoParsing.html', model), '<p>{escapeTest}</p>')
  })

  it('should remove {! server side comments !} (misc/serverSideComments.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/serverSideComments.html', model), '<p>test test</p>')
  })

  // #27 and #43
  it('should remove {! {! nested !} server side comments !} (misc/serverSideCommentsNested.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/serverSideCommentsNested.html', model), '<p>Any comments? </p>')
  })

  it('should not break when referencing objects that don\'t exist (misc/objectDoesNotExist.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/objectDoesNotExist.html', model), ' <p>{doesntExist.someKey}</p> <p class="false"></p>')
  })

  it('should render plain HTML with no teddy tags with no changes (misc/plainHTML.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/plainHTML.html', model), '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="format-detection" content="telephone=no"><title>Plain HTML</title><link rel="stylesheet" href="/css/styles.css"></head><body><main><p>This template contains no teddy tags. Just HTML.</p></main><script type="text/javascript" src="/js/main.js"></script></body></html>')
  })

  it('should render {variables} within style element (misc/styleVariables.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/styleVariables.html', model), '<style>p{height:10px;}</style>')
  })

  it('should access property of {variable} object with {variable} (misc/variableObjectProperty.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/variableObjectProperty.html', model), '<p>guy</p>')
  })

  it('should escape curly braces from regex pattern (misc/regexEscaping.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/regexEscaping.html', model), '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">')
  })

  // TODO: fix this test; it works in node tests but breaks karma tests for some reason
  it.skip('should render emojis correctly (misc/emojis.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/emojis.html', model), '<p>🎉🥳🎈🎊</p>')
  })

  it('should cache the contents of the cache element but not anything outside of it (misc/cacheElement.html)', async function () {
    function timeout (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    // these will be cached
    const render1 = teddy.render('misc/cacheElement.html', { user: 'Joe', city: 'NY', value: 30 })
    assert.equalIgnoreSpaces(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
    await timeout(100)

    const render2 = teddy.render('misc/cacheElement.html', { user: 'Bob', city: 'SF', value: 60 })
    assert.equalIgnoreSpaces(render2, '<p>Dynamic: Welcome Bob!</p><p>Cached: High temperature today in SF is 60.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
    await timeout(100)

    const render3 = teddy.render('misc/cacheElement.html', { user: 'Moe', city: 'LA', value: 80 })
    assert.equalIgnoreSpaces(render3, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in LA is 80.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
    await timeout(100)

    // will display from cache
    const render4 = teddy.render('misc/cacheElement.html', { user: 'Sue', city: 'NY', value: 300 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
    await timeout(100)

    const render5 = teddy.render('misc/cacheElement.html', { user: 'Jay', city: 'SF', value: 600 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render5, '<p>Dynamic: Welcome Jay!</p><p>Cached: High temperature today in SF is 60.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
    await timeout(100)

    const render6 = teddy.render('misc/cacheElement.html', { user: 'Mae', city: 'LA', value: 800 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render6, '<p>Dynamic: Welcome Mae!</p><p>Cached: High temperature today in LA is 80.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
    await timeout(100)

    // should drop NY and replace it with NOLA due to max caches being 3 and NY being the least recently accessed
    const render7 = teddy.render('misc/cacheElement.html', { name: 'weather', user: 'Liz', city: 'NOLA', value: 90 })
    assert.equalIgnoreSpaces(render7, '<p>Dynamic: Welcome Liz!</p><p>Cached: High temperature today in NOLA is 90.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NOLA.markup, '<p>Cached: High temperature today in NOLA is 90.</p>')
    const missingNY = !teddy.caches.weather.entries.NY
    assert.equal(missingNY, true)

    // see if deleting SF from the city cache works
    teddy.clearCache('weather', 'SF')
    const missingSF = !teddy.caches.weather.entries.SF
    assert.equal(missingSF, true)

    // see if deleting entire city cache works
    teddy.clearCache('weather')
    const missingAll = !teddy.caches.weather
    assert.equal(missingAll, true)
  })

  it('should render cache element correctly with dynamic attributes (misc/cacheElementDynamicAttrs.html)', async function () {
    function timeout (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    // these will be cached
    const render1 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Joe', city: 'NY', value: 30 })
    assert.equalIgnoreSpaces(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
    await timeout(100)

    const render2 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Bob', city: 'SF', value: 60 })
    assert.equalIgnoreSpaces(render2, '<p>Dynamic: Welcome Bob!</p><p>Cached: High temperature today in SF is 60.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
    await timeout(100)

    const render3 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Moe', city: 'LA', value: 80 })
    assert.equalIgnoreSpaces(render3, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in LA is 80.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
    await timeout(100)

    // will display from cache
    const render4 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Sue', city: 'NY', value: 300 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
    await timeout(100)

    const render5 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Jay', city: 'SF', value: 600 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render5, '<p>Dynamic: Welcome Jay!</p><p>Cached: High temperature today in SF is 60.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
    await timeout(100)

    const render6 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Mae', city: 'LA', value: 800 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render6, '<p>Dynamic: Welcome Mae!</p><p>Cached: High temperature today in LA is 80.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
    await timeout(100)

    // should drop NY and replace it with NOLA due to max caches being 3 and NY being the least recently accessed
    const render7 = teddy.render('misc/cacheElementDynamicAttrs.html', { name: 'weather', key: 'city', user: 'Liz', city: 'NOLA', value: 90 })
    assert.equalIgnoreSpaces(render7, '<p>Dynamic: Welcome Liz!</p><p>Cached: High temperature today in NOLA is 90.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NOLA.markup, '<p>Cached: High temperature today in NOLA is 90.</p>')
    const missingNY = !teddy.caches.weather.entries.NY
    assert.equal(missingNY, true)

    // see if deleting SF from the city cache works
    teddy.clearCache('weather', 'SF')
    const missingSF = !teddy.caches.weather.entries.SF
    assert.equal(missingSF, true)

    // see if deleting entire city cache works
    teddy.clearCache('weather')
    const missingAll = !teddy.caches.weather
    assert.equal(missingAll, true)
  })

  it('should render cache element correctly with dynamic attributes (misc/cacheElementDynamicAttrsNested.html)', async function () {
    function timeout (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }

    // these will be cached
    const render1 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Joe', city: { acronym: 'NY' }, value: 30 })
    assert.equalIgnoreSpaces(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
    await timeout(100)

    const render2 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Bob', city: { acronym: 'SF' }, value: 60 })
    assert.equalIgnoreSpaces(render2, '<p>Dynamic: Welcome Bob!</p><p>Cached: High temperature today in SF is 60.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
    await timeout(100)

    const render3 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Moe', city: { acronym: 'LA' }, value: 80 })
    assert.equalIgnoreSpaces(render3, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in LA is 80.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
    await timeout(100)

    // will display from cache
    const render4 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Sue', city: { acronym: 'NY' }, value: 300 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
    await timeout(100)

    const render5 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Jay', city: { acronym: 'SF' }, value: 600 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render5, '<p>Dynamic: Welcome Jay!</p><p>Cached: High temperature today in SF is 60.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
    await timeout(100)

    const render6 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Mae', city: { acronym: 'LA' }, value: 800 }) // new temperature value should not print because old value is cached
    assert.equalIgnoreSpaces(render6, '<p>Dynamic: Welcome Mae!</p><p>Cached: High temperature today in LA is 80.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
    await timeout(100)

    // should drop NY and replace it with NOLA due to max caches being 3 and NY being the least recently accessed
    const render7 = teddy.render('misc/cacheElementDynamicAttrsNested.html', { name: 'weather', key: 'city.acronym', user: 'Liz', city: { acronym: 'NOLA' }, value: 90 })
    assert.equalIgnoreSpaces(render7, '<p>Dynamic: Welcome Liz!</p><p>Cached: High temperature today in NOLA is 90.</p>')
    assert.equalIgnoreSpaces(teddy.caches.weather.entries.NOLA.markup, '<p>Cached: High temperature today in NOLA is 90.</p>')
    const missingNY = !teddy.caches.weather.entries.NY
    assert.equal(missingNY, true)

    // see if deleting SF from the city cache works
    teddy.clearCache('weather', 'SF')
    const missingSF = !teddy.caches.weather.entries.SF
    assert.equal(missingSF, true)

    // see if deleting entire city cache works
    teddy.clearCache('weather')
    const missingAll = !teddy.caches.weather
    assert.equal(missingAll, true)
  })

  it('should avoid rendering templates that are not strings', function () {
    assert.equalIgnoreSpaces(teddy.render(5, model), '')
  })

  it('should render a template with missing or invalid model (misc/emptyModelMarkup.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/emptyModelMarkup.html', 1), '<div><p>Hello</p></div>')
  })

  it('should not render {variables} that don\'t exist in the model (misc/varNotInModel.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/varNotInModel.html', model), '{noExist}')
  })

  it('should set each verbosity level', function () {
    let verbosity = ''
    teddy.setVerbosity()
    verbosity += teddy.params.verbosity + ', '
    teddy.setVerbosity('none')
    verbosity += teddy.params.verbosity + ', '
    teddy.setVerbosity(0)
    verbosity += teddy.params.verbosity + ', '
    teddy.setVerbosity('verbose')
    verbosity += teddy.params.verbosity + ', '
    teddy.setVerbosity(2)
    verbosity += teddy.params.verbosity + ', '
    teddy.setVerbosity('DEBUG')
    verbosity += teddy.params.verbosity + ', '
    teddy.setVerbosity(3)
    verbosity += teddy.params.verbosity

    assert.strictEqual(verbosity, '1, 0, 0, 2, 2, 3, 3')
    verbosity = ''
    if (typeof process === 'object') {
      if (process.env.NODE_ENV === 'test') {
        teddy.setVerbosity(0)
      } else if (process.env.NODE_ENV === 'cover') {
        teddy.setVerbosity(3)
      }
    } else {
      teddy.setVerbosity(0)
    }
  })

  it('should render undefined variables as text (misc/undefinedVar.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/undefinedVar.html', model), '<p>{undefinedVar}</p><p>{definedParent.undefinedMember}</p>')
  })

  it('should prevent infinitely referencing variables (misc/varRefVar.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/varRefVar.html', model), '{foo}')
  })

  it('should render empty strings as is for variables that are empty strings (misc/emptyStringVariable.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/emptyStringVariable.html', model), '<p></p><p></p>')
  })

  it('should render template with extraneous whitespace properly (misc/extraneousWhitespace.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/extraneousWhitespace.html', model), '<p>a</p><p>Something exists</p><p>b</p><p>Something exists</p><p>c</p><p>Something exists</p>')
  })

  it('should render {variables} that resolve to true or false boolean literals as strings (misc/printBooleanLiteral.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/printBooleanLiteral.html', model), '<p>true</p><p>{somethingFalse}</p>')
  })

  it('should render {zero} as 0 (misc/zero.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/zero.html', model), '<p>0</p>')
  })

  it('should not render Teddy code in server-side comments in loops (misc/serverSideCommentsWithTeddyCode.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('misc/serverSideCommentsWithTeddyCode.html', model), '<div><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p></div>')
  })

  if (typeof process === 'object') {
    ['chromium', 'firefox'].forEach(function (browserType) {
      describe(`playground.html - ${browserType}`, function () {
        let page, browser, context
        beforeEach(async function () {
          this.timeout(0) // browsers (specifically firefox) needed a little extra time to launch
          browser = await playwright[browserType].launch()
          context = await browser.newContext()
          page = await context.newPage()
          await page.goto(`file:${path.join(__dirname, '..', 'playground.html')}`)
        })
        afterEach(async function () {
          await browser.close()
        })

        it('should render example template', async function () {
          await page.click('#render')
          const renderedFrame = await page.$('#renderedframe')
          const text = await page.evaluate(el => {
            const iframedocument = el.contentDocument || el.contentWindow.document
            return iframedocument.body.innerHTML
          }, renderedFrame)
          assert.equalIgnoreSpaces(text, '<p>hello world!</p><p>no blah!</p>')
        })

        it('should render the provided input', async function () {
          await page.fill('#src', '<p>This is an inputted template. The model will fill in {input}.</p>')
          await page.fill('#json', '{"input":"this"}')
          await page.click('#render')
          const renderedFrame = await page.$('#renderedframe')
          const text = await page.evaluate(el => {
            const iframedocument = el.contentDocument || el.contentWindow.document
            return iframedocument.body.innerHTML
          }, renderedFrame)
          assert.equalIgnoreSpaces(text, '<p>This is an inputted template. The model will fill in this.</p>')
        })
      })
    })
  }
})
