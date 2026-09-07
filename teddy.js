// #region globals

import fs from 'fs' // node filesystem module
import path from 'path' // node path module
import { load as cheerioLoad } from 'cheerio/slim' // dom parser
import { createCompiler } from './compiler.js' // walks a template once so a render does not have to
import { canEmit, emit } from './codegen.js' // turns what the compiler worked out into javascript; browser builds swap this for a stub
import { encode, decode, FORMAT } from './precompiled.js' // reads and writes the data a template compiled ahead of time carries

const cheerioOptions = { lowerCaseAttributeNames: false, decodeEntities: false }
const browser = cheerioLoad.isCheerioPolyfill // true if we are executing in the browser context
const params = {} // teddy parameters
setDefaultParams() // set params to the defaults
let templates = {} // templates registered by hand with setTemplate, e.g. { "myTemplate.html": "<p>some markup</p>"}; this is how templates reach the browser, where there is no filesystem to read them from
let fileCache = {} // templates that were read from the filesystem, kept only when template caching is switched on
let compiledCache = new Map() // node trees built by the compiler, kept on the same terms as fileCache: only when template caching is switched on, so that editing a template still takes effect without a restart
const maxCompiledCache = 10000 // a caller that renders markup passed in as a string rather than by name must not grow this without bound
const caches = {} // a place to store cached portions of templates
// building a regular expression costs far more than using one, and a loop substitutes the same variables out of the same body on every iteration, so the patterns are compiled once and kept
const varPatterns = new Map()
function varPattern (source, escape) {
  const key = escape ? source : '\u0000raw:' + source
  let pattern = varPatterns.get(key)
  if (pattern === undefined) {
    pattern = new RegExp(escape ? source.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d') : source, 'i')
    if (varPatterns.size > 10000) varPatterns.clear() // a model that invents variable names without bound must not grow this forever
    varPatterns.set(key, pattern)
  }
  return pattern
}
const templateCaches = {} // a place to store cached full templates

// #endregion

// #region private methods

// resolves a template to its markup:
// a template may be the markup itself, the name of a template registered with setTemplate, or the path of a file to read
// returns null when a name is neither registered nor readable, so that callers can tell a template that is missing apart from one that legitimately rendered to nothing
function loadTemplate (template) {
  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) console.warn('teddy.loadTemplate attempted to load a template which is not a string.')
    return null
  }

  // markup passed in directly rather than a name to look up
  if (template.includes('<')) return removeTeddyComments(template)

  const name = template
  const withExtension = name.slice(-5) === '.html' ? name : name + '.html'

  // a template registered by hand wins over anything on the filesystem, which is what makes the same template work in the browser
  for (const key of [name, withExtension]) {
    if (typeof templates[key] === 'string') return removeTeddyComments(templates[key])
  }

  // then whatever was read from the filesystem last time, if the caller asked for templates to be cached
  if (params.cacheTemplates && typeof fileCache[name] === 'string') return fileCache[name]

  // then the filesystem itself
  if (fs && fs.readFileSync) {
    for (const candidate of [withExtension, params.templateRoot + withExtension, params.templateRoot + '/' + withExtension]) {
      let contents
      try {
        contents = fs.readFileSync(candidate, 'utf8')
      } catch (e) {
        continue // try the next place it might be
      }
      contents = removeTeddyComments(contents)
      if (params.cacheTemplates) fileCache[name] = contents
      return contents
    }
  }

  return null // it is not a registered template and there is no file by that name
}

// remove teddy {! comments !} and <!--! comments -->; also replace <escape>tags</escape> and <!--# content -->
function removeTeddyComments (renderedTemplate) {
  let oldTemplate
  do {
    oldTemplate = renderedTemplate
    let vars

    // server-side comments
    try {
      vars = matchByDelimiter(renderedTemplate, '{!', '!}')
    } catch (e) {
      return renderedTemplate // it will match {! comments {! with comments in them !} !} but if there are unbalanced brackets, just return the original text
    }
    for (let i = 0; i < vars.length; i++) renderedTemplate = renderedTemplate.replace(`{!${vars[i]}!}`, '')

    try {
      vars = matchByDelimiter(renderedTemplate, '<!--!', '-->')
    } catch (e) {
      return renderedTemplate
    }
    for (let i = 0; i < vars.length; i++) renderedTemplate = renderedTemplate.replace(`<!--!${vars[i]}-->`, '')

    // <!--# escape --> blocks and <escape> tags
    let firstMatch
    try {
      firstMatch = getFirstMatchByDelimiters(renderedTemplate, [['<!--#', '-->'], ['<escape>', '</escape>']])
    } catch (e) {
      return renderedTemplate
    }
    let newContent = firstMatch
    if (firstMatch) {
      if (firstMatch.startsWith('<!--#')) {
        newContent = newContent.substring(0, newContent.length - 3).slice(5)
        renderedTemplate = renderedTemplate.replace(firstMatch, escapeEntities(newContent.trim()))
      } else {
        newContent = newContent.substring(0, newContent.length - 9).slice(8)
        renderedTemplate = renderedTemplate.replace(firstMatch, escapeEntities(newContent.trim()))
      }
    }
  } while (oldTemplate !== renderedTemplate)
  return renderedTemplate
}

// evaluates a single <if> or <unless> tag
function evaluateConditional (conditions, model, values) {
  const conditionsLength = conditions.length
  // loop through conditions and reduce them to booleans
  for (let i = 0; i < conditionsLength; i++) {
    const condition = conditions[i]
    if (typeof condition === 'boolean') continue // if the condition is already a boolean then we don't need to reduce it to a boolean to evaluate it
    // reject conditions with invalid formatting
    if (condition.startsWith('=') || condition.endsWith('=')) {
      if (params.verbosity > 1) console.warn('teddy encountered a conditional statement with "=" at the beginning or end of a condition.')
      return false
    }
    if (condition.includes(':') && !condition.startsWith('not:')) {
      if (params.verbosity > 1) console.warn('teddy encountered a conditional statement with a "not:" that isn\'t at the beginning of a condition.')
      return false
    }
    // deal with boolean logic
    if (condition === 'and') {
      if (conditions[i - 1] && evaluateCondition(conditions[i + 1], model, values, i + 1)) {
        // if both sides of an and are true, then reduce all 3 condition blocks to true
        conditions[i - 1] = true
        conditions[i] = true
        conditions[i + 1] = true
      } else {
        // if either side of an and is false, then reduce all 3 condition blocks to false
        conditions[i - 1] = false
        conditions[i] = false
        conditions[i + 1] = false
      }
    } else if (condition === 'or') {
      if (conditions[i - 1] || evaluateCondition(conditions[i + 1], model, values, i + 1)) {
        // if either side of an or is true, then reduce all 3 condition blocks to true, as well as all condition blocks that preceded this or
        conditions.fill(true, 0, i + 2)
      } else {
        // if both sides of an or are false, then reduce all 3 condition blocks to false
        conditions[i - 1] = false
        conditions[i] = false
        conditions[i + 1] = false
      }
    } else if (condition === 'xor') {
      if (!!conditions[i - 1] === !!evaluateCondition(conditions[i + 1], model, values, i + 1)) {
        // if both sides of an xor are equal to each other, then reduce all 3 condition blocks to false
        conditions[i - 1] = false
        conditions[i] = false
        conditions[i + 1] = false
      } else {
        // if the two sides of an xor are not equal to each other, then reduce all 3 condition blocks to true
        conditions[i - 1] = true
        conditions[i] = true
        conditions[i + 1] = true
      }
    } else conditions[i] = evaluateCondition(condition, model, values, i)
  }
  return conditions.every(item => item === true) || false // if any of the booleans are false, then return false. otherwise return true
}

// the name a condition looks up in the model, or null when it is a boolean operator rather than a condition. this is the same for every render, so a compiled template works it out once and hands the looked up value in rather than having the lookup done again here
function conditionPath (condition) {
  if (typeof condition !== 'string') return null
  if (condition === 'and' || condition === 'or' || condition === 'xor') return null
  let path = condition.startsWith('not:') ? condition.slice(4) : condition
  const equals = path.indexOf('=')
  if (equals !== -1) path = path.slice(0, equals)
  return path
}

// determines whether a single condition in a teddy conditional is true or false
//
// values, when given, holds what each condition looks up already looked up, which is how a compiled template avoids splitting a dotted name apart on every render
function evaluateCondition (condition, model, values, index) {
  let not // stores whether the :not modifier is present
  if (typeof condition === 'string' && condition.includes('=')) { // it's an equality check condition
    not = !!condition.startsWith('not:') // true if "not:" is present
    if (not) condition = condition.slice(4) // remove the :not prefix
    const parts = condition.split('=') // something="Some content"
    const cond = parts[0] // something
    delete parts[0] // remove the something=
    const val = parts.join('') // "Some content" — the path.join method ensures the string gets rebuilt even if it contains another = character
    const lookup = values ? values[index] : getOrSetObjectByDotNotation(model, cond)
    // the == is necessary because teddy does type-insensitive equality checks
    if (lookup == val) return !not // eslint-disable-line
    else return not // false
  } else { // it's a presence check
    not = typeof condition === 'string' ? !!condition.startsWith('not:') : false // true if "not:" is present
    if (not) condition = condition.slice(4) // remove the :not prefix
    const lookup = values ? values[index] : getOrSetObjectByDotNotation(model, condition)
    if (lookup) {
      if (typeof lookup === 'object' && Object.keys(lookup).length === 0) return not // false; empty object or array
      return !not // true; var is present
    } else return not // false; var is not present
  }
}

// render {variables}
function parseVars (templateString, model) {
  let vars
  try {
    vars = matchByDelimiter(templateString, '{', '}')
  } catch (e) {
    return templateString // it will match {vars{withVarsInThem}} but if there are unbalanced brackets, just return the original text
  }
  for (let i = 0; i < vars.length; i++) {
    let match = vars[i]
    if (match === '') continue // empty {}
    if (!/^(\d+|[a-zA-Z_$][a-zA-Z0-9_$|{}.-]*(\.[a-zA-Z_$][a-zA-Z0-9_$|{}.-]*)*)$/.test(match)) {
      if (params.verbosity > 2) console.warn(`teddy.parseVars encountered a {variable} that could not be parsed: {${match}}`)
      continue // skip invalid variables
    }
    if (match.includes('{')) {
      // there's a variable inside the variable name
      const originalMatch = match
      match = parseVars(match, model)
      try {
        templateString = templateString.replace(varPattern(`\${${originalMatch}}`, true), () => `\${${match}}`)
        templateString = templateString.replace(varPattern(`{${originalMatch}}`, true), () => `{${match}}`)
      } catch (e) {
        if (params.verbosity > 2) console.warn(`teddy.parseVars encountered a {variable} that could not be parsed: {${originalMatch}}`)
      }
    }
    const resolved = resolveVariable(match, model)
    if (!resolved) continue // the variable resolves to nothing that should be written, so it is left in the markup verbatim
    const { name, text, skipTemplateLiteralReplacement } = resolved
    try {
      if (!skipTemplateLiteralReplacement) templateString = templateString.replace(varPattern(`\${${name}}`, true), () => text)
      templateString = templateString.replace(varPattern(`{${name}}`, true), () => text)
    } catch (e) {
      return templateString
    }
  }
  return templateString
}

// works out what a single {variable} should be replaced with, given its name and any flags on it
//
// this is shared by the interpreter above and by the compiler, which walks a template once and keeps a slot for every variable rather than rescanning the markup for it. the rules it implements are not obvious: a value of false or null resolves to the variable's own text, 0 writes as "0" when escaped but resolves to its own text when raw, an object writes as [Object] when escaped and as its own toString when raw, and |h blanks all of them. having one implementation of that is the only way the two paths can be relied on to agree
//
// returns null when nothing should be substituted, or { name, text, skipTemplateLiteralReplacement } where name is the variable without its flags and text is what to write
function resolveVariable (match, model) {
  const flags = variableFlags(match)
  return formatVariable(flags, getOrSetObjectByDotNotation(model, flags.name), model)
}

// which flags a {variable} carries and what its name is without them, worked out from the name alone. this is the same for every render of a template, so a compiled template settles it once rather than reading the last x characters of the name on every render
function variableFlags (match) {
  const lastSixChars = match.slice(-6)
  const flagCount = lastSixChars.split('|').length - 1
  const noparse = lastSixChars.includes('|p')
  const raw = !noparse && lastSixChars.includes('|s')
  return {
    match,
    name: noparse || raw ? match.substring(0, match.length - flagCount * 2) : match,
    noparse,
    raw,
    hide: lastSixChars.includes('|h'),
    display: lastSixChars.includes('|d')
  }
}

// what a variable writes, given its flags and the value the model had for it
//
// the rules here are not obvious: a value of false or null resolves to the variable's own text, 0 writes as "0" when escaped but resolves to its own text when raw, an object writes as [Object] when escaped and as its own toString when raw, and |h blanks all of them. this is the one place they are implemented, so every caller agrees about them
//
// returns null when nothing should be substituted, or { name, text, skipTemplateLiteralReplacement } where name is the variable as written and text is what to write
function formatVariable (flags, value, model) {
  const { match, noparse, raw, hide, display } = flags
  let parsed = value

  if (noparse) {
    if (!parsed && !display && (params.emptyVarBehavior === 'hide' || hide)) parsed = '' // display empty string instead of the variable text verbatim if this setting is set
    if (typeof parsed === 'string' && parsed.startsWith('{') && parsed.includes('|d')) parsed = parsed.replace('|d', '')
    if (!parsed && parsed !== '') return null
    const id = model._noTeddyBlocks.push(parsed) - 1
    return { name: match, text: `<noteddy id="${id}"></noteddy>`, skipTemplateLiteralReplacement: false }
  }

  let skipTemplateLiteralReplacement = false
  if (raw) {
    if (!parsed && !display && (params.emptyVarBehavior === 'hide' || hide)) parsed = '' // display empty string instead of the variable text verbatim if this setting is set
    else if (!parsed && parsed !== '') {
      skipTemplateLiteralReplacement = true
      parsed = `{${match}}`
    }
  } else {
    if (!parsed && !display && (params.emptyVarBehavior === 'hide' || hide)) parsed = '' // display empty string instead of the variable text verbatim if this setting is set
    else if (parsed || parsed === '') parsed = escapeEntities(parsed)
    else if (parsed === 0) parsed = '0'
    else {
      skipTemplateLiteralReplacement = true
      parsed = `{${match}}`
    }
  }
  if (typeof parsed === 'string' && parsed.startsWith('{') && parsed.includes('|d')) parsed = parsed.replace('|d', '')
  return { name: match, text: parsed, skipTemplateLiteralReplacement }
}

// escapes sensitive characters to prevent xss
const escapeHtmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
}
// the same replacements again, indexed by character code, so that finding one costs no comparisons and builds no single character string to compare against
const escapeHtmlEntitiesByCode = []
for (const character of Object.keys(escapeHtmlEntities)) escapeHtmlEntitiesByCode[character.charCodeAt(0)] = escapeHtmlEntities[character]

const needsEscaping = /[&<>"']/g // most values have nothing in them that needs escaping, and one scan settles that
function escapeEntities (value) {
  if (typeof value === 'object') { // cannot escape on this value
    if (!value) return false // it is falsy to return false
    else if (Array.isArray(value)) {
      if (value.length === 0) return false // empty arrays are falsy
      else return '[Array]' // print that it is an array with content in it, but do not print the contents
    }
    return '[Object]' // just print that it is an object, do not print the contents
  } else if (value === undefined) return false // cannot escape on this value; undefined is falsy
  else if (typeof value === 'boolean' || typeof value === 'number') return value // cannot escape on these values; if it's already a boolean or a number just return it

  // the regular expression engine finds the entities, which it does far faster than stepping through the value in javascript, and the stretches between them are copied a piece at a time rather than a character at a time. one pass over the value either way, and a value with nothing to escape is returned as it came in
  needsEscaping.lastIndex = 0
  let match = needsEscaping.exec(value)
  if (match === null) return value

  let escaped = ''
  let copiedTo = 0
  do {
    escaped += value.slice(copiedTo, match.index) + escapeHtmlEntitiesByCode[value.charCodeAt(match.index)]
    copiedTo = match.index + 1
    match = needsEscaping.exec(value)
  } while (match !== null)

  return escaped + value.slice(copiedTo)
}

// if an entity is double-encoded, this will fix that
function reverseDoubleEncodedEntities (str) {
  return str.replace(/&amp;(#\d+;|#x[0-9A-Fa-f]+;|[A-Za-z]+;)/g, '&$1')
}

// match strings by a custom delimiter
function matchByDelimiter (input, openDelimiter, closeDelimiter) {
  const stack = []
  const result = []
  const openLength = openDelimiter.length
  const closeLength = closeDelimiter.length
  for (let i = 0; i < input.length; i++) {
    if (input.substring(i, i + openLength) === openDelimiter) {
      stack.push(i + openLength)
      i += openLength - 1
    } else if (input.substring(i, i + closeLength) === closeDelimiter) {
      const start = stack.pop()
      if (stack.length === 0) result.push(input.substring(start, i))
      i += closeLength - 1
    }
  }

  return result
}

function getFirstMatchByDelimiters (str, delimiters) {
  const openers = []
  const closers = []
  for (const delimiter of delimiters) {
    openers.push(delimiter[0])
    closers.push(delimiter[1])
  }
  const currentlyOpenBrackets = {}
  let currentDelimiter = -1
  let match = ''

  for (let charIndex = 0; charIndex < str.length; charIndex++) {
    for (let delimiterIndex = 0; delimiterIndex < openers.length; delimiterIndex++) {
      if (currentDelimiter < 0 || currentDelimiter === delimiterIndex) {
        const opener = openers[delimiterIndex]
        const openerLength = opener.length
        const closer = closers[delimiterIndex]
        const closerLength = closer.length
        let chunk = str.substring(charIndex, charIndex + openerLength)
        if (chunk === opener) {
          if (!currentlyOpenBrackets[opener]) {
            match = opener.slice(0, -1)
            currentlyOpenBrackets[opener] = 1
            currentDelimiter = delimiterIndex
            charIndex = charIndex + openerLength - 1 // move the loop ahead beyond the delimiter
          } else {
            currentlyOpenBrackets[opener]++
          }
        } else {
          chunk = str.substring(charIndex, charIndex + closerLength)
          if (chunk === closer) {
            if (currentlyOpenBrackets[opener]) {
              if (currentlyOpenBrackets[opener] > 1) currentlyOpenBrackets[opener]-- // they're nested; keep going
              else if (currentlyOpenBrackets[opener] === 1) {
                match += closer
                return match
              }
            }
          }
        }
        if (currentlyOpenBrackets[opener]) match += str.charAt(charIndex)
      }
    }
  }

  return match
}

// gets or sets an object by dot notation, e.g. thing.nestedThing.furtherNestedThing: two arguments gets, three arguments sets
function getOrSetObjectByDotNotation (obj, dotNotation, value) {
  if (!obj) return false
  if (!dotNotation || typeof dotNotation === 'boolean' || typeof dotNotation === 'number') return dotNotation
  if (typeof dotNotation === 'string') return getOrSetObjectByDotNotation(obj, dotNotation.split('.'), value)
  else if (dotNotation.length === 1 && value !== undefined) {
    // a lookup is case insensitive, so a key that differs from this one only in case has to go: leaving both in place means which one a later lookup finds depends on the order the keys happen to be in. this matters most for <include> <arg> names, because the browser lowercases attribute names and cheerio does not, so an <arg camelCase> would otherwise sit next to a model key of the same name in a different case
    //
    // only a key this object owns is ambiguous with the one about to be written, so only those are looked at. a key it merely inherits from the model an enclosing loop or include was reached with is shadowed by the write rather than left sitting behind it, and deleting one would reach back into a model that enclosing scope is still rendering from
    const key = dotNotation[0]
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      const lowerCaseKey = key.toLowerCase()
      for (const existing of Object.keys(obj)) {
        if (existing !== key && existing.toLowerCase() === lowerCaseKey) delete obj[existing]
      }
    }
    obj[key] = value
    return obj[key]
  } else {
    // walked rather than recursed: the recursion handed each step a copy of the rest of the path, so a name of three segments allocated two arrays every time it was read
    let current = obj
    for (let i = 0; i < dotNotation.length; i++) {
      if (!current) return false
      current = caseInsensitiveLookup(current, dotNotation[i])
    }
    return current
  }
  function caseInsensitiveLookup (obj, key) {
    if (key === 'length') return obj.length
    // a key that matches exactly is the overwhelming case, and answering it costs one lookup. the lowercased copy of the object below is only built when there is no exact match to be had, which is what stops a model lookup from costing as much as the object is wide on every single step of every single path
    // asking what the object owns, rather than reading the key straight off it, is what makes an <arg> win against a model key that differs from it only in case. the browser lowercases attribute names, so an <arg escapeTest> arrives owned as escapetest while the model's own spelling is still reachable through the prototype chain: a plain read would find that one and stop, where the walk below prefers the key this object owns
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key]
    // a loop body and an included template see the model they were reached with through the prototype chain rather than through a copy of it, so the keys worth looking at are the inherited ones too. a key the object owns answers ahead of one it inherits, which is what an exact match one line above would have done
    const lowerCaseKey = key.toLowerCase()
    let own
    let ownFound = false
    let inherited
    let inheritedFound = false
    for (const k in obj) {
      if (k.toLowerCase() !== lowerCaseKey) continue
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        own = obj[k]
        ownFound = true
      } else if (!inheritedFound) {
        inherited = obj[k]
        inheritedFound = true
      }
    }
    return ownFound ? own : inherited
  }
}

// cheerio polyfill
function getAttribs (element) {
  const attributes = element.attributes
  const attributesObject = {}
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i]
    attributesObject[attr.name] = attr.value
  }
  return attributesObject
}

// #endregion

// #region public methods

// set params to the defaults
function setDefaultParams () {
  params.verbosity = 1
  params.templateRoot = './'
  params.emptyVarBehavior = 'display' // or 'hide'
  params.includeNotFoundBehavior = 'display' // or 'hide'
  params.cacheTemplates = false // whether to keep templates read from the filesystem in memory rather than reading them again on the next render
}

// mutator method to set verbosity param. takes human-readable string argument and converts it to an integer for more efficient checks against the setting
function setVerbosity (v) {
  switch (v) {
    case 'none':
    case 0:
      v = 0
      break
    case 'verbose':
    case 2:
      v = 2
      break
    case 'debug':
    case 'DEBUG':
    case 3:
      v = 3
      break
    default: // concise
      v = 1
  }
  params.verbosity = v
}

// mutator method to set template root param; must be a string
function setTemplateRoot (v) {
  params.templateRoot = String(v)
}

// mutator method to set empty var behavior param: whether to display {variables} that don't resolve as text ('display') or as an empty string ('hide')
function setEmptyVarBehavior (v) {
  if (v === 'hide') params.emptyVarBehavior = 'hide'
  else params.emptyVarBehavior = 'display'
}

// mutator method to set include tag not found param: whether to display an error when an <include> tag src can't be found
function setIncludeNotFoundBehavior (v) {
  if (v === 'hide') params.includeNotFoundBehavior = 'hide'
  else params.includeNotFoundBehavior = 'display'
}

// mutator method to set whether templates read from the filesystem are kept in memory
// off by default, matching how most other templating engines (e.g. ejs and pug) treat their own caching, so that editing a template takes effect without a restart
// express sets its own `view cache` setting per mode and teddy picks that up in render, so an express app gets caching in
// production and fresh reads in development without having to ask for either
function setCacheTemplates (v) {
  params.cacheTemplates = !!v
}

// access templates
function getTemplates () {
  return templates
}

// takes in a template string and outputs a function which when given data will render out html
function compile (templateString) {
  return function (model) {
    return render(templateString, model)
  }
}

const compiler = createCompiler({
  cheerioLoad,
  cheerioOptions,
  browser,
  params,
  variableFlags,
  formatVariable,
  escapeEntities,
  conditionPath,
  evaluateConditional,
  loadTemplate,
  caches,
  parseVars,
  getAttribs,
  getOrSetObjectByDotNotation
})

// everything about a template that does not depend on the model: its markup with repeated attributes renamed, and the node tree the compiler built from it
//
// nodes is null for a template the compiler does not handle, and that answer is kept too, so a template it has already turned down is not walked again on every render only to be turned down again
//
// keyIsMarkup says the key is the template's own markup rather than a name it was looked up by. such an entry can never go stale, because the key is the content, so it is always kept: that is what makes teddy.compile() compile once even in development. an entry keyed by a name can go stale, since the file behind the name may change, so it is kept only on the same terms as the template source itself
function prepareTemplate (cacheKey, markup, keyIsMarkup, emittedOut) {
  const keep = keyIsMarkup || params.cacheTemplates
  // give every repeated attribute name a unique one before the markup is parsed since html parsers strip duplicate attributes
  const prepared = markup.replace(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g, (match, tagName, attributes) => {
    const attrRegex = /([a-zA-Z0-9-:._]+)(?:=(["'])(.*?)\2|([^>\s]+))?/g
    const attrMap = new Map()
    let count = 1
    const processedAttributes = attributes.replace(attrRegex, (attrMatch, attrName, quote, attrValue) => {
      if (attrMap.has(attrName)) {
        const newAttrName = `${attrName}-teddyduplicate${count++}`
        return attrMatch.replace(attrName, newAttrName)
      } else {
        attrMap.set(attrName, true)
        return attrMatch
      }
    })
    return `<${tagName}${processedAttributes}>`
  })
  const nodes = compiler.compileTemplate(prepared)
  // emitting javascript is faster than walking the tree, and needs to build a function from a string to do it, which a page under a strict content security policy may not do. browser builds therefore walk the tree, and so does any template holding a construct the emitter does not write code for
  let render = null
  if (canEmit(nodes)) {
    try {
      const emitted = emit(nodes, compiler.helpers)
      // only precompiling asks for this, and it is not kept on the entry: the source and the data behind it are wanted once, to be written out
      if (emittedOut) emittedOut.emitted = emitted
      render = emitted.render
    } catch (err) {
      if (params.verbosity > 1) console.warn(`teddy: could not emit javascript for this template, so it will be rendered by walking it instead: ${err.message}`)
      render = null
    }
  }
  const entry = { markup: prepared, nodes, render, keyIsMarkup }
  if (keep) {
    if (compiledCache.size > maxCompiledCache) compiledCache = new Map()
    compiledCache.set(cacheKey, entry)
  }
  return entry
}

// mutator method to cache template
function setTemplate (file, template) {
  templates[file] = template
  // whatever was compiled under this name was compiled from the old markup
  compiledCache.delete(file)
  compiledCache.delete(file.slice(-5) === '.html' ? file.substring(0, file.length - 5) : file + '.html')
}

// mutator method to clear template cache entirely
function clearTemplates () {
  templates = {}
  fileCache = {}
  compiledCache = new Map()
}

function setCache (params) {
  if (!templateCaches[params.template]) templateCaches[params.template] = {}
  if (params.key) {
    templateCaches[params.template][params.key] = {
      maxAge: params.maxAge || params.maxage,
      maxCaches: (params.maxCaches || params.maxcaches) || 1000,
      entries: {}
    }
  } else {
    templateCaches[params.template].none = {
      maxAge: params.maxAge || params.maxage,
      markup: null,
      created: null
    }
  }
}

// delete one or more cached templates
// 1 string argument deletes the whole cache at that name for template partial caches
// 2 arguments deletes just the value at that keyVal for template partial caches
// 1 object argument assumes we're clearing whole template level cache
function clearCache (name, keyVal) {
  if (typeof name === 'string') {
    if (keyVal) delete caches[name].entries[keyVal]
    else delete caches[name]
  } else if (typeof name === 'object') {
    const params = name
    if (params.key) delete templateCaches[params.template][params.key]
    else delete templateCaches[params.template]
  } else if (params.verbosity > 0) console.error('teddy: invalid params passed to clearCache.')
}

// parses a template
function render (template, model, callback) {
  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) console.warn('teddy.render attempted to render a template which is not a string.')
    if (typeof callback === 'function') return callback(null, '')
    else return ''
  }

  // ensure model is an object
  if (typeof model !== 'object') {
    if (params.verbosity > 1) console.warn('teddy.render was passed an invalid model.')
    model = {} // allow the template to render if an invalid model is supplied, but it will have an empty model
  }

  // declare vars
  let renderedTemplate
  model._noTeddyBlocks = [] // will store code blocks exempt from teddy parsing

  // express.js support
  if (model.settings && model.settings.views && path) params.templateRoot = path.resolve(model.settings.views)

  // caching is taken from the render options the way other templating engines (e.g. ejs and pug) take theirs, so that whoever is calling teddy decides
  // an explicit `cache` option wins; otherwise express' own `view cache` setting is used, which express turns on in production and off in development, so an express app gets the right behavior without asking for it
  if (typeof model.cache === 'boolean') params.cacheTemplates = model.cache
  else if (model.settings && typeof model.settings['view cache'] === 'boolean') params.cacheTemplates = model.settings['view cache']

  // remove templateRoot from template name if necessary
  if (template.slice(params.templateRoot.length) === params.templateRoot) template = template.replace(params.templateRoot, '')

  // whole template caching
  const templateCache = templateCaches[template]
  let cacheKey = null
  let cacheKeyModelVal = null
  if (templateCache) {
    const singletonCache = templateCache.none
    if (singletonCache) {
      // an entry with no max age set never goes stale
      if (!singletonCache.created) cacheKey = 'none'
      else if (singletonCache.maxAge && singletonCache.created + singletonCache.maxAge < Date.now()) cacheKey = 'none' // it has gone stale, so render it again and keep the new markup
      else {
        if (typeof callback === 'function') return callback(null, singletonCache.markup)
        else return singletonCache.markup
      }
    } else {
      for (const key in templateCache) {
        const modelVal = getOrSetObjectByDotNotation(model, key)
        // the model says nothing about this key, so this render is not cached under it. saying zero, or an empty string, is still saying something
        if (modelVal === false || modelVal === null || modelVal === undefined) continue

        // the value names an entry, and the name of anything is a string: a number used as one becomes its own digits, so it has to be read back the same way it was written. searching the entries for it instead would cost as much as the cache is wide, and would never match a value that was not a string to begin with
        cacheKeyModelVal = String(modelVal)
        const templateCacheAtThisKey = templateCache[key]
        const entry = templateCacheAtThisKey.entries[cacheKeyModelVal]
        const maxAge = templateCacheAtThisKey.maxAge

        // an entry with no max age set never goes stale
        if (entry && (!maxAge || entry.created + maxAge >= Date.now())) {
          if (typeof callback === 'function') return callback(null, entry.markup)
          else return entry.markup
        }

        // either nothing is cached for this value yet or what was there has gone stale
        cacheKey = key
        break
      }
    }
  }

  // everything about a template that does not depend on the model is done once and kept together against the argument the caller passed, whether that was a name or the markup itself
  //
  // the entry is looked for before anything else happens, because reading the template and stripping its comments are template level work too
  let prepared = compiledCache.get(template)
  // a name may point at different markup than it did last time, so an entry keyed by one is only trusted on the same terms as the template source itself. an entry keyed by markup cannot go stale, because the key is the content
  if (prepared && !prepared.keyIsMarkup && !prepared.precompiled && !params.cacheTemplates) prepared = undefined
  if (!prepared) {
    let source = loadTemplate(template)
    // a name that resolves to nothing falls back to being rendered as though it were markup
    if (source === null) source = template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
    prepared = prepareTemplate(template, source, template.includes('<'))
  }
  renderedTemplate = prepared.markup

  // render from what the compiler worked out about this template: emitted javascript where that was possible, and a walk of the node tree otherwise. neither reparses the markup
  const state = { values: [] }
  renderedTemplate = prepared.render ? prepared.render(model, state) : compiler.renderNodes(prepared.nodes, model, state)

  // replace <noteddy> blocks with the hidden code
  for (const blockId in model._noTeddyBlocks) {
    renderedTemplate = renderedTemplate.replace(`<noteddy id="${blockId}"></noteddy>`, () => model._noTeddyBlocks[blockId])
    renderedTemplate = renderedTemplate.replace(`<noteddy id="${blockId}" pre="true"></noteddy>`, () => model._noTeddyBlocks[blockId])
  }

  if (browser) {
    // the renamed src and href attributes are put back as the markup leaves the dom now, so a render no longer sweeps its whole output for them
    //
    // what is left is the double encoding, which can still arrive in a value the model supplied rather than through the parser. asking whether there is any is far cheaper than rewriting a page that has none, and nearly every page has none
    if (renderedTemplate.includes('&amp;')) renderedTemplate = reverseDoubleEncodedEntities(renderedTemplate)
  }

  // cache the template
  if (cacheKey === 'none') {
    templateCaches[template].none.markup = renderedTemplate
    templateCaches[template].none.created = Date.now()
  } else if (cacheKey) {
    if (!templateCaches[template][cacheKey].entries[cacheKeyModelVal]) templateCaches[template][cacheKey].entries[cacheKeyModelVal] = {}
    templateCaches[template][cacheKey].entries[cacheKeyModelVal].markup = renderedTemplate
    templateCaches[template][cacheKey].entries[cacheKeyModelVal].created = Date.now()
    // invalidate oldest cache if we've reached max caches limit
    if (Object.keys(templateCaches[template][cacheKey].entries).length > templateCaches[template][cacheKey].maxCaches) {
      const lowestKeyVal = Object.keys(templateCaches[template][cacheKey].entries).reduce((a, b) => templateCaches[template][cacheKey].entries[a].created < templateCaches[template][cacheKey].entries[b].created ? a : b)
      delete templateCaches[template][cacheKey].entries[lowestKeyVal]
    }
  }

  if (typeof callback === 'function') return callback(null, renderedTemplate)
  else return renderedTemplate
}

// #endregion

// writes a template out as the javascript teddy would otherwise have built for it at runtime, so that a browser can be handed the fast render rather than the slow one
//
// this runs where the emitter is, which is node: the returned string is an es module, meant to be written to a file at build time and loaded by the page that needs it. registerPrecompiled below is what the page then calls. nothing is built from a string at runtime, so a strict content security policy is satisfied
const PRECOMPILED_WRAPPERS = {
  // for a bundler, for node's `import`, and for a browser's <script type="module">
  esm: body => `export default ${body}\n`,

  // for `require`, and for a bundler that would rather have commonjs
  cjs: body => `module.exports = ${body}\n`,

  // for a plain <script src> with no module loader anywhere: the templates collect on one global, keyed by name, so that a page can load as many of them as it likes without them colliding
  global: (body, name) => `;(function (root) {\n  root.teddyPrecompiled = root.teddyPrecompiled || {}\n  root.teddyPrecompiled[${JSON.stringify(name)}] = ${body}\n})(typeof globalThis !== 'undefined' ? globalThis : this)\n`
}

function precompile (template, options = {}) {
  // the emitter is not in a browser build, so there would be nothing here to write out. saying so plainly beats reporting it as a template the emitter does not cover
  if (browser) throw new Error('teddy: precompiling needs the code emitter, which browser builds do not carry. run teddy.precompile in node, at build time, and load what it writes with teddy.registerPrecompiled')
  const format = options.format ?? 'esm'
  const wrap = PRECOMPILED_WRAPPERS[format]
  if (!wrap) throw new Error(`teddy: "${format}" is not a way teddy can write a precompiled template. it writes ${Object.keys(PRECOMPILED_WRAPPERS).join(', ')}`)
  let source = loadTemplate(template)
  if (source === null) source = template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
  const out = {}
  prepareTemplate(template, source, template.includes('<'), out)
  if (!out.emitted) throw new Error(`teddy: "${template}" holds something the emitter does not write code for, so it cannot be precompiled. it still renders by walking its node tree`)
  const body = `{
  format: ${FORMAT},
  name: ${JSON.stringify(template)},
  data: ${JSON.stringify(encode(out.emitted.data))},
  render: function (m, r, s) {
${out.emitted.source}
  }
}`
  return `// teddy precompiled template: ${template}
// generated: do not edit. rebuild this by running teddy.precompile() against the template again
${wrap(body, template)}`
}

// takes what precompile wrote and renders with it from here on, in place of compiling the template
function registerPrecompiled (artifact) {
  if (!artifact || typeof artifact.render !== 'function') throw new Error('teddy: registerPrecompiled needs what teddy.precompile wrote')
  if (artifact.format !== FORMAT) throw new Error(`teddy: this template was precompiled for teddy's format ${artifact.format}, and this teddy reads format ${FORMAT}. precompile it again`)
  const data = decode(artifact.data, compiler.helpers.node)
  const runtime = { ...compiler.helpers, ...data }
  compiledCache.set(artifact.name, {
    markup: '',
    // there is no node tree behind a precompiled template: the emitted render is the only way it renders, and it is never the one that falls back to walking
    nodes: null,
    render: (model, state) => artifact.render(model, runtime, state),
    keyIsMarkup: false,
    precompiled: true
  })
  return artifact.name
}

export default {
  params,
  caches,
  templateCaches,

  // functions
  compile,
  setDefaultParams,
  setVerbosity,
  setTemplateRoot,
  setEmptyVarBehavior,
  setIncludeNotFoundBehavior,
  setCacheTemplates,
  getTemplates,
  setTemplate,
  clearTemplates,
  setCache,
  clearCache,
  render,
  precompile,
  registerPrecompiled,
  __express: render
}
