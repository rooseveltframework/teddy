let cheerio // dom parser
const cheerioOptions = { xml: { xmlMode: false, lowerCaseAttributeNames: false, decodeEntities: false } }
let fs // node filesystem module
let path // node path module
if (typeof require !== 'undefined' && typeof window === 'undefined') {
  // load node.js modules
  cheerio = require('cheerio')
  fs = require('fs')
  path = require('path')
} else {
  // load frontend version of cheerio
  cheerio = require('./dist/cheerio.client')
}
const XRegExp = require('xregexp') // needed for matchRecursive
const params = {} // teddy parameters
setDefaultParams() // set params to the defaults
const templates = {} // loaded templates are stored as object collections, e.g. { "myTemplate.html": "<p>some markup</p>"}

// private methods

// escapes sensitive characters to prevent xss
const escapeHtmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
}
const entityKeys = Object.keys(escapeHtmlEntities)
const ekl = entityKeys.length
function escapeEntities (value) {
  let escapedEntity = false
  let newValue = ''
  let i
  let j

  if (typeof value === 'object') { // cannot escape on this value
    if (!value) {
      return false // it is falsey to return false
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        return false // empty arrays are falsey
      } else {
        return '[Array]' // print that it is an array with content in it, but do not print the contents
      }
    }
    return '[Object]' // just print that it is an object, do not print the contents
  } else if (value === undefined) { // cannot escape on this value
    return false // undefined is falsey
  } else if (typeof value === 'boolean' || typeof value === 'number') { // cannot escape on these values
    return value // if it's already a boolean or a number just return it
  } else {
    // loop through value to find html entities
    for (i = 0; i < value.length; i++) {
      escapedEntity = false

      // loop through list of html entities to escape
      for (j = 0; j < ekl; j++) {
        if (value[i] === entityKeys[j]) { // alter value to show escaped html entities
          newValue += escapeHtmlEntities[entityKeys[j]]
          escapedEntity = true
          break
        }
      }

      if (!escapedEntity) {
        newValue += value[i]
      }
    }
  }

  return newValue
}

// loads the template from the filesystem
function loadTemplate (template) {
  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) {
      console.warn('teddy.loadTemplate attempted to load a template which is not a string.')
    }
    return ''
  }
  const name = template
  let register = false
  if (!templates[template] && template.indexOf('<') === -1 && fs !== undefined && fs.readFileSync !== undefined) {
    // template is not found, it is not code, and we're in the node.js context
    register = true
    // append extension if not present
    if (template.slice(-5) !== '.html') {
      template += '.html'
    }
    try {
      template = fs.readFileSync(template, 'utf8')
    } catch (e) {
      try {
        template = fs.readFileSync(params.templateRoot + template, 'utf8')
      } catch (e) {
        try {
          template = fs.readFileSync(params.templateRoot + '/' + template, 'utf8')
        } catch (e) {
          // do nothing, attempt to render it as code
          register = false
        }
      }
    }
  } else {
    if (templates[template]) {
      template = templates[template]
      register = true
    } else {
      // didn't find it; append extension if not present and check it again
      if (template.slice(-5) !== '.html') {
        template += '.html'
      }
      if (templates[template]) {
        template = templates[template]
        register = true
      }
    }
  }
  if (register) {
    // register the new template and return the code
    template = removeTeddyComments(template)
    templates[name] = template
    return template
  } else {
    // return the template name which is presumed to be code
    return template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
  }
}

// remove teddy {! comments !}
function removeTeddyComments (renderedTemplate) {
  let oldTemplate
  do {
    oldTemplate = renderedTemplate
    let vars
    try {
      vars = XRegExp.matchRecursive(renderedTemplate, '{!', '!}', 'g')
    } catch (e) {
      return renderedTemplate // it will match {! comments {! with comments in them !} !} but if there are unbalanced brackets, just return the original text
    }
    const varsLength = vars.length
    for (let i = 0; i < varsLength; i++) {
      renderedTemplate = renderedTemplate.replace(`{!${vars[i]}!}`, '')
    }
  } while (oldTemplate !== renderedTemplate)
  return renderedTemplate
}

// add an id to all <noteddy> or <noparse> tags, then remove their content temporarily until the template is fully parsed
function tagNoParseBlocks (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('noteddy:not([id]), noparse:not([id])')
    if (tags.length > 0) {
      for (const el of tags) {
        const id = model._noTeddyBlocks.push(dom(el).html()) - 1
        dom(el).replaceWith(`<noteddy id="${id}"></noteddy>`)
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// parse <include> tags
function parseIncludes (dom, model, dynamic) {
  let parsedTags
  let passes = 0
  do {
    passes++
    if (passes > params.maxPasses) {
      throw new Error(`teddy could not finish rendering the template because the max number of passes over the template (${params.maxPasses}) was exceeded; there may be an infinite loop in your template logic`)
    }
    parsedTags = 0
    let tags
    // dynamic includes are includes like <include src="{sourcedFromVariable}"></include>
    if (dynamic) {
      tags = dom('include') // parse all includes
    } else {
      tags = dom('include:not([teddy_deferred_dynamic_include])') // parse only includes that aren't dynamic
    }
    if (tags.length > 0) {
      for (const el of tags) {
        // ensure this isn't the child of a no parse block
        let foundBody = false
        let next = false
        let parent = el.parent
        while (!foundBody) {
          let parentName
          if (!parent) {
            parentName = 'body'
          } else {
            parentName = parent.name
          }
          if (parentName === 'noparse' || parentName === 'noteddy') {
            next = true
            break
          } else if (parentName === 'body') {
            foundBody = true
          } else {
            parent = parent.parent
          }
        }
        if (next) {
          continue
        }
        // get attributes
        const src = el.attribs.src
        if (!src) {
          if (params.verbosity > 1) {
            console.warn('teddy encountered an include tag with no src attribute.')
          }
          continue
        }
        if (src.includes('{')) {
          dom(el).attr('teddy_deferred_dynamic_include', 'true') // mark it dynamic and then skip it
          continue
        }
        loadTemplate(src) // load the partial into the template list
        const contents = templates[src]
        const localModel = Object.assign({}, model)
        for (const arg of dom(el).children()) {
          if (arg.name === 'arg') {
            const argval = Object.keys(arg.attribs)[0]
            getOrSetObjectByDotNotation(localModel, argval, dom(arg).html())
          }
        }
        const localMarkup = parseVars(contents, localModel)
        let localDom = cheerio.load(localMarkup || '', cheerioOptions)
        localDom = parseConditionals(localDom, localModel)
        localDom = parseOneLineConditionals(localDom, localModel)
        localDom = parseLoops(localDom, localModel)
        dom(el).replaceWith(localDom.html())
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// parse <if>, <elseif>, <unless>, <elseunless>, and <else> tags
function parseConditionals (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('if, unless')
    if (tags.length > 0) {
      for (const el of tags) {
        // ensure this isn't the child of a loop or a no parse block
        let foundBody = false
        let next = false
        let parent = el.parent
        while (!foundBody) {
          let parentName
          if (!parent) {
            parentName = 'body'
          } else {
            parentName = parent.name
          }
          if (parentName === 'loop' || parentName === 'noparse' || parentName === 'noteddy') {
            next = true
            break
          } else if (parentName === 'body') {
            foundBody = true
          } else {
            parent = parent.parent
          }
        }
        if (next) {
          continue
        }
        // get conditions
        let args = []
        for (const attr in el.attribs) {
          const val = el.attribs[attr]
          if (val) {
            args.push(`${attr}=${val}`)
          } else {
            args.push(attr)
          }
        }
        // check if it's an if tag and not an unless tag
        let isIf = true
        if (el.name === 'unless') {
          isIf = false
        }
        // evaluate conditional
        const condResult = evaluateConditional(args, model)
        if ((isIf && condResult) || ((!isIf && !condResult))) {
          // render the true block and discard the elseif, elseunless, and else blocks
          let nextSibling = el.nextSibling
          const removeStack = []
          while (nextSibling) {
            switch (nextSibling.name) {
              case 'elseif':
              case 'elseunless':
              case 'else':
                removeStack.push(nextSibling)
                nextSibling = nextSibling.nextSibling
                break
              case 'if':
              case 'unless':
                nextSibling = false
                break
              default:
                nextSibling = nextSibling.nextSibling
            }
          }
          removeStack.forEach((element) => dom(element).replaceWith(''))
          dom(el).replaceWith(el.children)
          parsedTags++
        } else {
          // true block is false; find the next elseif, elseunless, or else tag to evaluate
          let nextSibling = el.nextSibling
          while (nextSibling) {
            switch (nextSibling.name) {
              case 'elseif':
                // get conditions
                args = []
                for (const attr in nextSibling.attribs) {
                  const val = nextSibling.attribs[attr]
                  if (val) {
                    args.push(`${attr}=${val}`)
                  } else {
                    args.push(attr)
                  }
                }
                if (evaluateConditional(args, model)) {
                  // render the true block and discard the elseif, elseunless, and else blocks
                  const replaceSibling = nextSibling
                  dom(replaceSibling).replaceWith(replaceSibling.children)
                  nextSibling = el.nextSibling
                  const removeStack = []
                  while (nextSibling) {
                    switch (nextSibling.name) {
                      case 'elseif':
                      case 'elseunless':
                      case 'else':
                        removeStack.push(nextSibling)
                        nextSibling = nextSibling.nextSibling
                        break
                      case 'if':
                      case 'unless':
                        nextSibling = false
                        break
                      default:
                        nextSibling = nextSibling.nextSibling
                    }
                  }
                  removeStack.forEach((element) => dom(element).replaceWith(''))
                  nextSibling = false
                  parsedTags++
                } else {
                  // true block is false; find the next elseif, elseunless, or else tag to evaluate
                  const siblingToWipe = nextSibling
                  nextSibling = nextSibling.nextSibling
                  dom(siblingToWipe).replaceWith('')
                }
                break
              case 'elseunless':
                // get conditions
                args = []
                for (const attr in nextSibling.attribs) {
                  const val = nextSibling.attribs[attr]
                  if (val) {
                    args.push(`${attr}=${val}`)
                  } else {
                    args.push(attr)
                  }
                }
                if (!evaluateConditional(args, model)) {
                  // render the true block and discard the elseif, elseunless, and else blocks
                  const replaceSibling = nextSibling
                  dom(replaceSibling).replaceWith(replaceSibling.children)
                  nextSibling = el.nextSibling
                  const removeStack = []
                  while (nextSibling) {
                    switch (nextSibling.name) {
                      case 'elseif':
                      case 'elseunless':
                      case 'else':
                        removeStack.push(nextSibling)
                        nextSibling = nextSibling.nextSibling
                        break
                      case 'if':
                      case 'unless':
                        nextSibling = false
                        break
                      default:
                        nextSibling = nextSibling.nextSibling
                    }
                  }
                  removeStack.forEach((element) => dom(element).replaceWith(''))
                  nextSibling = false
                  parsedTags++
                } else {
                  // true block is false; find the next elseif, elseunless, or else tag to evaluate
                  const siblingToWipe = nextSibling
                  nextSibling = nextSibling.nextSibling
                  dom(siblingToWipe).replaceWith('')
                }
                break
              case 'else':
                // else is always true, so if we've gotten here, then there's nothing to evaluate and we've reached the end of the conditional blocks
                dom(nextSibling).replaceWith(nextSibling.children)
                nextSibling = false
                parsedTags++
                break
              case 'if':
              case 'unless':
                // if we encounter another fresh if statement or unless statement, then there's nothing left to evaluate and we've reached the end of this conditional's blocks
                nextSibling = false
                break
              default:
                // if we encounter any other element or a text node we assume there could still be more elseif, elseunless, or else tags ahead so we keep going
                nextSibling = nextSibling.nextSibling
            }
          }
          dom(el).replaceWith('') // remove the original if statement once done with finding its siblings
        }
      }
    }
  } while (parsedTags)
  return dom
}

// evaluates a single <if> or <unless> tag
function evaluateConditional (conditions, model) {
  const conditionsLength = conditions.length
  // loop through conditions and reduce them to booleans
  for (let i = 0; i < conditionsLength; i++) {
    const condition = conditions[i]
    if (typeof condition === 'boolean') {
      continue // if the condition is already a boolean then we don't need to reduce it to a boolean to evaluate it
    }
    // reject conditions with invalid formatting
    if (condition.startsWith('=') || condition.endsWith('=')) {
      if (params.verbosity > 1) {
        console.warn('teddy encountered a conditional statement with "=" at the beginning or end of a condition.')
      }
      return false
    }
    if (condition.includes(':') && !condition.startsWith('not:')) {
      if (params.verbosity > 1) {
        console.warn('teddy encountered a conditional statement with a "not:" that isn\'t at the beginning of a condition.')
      }
      return false
    }
    // deal with boolean logic
    if (condition === 'and') {
      if (conditions[i - 1] && evaluateCondition(conditions[i + 1], model)) {
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
      if (conditions[i - 1] || evaluateCondition(conditions[i + 1], model)) {
        // if either side of an or is true, then reduce all 3 condition blocks to true, as well as all condition blocks that precded this or
        conditions.fill(true, 0, i + 2)
      } else {
        // if both sides of an or are false, then reduce all 3 condition blocks to false
        conditions[i - 1] = false
        conditions[i] = false
        conditions[i + 1] = false
      }
    } else if (condition === 'xor') {
      if (!!conditions[i - 1] === !!evaluateCondition(conditions[i + 1], model)) {
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
    } else {
      conditions[i] = evaluateCondition(condition, model)
    }
  }
  return conditions.every(item => item === true) || false // if any of the booleans are false, then return false. otherwise return true
}

// determines whether a single condition in a teddy conditional is true or false
function evaluateCondition (condition, model) {
  let not // stores whether the :not modifier is present
  if (typeof condition === 'string' && condition.includes('=')) { // it's an equality check condition
    not = !!condition.startsWith('not:') // true if "not:" is present
    if (not) {
      condition = condition.slice(4) // remove the :not prefix
    }
    const parts = condition.split('=') // something="Some content"
    const cond = parts[0] // something
    delete parts[0] // remove the something=
    const val = parts.join('') // "Some content" — the path.join method ensures the string gets rebuilt even if it contains another = character
    const lookup = getOrSetObjectByDotNotation(model, cond)
    if (lookup == val) { // eslint-disable-line
      // the == is necessary because teddy does type-insensitive equality checks
      return !not // true
    } else {
      return not // false
    }
  } else { // it's a presence check
    not = typeof condition === 'string' ? !!condition.startsWith('not:') : false // true if "not:" is present
    if (not) {
      condition = condition.slice(4) // remove the :not prefix
    }
    const lookup = getOrSetObjectByDotNotation(model, condition)
    if (lookup) {
      if (typeof lookup === 'object' && Object.keys(lookup).length === 0) {
        return not // false; empty object or array
      }
      return !not // true; var is present
    } else {
      return not // false; var is not present
    }
  }
}

// render one-line if attributes, e.g. <p if-something="value" true="class='class-applied-if-true'" false="class='class-applied-if-false'">hello</p>
function parseOneLineConditionals (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('[true], [false]')
    if (tags.length > 0) {
      for (const el of tags) {
        // skip parsing this if it uses variables as part of its conditions; it will get caught in the next pass after parseVars runs
        let defer = false
        for (const attr in el.attribs) {
          const val = el.attribs[attr]
          if (val.includes('{')) {
            defer = true
            break
          }
        }
        if (defer) {
          dom(el).attr('teddy_deferred_one_line_conditional', 'true')
          continue
        }
        // ensure this isn't the child of a loop or a no parse block
        let foundBody = false
        let next = false
        let parent = el.parent
        while (!foundBody) {
          let parentName
          if (!parent) {
            parentName = 'body'
          } else {
            parentName = parent.name
          }
          if (parentName === 'loop' || parentName === 'noparse' || parentName === 'noteddy') {
            next = true
            break
          } else if (parentName === 'body') {
            foundBody = true
          } else {
            parent = parent.parent
          }
        }
        if (next) {
          continue
        }
        // get conditions
        let cond
        let ifTrue
        let ifFalse
        for (const attr in el.attribs) {
          const val = el.attribs[attr]
          if (attr.startsWith('if-')) {
            const parts = attr.split('if-')
            if (val) {
              cond = [`${[parts[1]]}=${val}`] // if-something="Some content"
            } else {
              cond = [`${[parts[1]]}`] // if-something
            }
            dom(el).removeAttr(attr)
          } else if (attr === 'true') {
            ifTrue = val.replaceAll('&quot;', '"') // true="class='blah'"
            dom(el).removeAttr(attr)
          } else if (attr === 'false') {
            ifFalse = val.replaceAll('&quot;', '"') // true="class='blah'"
            dom(el).removeAttr(attr)
          }
        }
        // evaluate conditional
        if (evaluateConditional(cond, model)) {
          const parts = ifTrue.split('=')
          dom(el).attr(parts[0], parts[1] ? parts[1].replace(/["']/g, '') : '')
          parsedTags++
        } else if (ifFalse) {
          const parts = ifFalse.split('=')
          dom(el).attr(parts[0], parts[1] ? parts[1].replace(/["']/g, '') : '')
          parsedTags++
        }
      }
    }
  } while (parsedTags)
  return dom
}

// render <loop> tags
function parseLoops (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('loop')
    if (tags.length > 0) {
      for (const el of tags) {
        // get attributes
        let loopThrough
        let keyName
        let valName
        for (const attr in el.attribs) {
          if (attr === 'through') {
            loopThrough = getOrSetObjectByDotNotation(model, el.attribs[attr])
          } else if (attr === 'key') {
            keyName = el.attribs[attr]
          } else if (attr === 'val') {
            valName = el.attribs[attr]
          }
        }
        // reject the loop if it has invalid attributes
        if (!loopThrough) {
          if (params.verbosity > 1) {
            console.warn('teddy encountered a loop without a through attribute.')
          }
          dom(el).replaceWith('')
          continue
        }
        if (!keyName && !valName) {
          if (params.verbosity > 1) {
            console.warn('teddy encountered a loop without a key or a val attribute.')
          }
          dom(el).replaceWith('')
          continue
        }
        // loop through model[loopThrough] and parse teddy tags within the loop's iteration against the local model
        let newMarkup = ''
        const loopContents = dom(el).html()
        for (const key in loopThrough) {
          const val = loopThrough[key]
          const localModel = Object.assign({}, model)
          getOrSetObjectByDotNotation(localModel, keyName, key)
          getOrSetObjectByDotNotation(localModel, valName, val)
          const localMarkup = parseVars(loopContents, localModel)
          let localDom = cheerio.load(localMarkup || '', cheerioOptions)
          localDom = parseConditionals(localDom, localModel)
          localDom = parseOneLineConditionals(localDom, localModel)
          localDom = parseLoops(localDom, localModel)
          newMarkup += localDom.html()
        }
        const newDom = cheerio.load(newMarkup || '', cheerioOptions)
        dom(el).replaceWith(newDom.html())
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// render {variables}
function parseVars (templateString, model) {
  let vars
  try {
    vars = XRegExp.matchRecursive(templateString, '{', '}', 'g')
  } catch (e) {
    return templateString // it will match {vars{withVarsInThem}} but if there are unbalanced brackets, just return the original text
  }
  const varsLength = vars.length
  for (let i = 0; i < varsLength; i++) {
    let match = vars[i]
    if (match.includes('{')) {
      // there's a variable inside the variable name
      const originalMatch = match
      match = parseVars(match, model)
      templateString = templateString.replace(new RegExp(`{${originalMatch}}`, 'i'), `{${match}}`)
    }
    const lastFourChars = match.slice(-4)
    if (lastFourChars.includes('|p')) {
      // no parse flag is set; also handles if no escape flag is set as well
      const originalMatch = match
      match = match.substring(0, match.length - (lastFourChars.split('|').length - 1 > 1 ? 4 : 2)) // remove last 2-4 char
      const parsed = getOrSetObjectByDotNotation(model, match)
      if (parsed) {
        const id = model._noTeddyBlocks.push(parsed) - 1
        try {
          templateString = templateString.replace(new RegExp(`{${originalMatch}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), `<noteddy id="${id}"></noteddy>`)
        } catch (e) {
          return templateString
        }
      }
    } else if (lastFourChars.includes('|s')) {
      // no escape flag is set
      const originalMatch = match
      match = match.substring(0, match.length - 2) // remove last 2 char
      const parsed = getOrSetObjectByDotNotation(model, match) || `{${originalMatch}}`
      try {
        templateString = templateString.replace(new RegExp(`{${originalMatch}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), parsed)
      } catch (e) {
        return templateString
      }
    } else {
      // no flags are set
      let parsed = getOrSetObjectByDotNotation(model, match)
      if (parsed || parsed === '') {
        parsed = escapeEntities(parsed)
      } else if (parsed === 0) {
        parsed = '0'
      } else {
        parsed = `{${match}}`
      }
      try {
        templateString = templateString.replace(new RegExp(`{${match}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), parsed)
      } catch (e) {
        return templateString
      }
    }
  }
  return templateString
}

// removes any remaining teddy tags from the dom before returning the parsed html to the user
function cleanupStrayTeddyTags (dom) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('[teddy_deferred_one_line_conditional], include, arg, if, unless, elseif, elseunless, else, loop')
    if (tags.length > 0) {
      for (const el of tags) {
        if (el.name === 'include' || el.name === 'arg' || el.name === 'if' || el.name === 'unless' || el.name === 'elseif' || el.name === 'elseunless' || el.name === 'else' || el.name === 'loop') {
          dom(el).remove()
        }
        for (const attr in el.attribs) {
          if (attr === 'true' || attr === 'false' || attr === 'teddy_deferred_one_line_conditional' || attr.startsWith('if-')) {
            dom(el).removeAttr(attr)
          }
        }
      }
    }
  } while (parsedTags)
  return dom
}

// gets or sets an object by dot notation, e.g. thing.nestedThing.furtherNestedThing: two arguments gets, three arguments sets
function getOrSetObjectByDotNotation (obj, dotNotation, value) {
  if (!dotNotation || typeof dotNotation === 'boolean' || typeof dotNotation === 'number') {
    return dotNotation
  }
  if (typeof dotNotation === 'string') {
    return getOrSetObjectByDotNotation(obj, dotNotation.split('.'), value)
  } else if (dotNotation.length === 1 && value !== undefined) {
    obj[dotNotation[0]] = value
    return obj[dotNotation[0]]
  } else if (dotNotation.length === 0) {
    return obj
  } else if (dotNotation.length === 1) {
    if (obj) {
      return obj[dotNotation[0]]
    }
    return false
  } else {
    return getOrSetObjectByDotNotation(obj[dotNotation[0]], dotNotation.slice(1), value)
  }
}

// public methods

// set params to the defaults
function setDefaultParams () {
  params.verbosity = 1
  params.templateRoot = './'
  params.cacheRenders = false
  params.defaultCaches = 1
  params.templateMaxCaches = {}
  params.cacheWhitelist = false
  params.cacheBlacklist = []
  params.minify = false
  params.maxPasses = 1000
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

// mutator method to set max passes param: the number of times the parser can iterate over the template
function setMaxPasses (v) {
  params.maxPasses = Number(v)
}

// access templates
function getTemplates () {
  return templates
}

// mutator method to cache template
function setTemplate (file, template) {
  templates[file] = template
}

// parses a template
function render (template, model, callback) {
  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) {
      console.warn('teddy.render attempted to render a template which is not a string.')
    }
    return ''
  }

  // declare vars
  let dom
  let renderedTemplate
  model._noTeddyBlocks = [] // will store code blocks exempt from teddy parsing

  // express.js support
  if (model.settings && model.settings.views && path) {
    params.templateRoot = path.resolve(model.settings.views)
  }

  // remove templateRoot from template name if necessary
  if (template.slice(params.templateRoot.length) === params.templateRoot) {
    template = template.replace(params.templateRoot, '')
  }

  // start the render
  renderedTemplate = loadTemplate(template)
  renderedTemplate = removeTeddyComments(renderedTemplate)
  dom = cheerio.load(renderedTemplate || '', cheerioOptions)
  let oldTemplate
  let passes = 0
  let parseDynamicIncludes = false
  do {
    passes++
    if (passes > params.maxPasses) {
      const err = `teddy could not finish rendering the template because the max number of passes over the template (${params.maxPasses}) was exceeded; there may be an infinite loop in your template logic`
      if (params.verbosity > 1) {
        console.error(err)
      }
      break
    }
    oldTemplate = renderedTemplate || ''
    if (passes > 1) {
      dom = cheerio.load(renderedTemplate || '', cheerioOptions)
      if (parseDynamicIncludes) {
        dom = parseIncludes(dom, model, true)
      }
    }
    dom = tagNoParseBlocks(dom, model)
    dom = parseConditionals(dom, model)
    dom = parseOneLineConditionals(dom, model)
    dom = parseIncludes(dom, model)
    dom = parseLoops(dom, model)
    renderedTemplate = dom.html()
    renderedTemplate = parseVars(renderedTemplate, model)
    if (parseDynamicIncludes) {
      renderedTemplate = removeTeddyComments(renderedTemplate)
      parseDynamicIncludes = false
    }
    if (renderedTemplate.includes('teddy_deferred_dynamic_include="true"')) {
      oldTemplate = '' // reset old template to force another pass
      parseDynamicIncludes = true
    }
  } while (oldTemplate !== renderedTemplate)

  // remove stray teddy tags if any exist
  if (renderedTemplate.includes('teddy_deferred_one_line_conditional="true"') || renderedTemplate.includes('<include') || renderedTemplate.includes('<arg') || renderedTemplate.includes('<if') || renderedTemplate.includes('<unless') || renderedTemplate.includes('<elseif') || renderedTemplate.includes('<elseunless') || renderedTemplate.includes('<else') || renderedTemplate.includes('<loop')) {
    dom = cheerio.load(renderedTemplate || '', cheerioOptions)
    dom = cleanupStrayTeddyTags(dom)
    renderedTemplate = dom.html()
  }

  // replace <noteddy> blocks with the hidden code
  for (const blockId in model._noTeddyBlocks) {
    renderedTemplate = renderedTemplate.replace(`<noteddy id="${blockId}"></noteddy>`, model._noTeddyBlocks[blockId])
  }

  // execute callback if present, otherwise simply return the rendered template string
  if (typeof callback === 'function') {
    callback(null, renderedTemplate)
  } else {
    return renderedTemplate
  }

  return renderedTemplate
}

module.exports = {
  // state
  params,

  // functions
  setDefaultParams,
  setVerbosity,
  setTemplateRoot,
  setMaxPasses,
  getTemplates,
  setTemplate,
  render
}

// express.js support
if (typeof module !== 'undefined' && module.exports && typeof window) {
  module.exports.__express = render
}