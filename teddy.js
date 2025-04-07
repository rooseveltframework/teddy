// #region globals

import fs from 'fs' // node filesystem module
import path from 'path' // node path module
import { load as cheerioLoad } from 'cheerio/slim' // dom parser

const cheerioOptions = { xml: { xmlMode: false, lowerCaseAttributeNames: false, decodeEntities: false } }
const browser = cheerioLoad.isCheerioPolyfill // true if we are executing in the browser context
const params = {} // teddy parameters
setDefaultParams() // set params to the defaults
const templates = {} // loaded templates are stored as object collections, e.g. { "myTemplate.html": "<p>some markup</p>"}
const caches = {} // a place to store cached portions of templates
const templateCaches = {} // a place to store cached full templates

// #endregion

// #region private methods

// loads the template from the filesystem
function loadTemplate (template) {
  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) console.warn('teddy.loadTemplate attempted to load a template which is not a string.')
    return ''
  }
  const name = template
  let register = false
  if (!templates[template] && template.indexOf('<') === -1 && fs && fs.readFileSync) {
    // template is not found, it is not code, and we're in the node.js context
    register = true
    // append extension if not present
    if (template.slice(-5) !== '.html') template += '.html'
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
      template = removeTeddyComments(template)
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

// remove teddy {! comments !} and <!--! comments -->
function removeTeddyComments (renderedTemplate) {
  let oldTemplate
  do {
    oldTemplate = renderedTemplate
    let vars

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
  } while (oldTemplate !== renderedTemplate)
  return renderedTemplate
}

// find all cache elements and replace them with the rendered contents of their cache, then remove the cache element
function replaceCacheElements (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('cache:not([defer])')
    if (tags.length > 0) {
      for (const el of tags) {
        if (browser) el.attribs = getAttribs(el)
        const name = el.attribs.name
        if (name.includes('{')) continue
        const key = el.attribs.key || 'none'
        if (key.includes('{')) continue
        const cache = caches[name]
        if (cache && cache.entries) {
          const keyVal = el.attribs.key ? getOrSetObjectByDotNotation(model, key) : 'none'
          if (cache.entries[keyVal]) {
            const now = Date.now()
            // if max age is not set, then there is no max age and the cache content is still valid
            // or if last accessed + max age > now then the cache is not stale and the cache is still valid
            if (!(cache.maxAge && !cache.maxage) || cache.entries[keyVal].lastAccessed + (cache.maxAge || cache.maxage) > now) {
              const cacheContent = cache.entries[keyVal].markup
              cache.entries[keyVal].lastAccessed = now
              dom(el).replaceWith(cacheContent)
            } else {
              // if last accessed + max age <= now then the cache is stale and the cache is no longer valid
              delete caches[name].entries[keyVal]
              dom(el).attr('defer', 'true') // create a new cache
            }
          } else dom(el).attr('defer', 'true') // no cache exists for this yet; create after the template renders
        } else dom(el).attr('defer', 'true') // no cache exists for this yet; create after the template renders
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// add an id to all <noteddy> or <noparse> tags, then remove their content temporarily until the template is fully parsed
function tagNoParseBlocks (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    let tags = dom('noteddy:not([id]), noparse:not([id])')
    if (tags.length > 0) {
      for (const el of tags) {
        const id = model._noTeddyBlocks.push(dom(el).html()) - 1
        dom(el).replaceWith(`<noteddy id="${id}"></noteddy>`)
        parsedTags++
      }
    }
    tags = dom('pre:not([id]):not([parse])')
    if (tags.length > 0) {
      for (const el of tags) {
        const id = model._noTeddyBlocks.push(dom(el).toString()) - 1
        dom(el).replaceWith(`<noteddy id="${id}" pre="true"></noteddy>`)
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
    if (passes > params.maxPasses) throw new Error(`teddy could not finish rendering the template because the max number of passes over the template (${params.maxPasses}) was exceeded; there may be an infinite loop in your template logic.`)
    parsedTags = 0
    let tags
    // dynamic includes are includes like <include src="{sourcedFromVariable}"></include>
    if (dynamic) tags = dom('include') // parse all includes
    else tags = dom('include:not([teddydeferreddynamicinclude])') // parse only includes that aren't dynamic
    if (tags.length > 0) {
      for (const el of tags) {
        // ensure this isn't the child of a no parse block
        let foundBody = false
        let next = false
        let parent = el.parent || el.parentNode
        while (!foundBody) {
          let parentName
          if (!parent) parentName = 'body'
          else parentName = parent.nodeName?.toLowerCase() || parent.name
          if (parentName === 'noparse' || parentName === 'noteddy') {
            next = true
            break
          } else if (parentName === 'body') foundBody = true
          else parent = parent.parent || parent.parentNode
        }
        if (next) continue
        // get attributes
        if (browser) el.attribs = getAttribs(el)
        const src = el.attribs.src
        if (!src) {
          if (params.verbosity > 1) console.warn('teddy encountered an include tag with no src attribute.')
          continue
        }
        if (src.startsWith('{')) {
          dom(el).attr('teddydeferreddynamicinclude', 'true') // mark it dynamic and then skip it
          continue
        }
        loadTemplate(src) // load the partial into the template list
        let contents = templates[src] || ''
        if (typeof templates[src] !== 'string' && params.includeNotFoundBehavior === 'display') {
          contents = `Template "${src}" not found!`
          if (params.verbosity > 1) console.warn(`teddy encountered an include tag with a src set to a template that could not be found: ${src}`)
        }
        const localModel = Object.assign({}, model)
        for (const arg of dom(el).children()) {
          const argName = browser ? arg.nodeName?.toLowerCase() : arg.name
          if (argName === 'arg') {
            if (browser) arg.attribs = getAttribs(arg)
            const argval = Object.keys(arg.attribs)[0]
            getOrSetObjectByDotNotation(localModel, argval, dom(arg).html())
          }
        }
        const hasNoteddy = contents.includes('</noteddy>')
        const hasNoparse = contents.includes('</noparse>')
        const hasPre = contents.includes('</pre>')
        const hasIf = contents.includes('</if>')
        const hasUnless = contents.includes('</unless>')
        const hasTrue = contents.includes(' true=')
        const hasFalse = contents.includes(' false=')
        const hasLoop = contents.includes('</loop>')
        const hasInline = contents.includes('</inline>')
        const hasEscape = contents.includes('</escape>')
        const hasSelected = contents.includes(' selected-value=') || contents.includes(' checked-value=')
        let localDom
        if (hasNoteddy || hasNoparse || hasPre) {
          localDom = cheerioLoad(contents, cheerioOptions)
          localDom = tagNoParseBlocks(localDom, localModel)
          contents = localDom.html()
        }
        localDom = cheerioLoad(parseVars(contents, localModel), cheerioOptions)
        if (hasEscape) localDom = parseEscapes(localDom, localModel)
        if (hasIf || hasUnless) localDom = parseConditionals(localDom, localModel)
        if (hasTrue || hasFalse) localDom = parseOneLineConditionals(localDom, localModel)
        if (hasLoop) localDom = parseLoops(localDom, localModel)
        if (hasInline) localDom = parseInlines(localDom, localModel)
        if (hasSelected) localDom = parseSelectedAttributeValues(localDom, localModel)
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
        let parent = el.parent || el.parentNode
        while (!foundBody) {
          let parentName
          if (!parent) parentName = 'body'
          else parentName = parent.nodeName?.toLowerCase() || parent.name
          if (parentName === 'loop' || parentName === 'noparse' || parentName === 'noteddy') {
            next = true
            break
          } else if (parentName === 'body') foundBody = true
          else parent = parent.parent || parent.parentNode
        }
        if (next) continue
        // get conditions
        let args = []
        if (browser) el.attribs = getAttribs(el)
        for (let attr in el.attribs) {
          if (attr.includes('-teddyduplicate')) attr = attr.split('-teddyduplicate')[0] // the condition is a duplicate, so remove the `-teddyduplicate1` from `conditionName-teddyduplicate1`, `conditionName-teddyduplicate2`, etc
          let val = el.attribs[attr]
          if (val) {
            if (val.startsWith('{')) val = parseVars(val, model)
            args.push(`${attr}=${val}`)
          } else args.push(attr)
        }
        // check if it's an if tag and not an unless tag
        let isIf = true
        const elName = browser ? el.nodeName?.toLowerCase() : el.name
        if (elName === 'unless') isIf = false
        // evaluate conditional
        const condResult = evaluateConditional(args, model)
        if ((isIf && condResult) || ((!isIf && !condResult))) {
          // render the true block and discard the elseif, elseunless, and else blocks
          let nextSibling = el.nextSibling
          const removeStack = []
          while (nextSibling) {
            const nextSiblingName = browser ? nextSibling.nodeName?.toLowerCase() : nextSibling.name
            switch (nextSiblingName) {
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
          for (const element of removeStack) dom(element).replaceWith('')
          dom(el).replaceWith(el.childNodes || el.children)
          parsedTags++
        } else {
          // true block is false; find the next elseif, elseunless, or else tag to evaluate
          let nextSibling = el.nextSibling
          while (nextSibling) {
            const nextSiblingName = browser ? nextSibling.nodeName?.toLowerCase() : nextSibling.name
            switch (nextSiblingName) {
              case 'elseif':
                // get conditions
                args = []
                if (browser) nextSibling.attribs = getAttribs(nextSibling)
                for (const attr in nextSibling.attribs) {
                  const val = nextSibling.attribs[attr]
                  if (val) args.push(`${attr}=${val}`)
                  else args.push(attr)
                }
                if (evaluateConditional(args, model)) {
                  // render the true block and discard the elseif, elseunless, and else blocks
                  const replaceSibling = nextSibling
                  dom(replaceSibling).replaceWith(replaceSibling.childNodes || replaceSibling.children)
                  nextSibling = el.nextSibling
                  const removeStack = []
                  while (nextSibling) {
                    const nextSiblingName = browser ? nextSibling.nodeName?.toLowerCase() : nextSibling.name
                    switch (nextSiblingName) {
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
                  for (const element of removeStack) dom(element).replaceWith('')
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
                if (browser) nextSibling.attribs = getAttribs(nextSibling)
                for (const attr in nextSibling.attribs) {
                  const val = nextSibling.attribs[attr]
                  if (val) args.push(`${attr}=${val}`)
                  else args.push(attr)
                }
                if (!evaluateConditional(args, model)) {
                  // render the true block and discard the elseif, elseunless, and else blocks
                  const replaceSibling = nextSibling
                  dom(replaceSibling).replaceWith(replaceSibling.childNodes || replaceSibling.children)
                  nextSibling = el.nextSibling
                  const removeStack = []
                  while (nextSibling) {
                    const nextSiblingName = browser ? nextSibling.nodeName?.toLowerCase() : nextSibling.name
                    switch (nextSiblingName) {
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
                  for (const element of removeStack) dom(element).replaceWith('')
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
                dom(nextSibling).replaceWith(nextSibling.childNodes || nextSibling.children)
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
    } else conditions[i] = evaluateCondition(condition, model)
  }
  return conditions.every(item => item === true) || false // if any of the booleans are false, then return false. otherwise return true
}

// determines whether a single condition in a teddy conditional is true or false
function evaluateCondition (condition, model) {
  let not // stores whether the :not modifier is present
  if (typeof condition === 'string' && condition.includes('=')) { // it's an equality check condition
    not = !!condition.startsWith('not:') // true if "not:" is present
    if (not) condition = condition.slice(4) // remove the :not prefix
    const parts = condition.split('=') // something="Some content"
    const cond = parts[0] // something
    delete parts[0] // remove the something=
    const val = parts.join('') // "Some content" — the path.join method ensures the string gets rebuilt even if it contains another = character
    const lookup = getOrSetObjectByDotNotation(model, cond)
    // the == is necessary because teddy does type-insensitive equality checks
    if (lookup == val) return !not // eslint-disable-line
    else return not // false
  } else { // it's a presence check
    not = typeof condition === 'string' ? !!condition.startsWith('not:') : false // true if "not:" is present
    if (not) condition = condition.slice(4) // remove the :not prefix
    const lookup = getOrSetObjectByDotNotation(model, condition)
    if (lookup) {
      if (typeof lookup === 'object' && Object.keys(lookup).length === 0) return not // false; empty object or array
      return !not // true; var is present
    } else return not // false; var is not present
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
        if (browser) el.attribs = getAttribs(el)
        for (const attr in el.attribs) {
          const val = el.attribs[attr]
          if (val.startsWith('{')) {
            defer = true
            break
          }
        }
        if (defer) {
          dom(el).attr('teddydeferredonelineconditional', 'true')
          continue
        }
        // ensure this isn't the child of a loop or a no parse block
        let foundBody = false
        let next = false
        let parent = el.parent || el.parentNode
        while (!foundBody) {
          let parentName
          if (!parent) parentName = 'body'
          else parentName = parent.nodeName?.toLowerCase() || parent.name
          if (parentName === 'loop' || parentName === 'noparse' || parentName === 'noteddy') {
            next = true
            break
          } else if (parentName === 'body') foundBody = true
          else parent = parent.parent || parent.parentNode
        }
        if (next) continue
        // get conditions
        let ifTrue
        let ifFalse
        if (browser) el.attribs = getAttribs(el)
        const args = []
        for (const origAttr in el.attribs) {
          let attr = origAttr
          let val = el.attribs[attr]
          if (attr.includes('-teddyduplicate')) attr = attr.split('-teddyduplicate')[0] // the condition is a duplicate, so remove the `-teddyduplicate1` from `conditionName-teddyduplicate1`, `conditionName-teddyduplicate2`, etc
          if (val?.startsWith('{')) val = parseVars(val, model)
          if (attr.startsWith('if-')) {
            const parts = attr.split('if-')
            if (val) args.push(`${parts[1]}=${val}`)
            else args.push(parts[1])
            dom(el).removeAttr(origAttr)
          } else if (attr === 'true') {
            ifTrue = val.replaceAll('&quot;', '"') // true="class='blah'"
            dom(el).removeAttr(origAttr)
          } else if (attr === 'false') {
            ifFalse = val.replaceAll('&quot;', '"') // false="class='blah'"
            dom(el).removeAttr(origAttr)
          } else if (attr === 'and' || attr === 'or' || attr === 'xor') {
            args.push(attr)
            dom(el).removeAttr(origAttr)
          }
        }
        // evaluate conditional
        if (evaluateConditional(args, model)) {
          if (ifTrue) {
            const parts = ifTrue.split('=')
            dom(el).attr(parts[0], parts[1] ? parts[1].replace(/["']/g, '') : '')
          }
          parsedTags++
        } else if (ifFalse) {
          if (ifFalse) {
            const parts = ifFalse.split('=')
            dom(el).attr(parts[0], parts[1] ? parts[1].replace(/["']/g, '') : '')
          }
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
        if (browser) el.attribs = getAttribs(el)
        for (const attr in el.attribs) {
          if (attr === 'through') {
            let attrVal = el.attribs[attr]
            if (attrVal.startsWith('{')) attrVal = parseVars(attrVal, model)
            loopThrough = getOrSetObjectByDotNotation(model, attrVal)
          } else if (attr === 'key') keyName = el.attribs[attr]
          else if (attr === 'val') valName = el.attribs[attr]
        }
        // reject the loop if it has invalid attributes
        if (!loopThrough) {
          if (params.verbosity > 1) console.warn('teddy encountered a loop without a through attribute.')
          dom(el).replaceWith('')
          continue
        }
        if (!keyName && !valName) {
          if (params.verbosity > 1) console.warn('teddy encountered a loop without a key or a val attribute.')
          dom(el).replaceWith('')
          continue
        }
        // loop through model[loopThrough] and parse teddy tags within the loop's iteration against the local model
        let newMarkup = ''
        let loopContents = dom(el).html()
        if (loopThrough instanceof Set) loopThrough = [...loopThrough] // convert Sets to arrays
        for (const key in loopThrough) {
          const val = loopThrough[key]
          const localModel = Object.assign({}, model)
          getOrSetObjectByDotNotation(localModel, keyName, key)
          getOrSetObjectByDotNotation(localModel, valName, val)
          const hasNoteddyLoopContents = loopContents.includes('</noteddy>')
          const hasNoparseLoopContents = loopContents.includes('</noparse>')
          const hasPreLoopContents = loopContents.includes('</pre>')
          if (hasNoteddyLoopContents || hasNoparseLoopContents || hasPreLoopContents) {
            let localDom = cheerioLoad(loopContents, cheerioOptions)
            localDom = tagNoParseBlocks(localDom, localModel)
            loopContents = localDom.html()
          }
          const localMarkup = parseVars(loopContents, localModel) || ''
          const hasNoteddy = localMarkup.includes('</noteddy>')
          const hasNoparse = localMarkup.includes('</noparse>')
          const hasIf = localMarkup.includes('</if>')
          const hasUnless = localMarkup.includes('</unless>')
          const hasTrue = localMarkup.includes(' true=')
          const hasFalse = localMarkup.includes(' false=')
          const hasLoop = localMarkup.includes('</loop>')
          const hasInline = localMarkup.includes('</inline>')
          const hasEscape = localMarkup.includes('</escape>')
          const hasSelected = localMarkup.includes(' selected-value=') || localMarkup.includes(' checked-value=')
          let localDom = cheerioLoad(localMarkup || '', cheerioOptions)
          if (hasEscape) localDom = parseEscapes(localDom, localModel)
          if (hasNoteddy || hasNoparse) localDom = tagNoParseBlocks(localDom, localModel)
          if (hasIf || hasUnless) localDom = parseConditionals(localDom, localModel)
          if (hasTrue || hasFalse) localDom = parseOneLineConditionals(localDom, localModel)
          if (hasLoop) localDom = parseLoops(localDom, localModel)
          if (hasInline) localDom = parseInlines(localDom, localModel)
          if (hasSelected) localDom = parseSelectedAttributeValues(localDom, localModel)
          newMarkup += localDom.html()
        }
        const newDom = cheerioLoad(newMarkup || '', cheerioOptions)
        dom(el).replaceWith(newDom.html())
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// render <inline> tags
function parseInlines (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('inline')
    if (tags.length > 0) {
      for (const el of tags) {
        // get attributes
        let css
        let js
        if (browser) el.attribs = getAttribs(el)
        for (const attr in el.attribs) {
          if (attr === 'css') css = getOrSetObjectByDotNotation(model, el.attribs[attr])
          else if (attr === 'js') js = getOrSetObjectByDotNotation(model, el.attribs[attr])
        }
        // reject if it has invalid attributes
        if (!css && !js) {
          if (params.verbosity > 1) console.warn('teddy encountered an <inline> element without a css or js attribute.')
          dom(el).replaceWith('')
          continue
        }
        let replaceWith = ''
        if (css) replaceWith = `<style>${css}</style>`
        else replaceWith = `<script>${js}</script>`
        dom(el).replaceWith(replaceWith)
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// render <escape> tags
function parseEscapes (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('escape')
    if (tags.length > 0) {
      for (const el of tags) {
        dom(el).replaceWith(escapeEntities(dom(el).html()))
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// render `selected-value` and `checked-value` attributes
function parseSelectedAttributeValues (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('select[selected-value], [checked-value]')
    if (tags.length > 0) {
      for (const el of tags) {
        // get attributes
        if (browser) el.attribs = getAttribs(el)
        for (let attr in el.attribs) {
          const origAttr = attr
          if (attr.includes('-teddyduplicate')) attr = attr.split('-teddyduplicate')[0]
          if (attr === 'selected-value') {
            const val = parseVars(el.attribs[origAttr], model) || el.attribs[origAttr]
            const children = dom(el).find('option[value]')
            for (const opt of children) {
              if (browser) opt.attribs = getAttribs(opt)
              if (opt.attribs.value === val) dom(opt).attr('selected', 'selected')
            }
            dom(el).removeAttr(origAttr)
          } else if (attr === 'checked-value') {
            const val = parseVars(el.attribs[origAttr], model) || el.attribs[origAttr]
            const children = dom(el).find('input[type="checkbox"][value], input[type="radio"][value]')
            for (const opt of children) {
              if (browser) opt.attribs = getAttribs(opt)
              if (opt.attribs.value === val) dom(opt).attr('checked', 'checked')
            }
            dom(el).removeAttr(origAttr)
          }
        }
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
    vars = matchByDelimiter(templateString, '{', '}')
  } catch (e) {
    return templateString // it will match {vars{withVarsInThem}} but if there are unbalanced brackets, just return the original text
  }
  const varsLength = vars.length
  for (let i = 0; i < varsLength; i++) {
    let match = vars[i]
    if (match === '') continue // empty {}
    if (!/^(\d+|[a-zA-Z_$][a-zA-Z0-9_$|{}.]*(\.[a-zA-Z_$][a-zA-Z0-9_$|{}.]*)*)$/.test(match)) {
      if (params.verbosity > 2) console.warn(`teddy.parseVars encountered a {variable} that could not be parsed: {${match}}`)
      continue // skip invalid variables
    }
    if (match.includes('{')) {
      // there's a variable inside the variable name
      const originalMatch = match
      match = parseVars(match, model)
      try {
        templateString = templateString.replace(new RegExp(`\${${originalMatch}}`, 'i'), () => `\${${match}}`)
        templateString = templateString.replace(new RegExp(`{${originalMatch}}`, 'i'), () => `{${match}}`)
      } catch (e) {
        if (params.verbosity > 2) console.warn(`teddy.parseVars encountered a {variable} that could not be parsed: {${originalMatch}}`)
      }
    }
    const lastSixChars = match.slice(-6)
    if (lastSixChars.includes('|p')) { // no parse flag is set
      const originalMatch = match
      match = match.substring(0, match.length - (lastSixChars.split('|').length - 1) * 2) // remove last 2-n chars
      let parsed = getOrSetObjectByDotNotation(model, match)
      if (!parsed && !lastSixChars.includes('|d') && (params.emptyVarBehavior === 'hide' || lastSixChars.includes('|h'))) parsed = '' // display empty string instead of the variable text verbatim if this setting is set
      if (typeof parsed === 'string' && parsed.startsWith('{') && parsed.includes('|d')) parsed = parsed.replace('|d', '')
      if (parsed || parsed === '') {
        const id = model._noTeddyBlocks.push(parsed) - 1
        try {
          try {
            templateString = templateString.replace(new RegExp(`\${${originalMatch}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), `<noteddy id="${id}"></noteddy>`)
            templateString = templateString.replace(new RegExp(`{${originalMatch}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), `<noteddy id="${id}"></noteddy>`)
          } catch (e) {
            if (params.verbosity > 2) console.warn(`teddy.parseVars encountered a {variable} that could not be parsed: {${originalMatch}}`)
          }
        } catch (e) {
          return templateString
        }
      }
    } else if (lastSixChars.includes('|s')) { // no escape flag is set
      const originalMatch = match
      match = match.substring(0, match.length - (lastSixChars.split('|').length - 1) * 2) // remove last 2-n chars
      let parsed = getOrSetObjectByDotNotation(model, match)
      let skipTemplateLiteralReplacement = false
      if (!parsed && !lastSixChars.includes('|d') && (params.emptyVarBehavior === 'hide' || lastSixChars.includes('|h'))) parsed = '' // display empty string instead of the variable text verbatim if this setting is set
      else if (!parsed && parsed !== '') {
        skipTemplateLiteralReplacement = true
        parsed = `{${originalMatch}}`
      }
      if (typeof parsed === 'string' && parsed.startsWith('{') && parsed.includes('|d')) parsed = parsed.replace('|d', '')
      try {
        if (!skipTemplateLiteralReplacement) templateString = templateString.replace(new RegExp(`\${${originalMatch}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), () => parsed)
        templateString = templateString.replace(new RegExp(`{${originalMatch}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), () => parsed)
      } catch (e) {
        return templateString
      }
    } else { // no flags are set
      let parsed = getOrSetObjectByDotNotation(model, match)
      let skipTemplateLiteralReplacement = false
      if (!parsed && !lastSixChars.includes('|d') && (params.emptyVarBehavior === 'hide' || lastSixChars.includes('|h'))) parsed = '' // display empty string instead of the variable text verbatim if this setting is set
      else if (parsed || parsed === '') parsed = escapeEntities(parsed)
      else if (parsed === 0) parsed = '0'
      else {
        skipTemplateLiteralReplacement = true
        parsed = `{${match}}`
      }
      if (typeof parsed === 'string' && parsed.startsWith('{') && parsed.includes('|d')) parsed = parsed.replace('|d', '')
      try {
        if (!skipTemplateLiteralReplacement) templateString = templateString.replace(new RegExp(`\${${match}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), () => parsed)
        templateString = templateString.replace(new RegExp(`{${match}}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d'), 'i'), () => parsed)
      } catch (e) {
        return templateString
      }
    }
  }
  return templateString
}

// once the template is fully rendered, find all cache elements that still exist and cache their contents
function defineNewCaches (dom, model) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('cache[defer]')
    if (tags.length > 0) {
      for (const el of tags) {
        if (browser) el.attribs = getAttribs(el)
        const name = el.attribs.name
        const key = el.attribs.key || 'none'
        const maxAge = parseInt(el.attribs.maxAge || el.attribs.maxage) || 0
        const maxCaches = parseInt(el.attribs.maxCaches || el.attribs.maxcaches) || 1000
        const timestamp = Date.now()
        const markup = dom(el).html()
        if (!caches[name]) {
          caches[name] = {
            key,
            maxAge,
            maxCaches,
            entries: {}
          }
        }
        caches[name].entries[el.attribs.key ? getOrSetObjectByDotNotation(model, key) : 'none'] = {
          lastAccessed: timestamp,
          created: timestamp,
          markup
        }
        // invalidate oldest cache if we've reached max caches limit
        if (Object.keys(caches[name].entries).length > maxCaches) {
          const lowestKeyVal = Object.keys(caches[name].entries).reduce((a, b) => caches[name].entries[a].lastAccessed < caches[name].entries[b].lastAccessed ? a : b)
          delete caches[name].entries[lowestKeyVal]
        }
        dom(el).replaceWith(markup)
        parsedTags++
      }
    }
  } while (parsedTags)
  return dom
}

// removes any remaining teddy tags from the dom before returning the parsed html to the user
function cleanupStrayTeddyTags (dom) {
  let parsedTags
  do {
    parsedTags = 0
    const tags = dom('[teddydeferredonelineconditional], pre[parse], include, arg, if, unless, elseif, elseunless, else, loop, cache')
    if (tags.length > 0) {
      for (const el of tags) {
        const tagName = browser ? el.nodeName?.toLowerCase() : el.name
        if (tagName === 'include' || tagName === 'arg' || tagName === 'if' || tagName === 'unless' || tagName === 'elseif' || tagName === 'elseunless' || tagName === 'else' || tagName === 'loop' || tagName === 'cache') {
          dom(el).remove()
        }
        if (browser) el.attribs = getAttribs(el)
        for (const attr in el.attribs) {
          if (attr === 'true' || attr === 'false' || attr === 'parse' || attr === 'teddydeferredonelineconditional' || attr.startsWith('if-')) {
            dom(el).removeAttr(attr)
          }
        }
      }
    }
  } while (parsedTags)
  return dom
}

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
    if (!value) return false // it is falsey to return false
    else if (Array.isArray(value)) {
      if (value.length === 0) return false // empty arrays are falsey
      else return '[Array]' // print that it is an array with content in it, but do not print the contents
    }
    return '[Object]' // just print that it is an object, do not print the contents
  } else if (value === undefined) return false // cannot escape on this value; undefined is falsey
  else if (typeof value === 'boolean' || typeof value === 'number') return value // cannot escape on these values; if it's already a boolean or a number just return it
  else {
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

      if (!escapedEntity) newValue += value[i]
    }
  }

  return newValue
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
      if (stack.length === 0) {
        result.push(input.substring(start, i))
      }
      i += closeLength - 1
    }
  }

  const individualSegments = []
  const regex = /{!([^{}]*)!}/g
  let match

  for (const segment of result) {
    while ((match = regex.exec(segment)) !== null) {
      individualSegments.push(match[1])
    }
    individualSegments.push(segment)
  }

  return individualSegments
}

// gets or sets an object by dot notation, e.g. thing.nestedThing.furtherNestedThing: two arguments gets, three arguments sets
function getOrSetObjectByDotNotation (obj, dotNotation, value) {
  if (!obj) return false
  if (!dotNotation || typeof dotNotation === 'boolean' || typeof dotNotation === 'number') return dotNotation
  if (typeof dotNotation === 'string') return getOrSetObjectByDotNotation(obj, dotNotation.split('.'), value)
  else if (dotNotation.length === 1 && value !== undefined) {
    obj[dotNotation[0]] = value
    return obj[dotNotation[0]]
  } else if (dotNotation.length === 0) return obj
  else if (dotNotation.length === 1) {
    if (obj) return caseInsensitiveLookup(obj, dotNotation[0])
    return false
  } else return getOrSetObjectByDotNotation(caseInsensitiveLookup(obj, dotNotation[0]), dotNotation.slice(1), value)
  function caseInsensitiveLookup (obj, key) {
    if (key === 'length') return obj.length
    const lowerCaseKey = key.toLowerCase()
    const normalizedObj = Object.keys(obj).reduce((acc, k) => {
      acc[k.toLowerCase()] = obj[k]
      return acc
    }, {})
    return normalizedObj[lowerCaseKey]
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
  params.maxPasses = 1000
  params.emptyVarBehavior = 'display' // or 'hide'
  params.includeNotFoundBehavior = 'display' // or 'hide'
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

// mutator method to set max passes param: the number of times the parser can iterate over the template
function setMaxPasses (v) {
  params.maxPasses = Number(v)
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

// mutator method to cache template
function setTemplate (file, template) {
  templates[file] = template
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
  let dom
  let renderedTemplate
  model._noTeddyBlocks = [] // will store code blocks exempt from teddy parsing

  // express.js support
  if (model.settings && model.settings.views && path) params.templateRoot = path.resolve(model.settings.views)

  // remove templateRoot from template name if necessary
  if (template.slice(params.templateRoot.length) === params.templateRoot) template = template.replace(params.templateRoot, '')

  // whole template caching
  const templateCache = templateCaches[template]
  let cacheKey = null
  let cacheKeyModelVal = null
  if (templateCache) {
    const singletonCache = templateCache.none
    if (singletonCache) {
      // check if the timestamp exceeds max age
      if (!singletonCache.created) cacheKey = 'none'
      else if (!singletonCache.maxAge && singletonCache.maxage) {
        // if no max age is set, then this cache doesn't expire
        if (typeof callback === 'function') return callback(null, singletonCache.markup)
        else return singletonCache.markup
      } else if (singletonCache.created + (singletonCache.maxAge || singletonCache.maxage) < Date.now()) cacheKey = 'none' // if yes re-render the template and cache it again
      else {
        // if no return the cached markup and skip the template render
        if (typeof callback === 'function') return callback(null, singletonCache.markup)
        else return singletonCache.markup
      }
    } else {
      // loop through its keys
      for (const key in templateCache) {
        // if there's a model value for that key name
        cacheKeyModelVal = getOrSetObjectByDotNotation(model, key)
        if (cacheKeyModelVal) {
          // loop through its entries
          const templateCacheAtThisKey = templateCache[key]
          for (const entryKey in templateCacheAtThisKey.entries) {
            // if any entry keys match the model value for that key name
            if (entryKey === cacheKeyModelVal) {
              // check if the timestamp exceeds max age
              const entry = templateCacheAtThisKey.entries[entryKey]
              if (!templateCacheAtThisKey.maxAge && !templateCacheAtThisKey.maxage) {
                // if no max age is set, then this cache doesn't expire
                if (typeof callback === 'function') return callback(null, entry.markup)
                else return entry.markup
              } else if (entry.created + (templateCacheAtThisKey.maxAge || templateCacheAtThisKey.maxage) < Date.now()) {
                // if yes re-render the template and cache it again
                cacheKey = key
                break
              } else {
                // if no return the cached markup and skip the template render
                if (typeof callback === 'function') return callback(null, entry.markup)
                else return entry.markup
              }
            }
          }
          // this is a new model value so it needs a new entry
          cacheKey = key
          break
        }
      }
    }
  }

  // start the render
  renderedTemplate = loadTemplate(template)

  // replace duplicate attributes with temporary unique names before loading into cheerio
  if (!browser) {
    renderedTemplate = renderedTemplate.replace(/<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g, (match, tagName, attributes) => {
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
  }

  dom = cheerioLoad(renderedTemplate || '', cheerioOptions)
  let oldTemplate
  let passes = 0
  let parseDynamicIncludes = false
  do {
    passes++
    if (passes > params.maxPasses) {
      if (params.verbosity > 0) console.error(`teddy could not finish rendering the template because the max number of passes over the template (${params.maxPasses}) was exceeded; there may be an infinite loop in your template logic.`)
      break
    }
    const hasCache = renderedTemplate.includes('</cache>')
    const hasNoteddy = renderedTemplate.includes('</noteddy>')
    const hasNoparse = renderedTemplate.includes('</noparse>')
    const hasPre = renderedTemplate.includes('</pre>')
    const hasIf = renderedTemplate.includes('</if>')
    const hasUnless = renderedTemplate.includes('</unless>')
    const hasTrue = renderedTemplate.includes(' true=')
    const hasFalse = renderedTemplate.includes(' false=')
    const hasInclude = renderedTemplate.includes('</include>')
    const hasLoop = renderedTemplate.includes('</loop>')
    const hasInline = renderedTemplate.includes('</inline>')
    const hasEscape = renderedTemplate.includes('</escape>')
    const hasSelected = renderedTemplate.includes(' selected-value=') || renderedTemplate.includes(' checked-value=')
    oldTemplate = renderedTemplate || ''
    if (passes > 1) {
      dom = cheerioLoad(renderedTemplate || '', cheerioOptions)
      if (parseDynamicIncludes) dom = parseIncludes(dom, model, true)
    }
    if (hasCache) dom = replaceCacheElements(dom, model)
    if (hasEscape) dom = parseEscapes(dom, model)
    if (hasNoteddy || hasNoparse || hasPre) dom = tagNoParseBlocks(dom, model)
    if (hasIf || hasUnless) dom = parseConditionals(dom, model)
    if (hasTrue || hasFalse) dom = parseOneLineConditionals(dom, model)
    if (hasInclude) dom = parseIncludes(dom, model)
    if (hasLoop) dom = parseLoops(dom, model)
    if (hasInline) dom = parseInlines(dom, model)
    if (hasSelected) dom = parseSelectedAttributeValues(dom, model)
    const cachesStillPresent = renderedTemplate.includes('</cache>')
    renderedTemplate = dom.html()
    renderedTemplate = parseVars(renderedTemplate, model)
    if (parseDynamicIncludes) {
      renderedTemplate = removeTeddyComments(renderedTemplate)
      parseDynamicIncludes = false
    }
    if (renderedTemplate.includes('teddydeferreddynamicinclude="true"')) {
      oldTemplate = '' // reset old template to force another pass
      parseDynamicIncludes = true
    }
    if (oldTemplate === renderedTemplate && cachesStillPresent) {
      dom = cheerioLoad(renderedTemplate || '', cheerioOptions)
      dom = defineNewCaches(dom, model)
      renderedTemplate = dom.html()
    }
  } while (oldTemplate !== renderedTemplate)

  // remove stray teddy tags if any exist
  if (renderedTemplate.includes('teddydeferredonelineconditional="true"') || renderedTemplate.includes('</include>') || renderedTemplate.includes('</arg>') || renderedTemplate.includes('</if>') || renderedTemplate.includes('</unless>') || renderedTemplate.includes('</elseif>') || renderedTemplate.includes('</elseunless>') || renderedTemplate.includes('</else>') || renderedTemplate.includes('</loop>') || renderedTemplate.includes('</cache>') || renderedTemplate.includes('</pre>')) {
    dom = cheerioLoad(renderedTemplate || '', cheerioOptions)
    dom = cleanupStrayTeddyTags(dom)
    renderedTemplate = dom.html()
  }

  // replace <noteddy> blocks with the hidden code
  for (const blockId in model._noTeddyBlocks) {
    renderedTemplate = renderedTemplate.replace(`<noteddy id="${blockId}"></noteddy>`, () => model._noTeddyBlocks[blockId])
    renderedTemplate = renderedTemplate.replace(`<noteddy id="${blockId}" pre="true"></noteddy>`, () => model._noTeddyBlocks[blockId])
  }

  if (browser) {
    // fix double-encoding html entity bug in client-side mode
    renderedTemplate = reverseDoubleEncodedEntities(renderedTemplate)

    // now that we're done with the render, reset data-teddy-defer-attr-src and data-teddy-defer-attr-href to native attributes
    renderedTemplate = renderedTemplate.replaceAll('data-teddy-defer-attr-src', 'src').replaceAll('data-teddy-defer-attr-href', 'href')
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

export default {
  params,
  caches,
  templateCaches,

  // functions
  compile,
  setDefaultParams,
  setVerbosity,
  setTemplateRoot,
  setMaxPasses,
  setEmptyVarBehavior,
  setIncludeNotFoundBehavior,
  getTemplates,
  setTemplate,
  setCache,
  clearCache,
  render,
  __express: render
}
