// teddy's compiler
//
// the structure of a template does not change between renders, only the values do. this module walks a template once and emits a tree of nodes that a render walks
//
// three rules:
//
// 1. static markup is taken from cheerio's own serializer, never reconstructed. the compiler replaces each teddy construct in the parsed dom with a placeholder text node and then serializes the whole document, so the literal chunks between placeholders are the same as what the interpreter would have produced
// 2. anything the compiler does not recognize abandons the compile entirely and the template is delegated to the interpreter; partial coverage is therefore safe: a template can only ever come out faster or unchanged, never wrong
// 3. value level semantics are not reimplemented here: formatVariable and evaluateConditional are teddy's own, called from here, so nothing about what a {variable} or an <if> means lives in two places

function internalError (detail) {
  return new Error(`teddy: internal compiler error: ${detail}. this is a bug in teddy, not in your template.`)
}

function warn (params, message) {
  if (params.verbosity > 0) console.warn(`teddy: ${message}`)
}

// marks where a construct's output goes. it contains no character a parser treats as special, so it survives being parsed and serialized again. the browser build swaps cheerio for a small polyfill over the native dom, so the compiler uses only the parts both of them provide
//
// a control character does not belong in markup, but a template is free to contain one, so the one used is picked per template from those the template does not already contain
const TOKEN_CANDIDATES = ['\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007', '\u000e', '\u000f']

const SELECTION_ATTRS = [['selected-value', 'option[value]', 'selected'], ['checked-value', 'input[type="checkbox"][value], input[type="radio"][value]', 'checked']]

// tags whose presence around a construct means an enclosing construct owns it, so it is compiled as part of that one's body rather than on its own
const STRUCTURAL = new Set(['if', 'unless', 'elseif', 'elseunless', 'else', 'loop', 'include', 'arg', 'noteddy', 'noparse', 'pre', 'cache'])
const ARM_TAGS = new Set(['elseif', 'elseunless', 'else'])

// teddy tags that can be left over once every construct has been claimed, because they only mean anything next to something else
const ORPHANABLE = ['arg', 'else', 'elseif', 'elseunless']
const OPENERS = new Set(['if', 'unless'])
const JOINERS = new Set(['and', 'or', 'xor'])
const OUTCOMES = new Set(['true', 'false'])

// every construct that owns the markup inside it, found in one pass so the outermost of them can be picked out. a one line if is in here through its outcome attributes, which is also how the interpreter finds them
// a <noteddy> or <pre> carrying an id is teddy's own marker for content it has already lifted out, not something in the template, so it is left alone here exactly as the old renderer left it alone
const CONSTRUCTS = 'if, unless, loop, include, inline, cache, noteddy:not([id]), noparse:not([id]), pre:not([id]), [true], [false]'

// a sequence of one line ifs on one element needs the element's opening tag worked out for whichever combination of outcomes a render arrives at. there are two to the power of however many conditions there are, so each is built as a render first calls for it and then kept, rather than all of them up front

// teddy's rule for what counts as a variable name
const VALID_VARIABLE = /^(\d+|[a-zA-Z_$][a-zA-Z0-9_$|{}.-]*(\.[a-zA-Z_$][a-zA-Z0-9_$|{}.-]*)*)$/

// what a value has to contain before anything further needs doing with it. deliberately specific: a value carrying ordinary markup such as <strong> is finished as it stands, and treating it otherwise would cost every template that injects safe html
const LOOKS_LIKE_TEDDY = /\{|<\/?(?:if|unless|elseif|elseunless|else|loop|include|arg|cache|inline|noteddy|noparse)\b|\s(?:true|false|selected-value|checked-value)=|\sif-/i

// whether a value carries teddy tags, as opposed to only carrying {variables}. a value of only variables and text cannot affect the shape of the document, so nothing about it has to be checked before compiling it
const HAS_TEDDY_TAGS = /<\/?(?:if|unless|elseif|elseunless|else|loop|include|arg|cache|inline|noteddy|noparse)\b|\s(?:true|false|selected-value|checked-value)=|\sif-/i

// teddy's marker for a block it has lifted out of the markup. one of these turns up inside a value whenever a rendered fragment is passed on through another variable, which is what a layout taking its page as an argument does, and it is not something to look at a second time
const NOTEDDY_PLACEHOLDER = /<noteddy id="\d+"(?: pre="true")?><\/noteddy>/g

// elements that never carry a closing tag, so an unclosed one of these does not mean the markup is unfinished
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

// stands in for what a variable writes when working that out needs a model, which is the uncommon case
const NEEDS_MODEL = Symbol('teddy: value needs a model')

// how many opening tags of a one line if are worth writing out in full. two conditions on one element is four tags, which is already more than almost any element carries
const MAX_EMITTED_VARIANTS = 4

// what makes a plain value worth a second look: a character that has to be escaped, or the opening of a {variable} the value carries of its own
const QUICK_VALUE_STOP = /[&<>"'{]/

// values that came in through the model and have been compiled, kept against the value itself so a page rendering the same snippet over and over compiles it once
const MAX_VALUE_TEMPLATES = 10000

// a value may refer to another value, which may refer to another, and so on. a value that comes round again is a loop the model cannot resolve, and it is reported rather than chased
const MAX_VALUE_DEPTH = 1000

export function createCompiler (deps) {
  const {
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
  } = deps

  // #region compiling

  let token = TOKEN_CANDIDATES[0]
  const tokenFor = index => token + index + token

  // returns a node tree, or null if the template contains anything this compiler does not handle yet, which means the caller should interpret it instead
  function compileTemplate (source, stack = []) {
    token = TOKEN_CANDIDATES.find(candidate => !source.includes(candidate)) ?? TOKEN_CANDIDATES[0]
    // one slot list for the whole template, so a placeholder found inside a construct's body means the same thing there as it did in the document it came out of
    const slots = []
    const nodes = compileMarkup(source, slots, stack)
    // bodies are compiled after their document has been serialized, and compiling one can add slots of its own, so this walks the list as it grows rather than a snapshot of it
    for (let i = 0; i < slots.length; i++) compileSlotBody(slots[i], slots)
    return nodes
  }

  function compileSlotBody (slot, slots) {
    if (slot.type === 'arm') {
      const arm = slot.branch.arms[slot.index]
      if (arm.body === null) arm.body = compileMarkup(arm.bodySource, slots, slot.stack)
      return
    }
    if (slot.bodySource !== undefined && slot.body === null) slot.body = compileMarkup(slot.bodySource, slots, slot.stack)
    // an argument's body is a template in its own right, rendered against the model the include is reached with
    if (slot.bindings) {
      for (const binding of slot.bindings) {
        if (binding.body === null) binding.body = compileMarkup(binding.bodySource, slots, slot.stack)
      }
    }
  }
  function compileMarkup (source, slots, stack) {
    reportStrayClosingTags(source)
    const dom = cheerioLoad(source || '', cheerioOptions)

    applySelectionAttributes(dom, slots)

    // every construct is found in one pass and narrowed to the outermost of them, so none of the elements about to be replaced contains another. that is what lets each body be captured intact: going type by type would mean replacing a loop that sits inside an element whose body has not been read yet
    const outermost = Array.from(dom(CONSTRUCTS)).filter(el => !hasConstructAncestor(el))
    const claimed = new Set()

    for (const el of outermost) {
      if (claimed.has(el)) continue
      const name = tagNameOf(el)
      if (OPENERS.has(name)) claimConditional(dom, el, slots, claimed, stack)
      else if (name === 'loop') claimLoop(dom, el, slots, stack)
      else if (name === 'include') claimInclude(dom, el, slots, stack)
      else if (name === 'inline') claimInline(dom, el, slots)
      else if (name === 'cache') claimCache(dom, el, slots, stack)
      else if (name === 'noteddy' || name === 'noparse') claimNoParse(dom, el, slots, false)
      else if (name === 'pre') claimPre(dom, el, slots)
      else claimOneLineIf(dom, el, slots, stack)
    }

    // anything teddy still recognizes at this point belongs to nothing, and goes
    sweepOrphanedTags(dom)

    return buildNodes(dom.html(), slots)
  }

  // what a set of conditions asks, worked out while the template is compiled: for each one the name it looks up, whether it is negated, and what it compares against
  //
  // this covers one condition on its own and two joined by a single operator, which between them is nearly every conditional anyone writes. anything else, and anything with a quirk in it that the general path handles specially, comes back null and is left to that path
  //
  // knowing this at compile time is what lets a render answer a conditional without building an argument list, reducing it in place, and reading the same strings apart again every time
  function conditionChecks (pairs) {
    const checks = []
    for (const [rawName, rawValue] of pairs) {
      if (rawName === 'and' || rawName === 'or' || rawName === 'xor') {
        checks.push(rawName)
        continue
      }
      let name = rawName
      const not = name.startsWith('not:')
      if (not) name = name.slice(4)
      // a colon anywhere but the not: prefix, or an equals sign in the name, is something the general path rejects outright and warns about
      if (!name || name.includes(':') || name.includes('=')) return null
      if (!rawValue) {
        checks.push({ path: name, not, compare: null })
        continue
      }
      // a value carrying a colon or an equals sign is also rejected by the general path, in its own particular way, and a value holding a {variable} is only resolved on the opening arm of a chain. all three are left where their behavior is already written down
      if (rawValue.includes(':') || rawValue.includes('=') || rawValue.includes('{')) return null
      checks.push({ path: name, not, compare: rawValue })
    }
    const shapeIsOne = checks.length === 1 && typeof checks[0] === 'object'
    const shapeIsPair = checks.length === 3 && typeof checks[0] === 'object' && typeof checks[1] === 'string' && typeof checks[2] === 'object'
    return shapeIsOne || shapeIsPair ? checks : null
  }

  // whether a value counts as being there. an empty object or an empty array does not
  function valuePresent (value) {
    return value ? !(typeof value === 'object' && Object.keys(value).length === 0) : false
  }

  // whether one condition holds, given the value it looks up already looked up
  function settleCheck (check, value) {
    let result
    if (check.compare === null) result = valuePresent(value)
    else result = value == check.compare // eslint-disable-line eqeqeq -- teddy compares conditions loosely on purpose, so "1" and 1 are the same answer
    return check.not ? !result : result
  }

  // whether conditions of a shape settled at compile time hold
  //
  // the general path's reduction is not repeated here, it is not needed: one condition reduces to itself, and two joined by an operator reduce to that operator applied to both. everything else still goes through the general path, which is the only place those rules are written
  function settleChecks (checks, model, values) {
    const first = settleCheck(checks[0], values ? values[0] : getOrSetObjectByDotNotation(model, checks[0].path))
    if (checks.length === 1) return first
    const second = settleCheck(checks[2], values ? values[2] : getOrSetObjectByDotNotation(model, checks[2].path))
    if (checks[1] === 'and') return first && second
    if (checks[1] === 'or') return first || second
    return first !== second // xor
  }

  // every arm of a conditional chain gets its own slot. the interpreter leaves the whitespace between arms in place and writes the winning arm's content where that arm sat, so one slot for a whole chain would move content and change the output
  function claimConditional (dom, el, slots, claimed, stack) {
    const branch = { arms: [] }
    for (const arm of collectChain(el)) {
      claimed.add(arm)
      const attribs = readAttribs(arm)
      branch.arms.push({
        kind: tagNameOf(arm),
        attribs,
        checks: conditionChecks(attribs),
        // compiled once the document has been serialized: recursing now would descend into a dom that is still being rewritten
        bodySource: dom(arm).html(),
        body: null
      })
      slots.push({ type: 'arm', branch, index: branch.arms.length - 1, stack })
      dom(arm).replaceWith(tokenFor(slots.length - 1))
    }
  }

  function claimLoop (dom, el, slots, stack) {
    const attribs = readAttribs(el)
    slots.push({
      type: 'loop',
      stack,
      through: attribValue(attribs, 'through'),
      keyName: attribValue(attribs, 'key'),
      valName: attribValue(attribs, 'val'),
      bodySource: dom(el).html(),
      body: null
    })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  // an element carrying one line ifs has an opening tag that depends on the model, so it cannot be part of the static markup. rather than reproducing how the dom parser writes an attribute list out, the opening tag is worked out here for every combination of outcomes, by that same parser, applying the same attribute changes the interpreter applies. the render then picks one of them
  function claimOneLineIf (dom, el, slots, stack) {
    const pairs = readAttribs(el)

    // an element can carry a sequence of one line conditionals rather than only one: a condition, any further conditions joined to it, then the outcomes for that condition, and then possibly another condition beginning the next one in the sequence
    const conditionals = []
    let current = null
    for (const [name, value] of pairs) {
      if (name.startsWith('if-')) {
        if (!current || current.ifTrue !== undefined || current.ifFalse !== undefined) {
          current = { argSources: [], args: null, dynamic: false, ifTrue: undefined, ifFalse: undefined }
          conditionals.push(current)
        }
        // split the way the interpreter splits it rather than by length, so an attribute name containing if- more than once is read identically
        const condition = name.split('if-')[1]
        current.argSources.push([condition, value])
        // a condition whose value names a variable is not known until there is a model to read it from, exactly as for an <if> tag. the variable may sit anywhere in the value rather than at its head, so any brace means the value has to be resolved
        if (value && value.includes('{')) current.dynamic = true
      } else if (OUTCOMES.has(name)) {
        if (current) current[name === 'true' ? 'ifTrue' : 'ifFalse'] = value.replaceAll('&quot;', '"')
      } else if (JOINERS.has(name)) {
        if (current) current.argSources.push([name, null])
      }
    }
    if (!conditionals.length) {
      warn(params, `a <${tagNameOf(el)}> carries a "${pairs.find(([name]) => OUTCOMES.has(name))?.[0]}" attribute with no if- condition for it to be the outcome of, so it has been removed.`)
      for (const [name] of pairs) if (OUTCOMES.has(name) || JOINERS.has(name)) dom(el).removeAttr(name)
      return
    }

    // a condition holding nothing model dependent is reduced to its finished form once, here, rather than being rebuilt on every render
    for (const conditional of conditionals) {
      if (!conditional.dynamic) conditional.args = oneLineArgs(conditional.argSources, null)
      conditional.checks = conditional.dynamic ? null : conditionChecks(conditional.argSources)
    }

    const { openTag, closeTag } = splitTag(dom, el)
    // whether either half of a one line if has anything to ask a model about, settled here so that emitted code inside a <loop> knows not to build one. working out which outcomes apply needs a model only for a condition this could not settle, and writing the opening tag needs one only if the tag or an outcome holds a {variable}
    const outcomesNeedModel = conditionals.some(conditional => !conditional.checks)
    const variantNeedsModel = openTag.includes('{') || conditionals.some(conditional => (conditional.ifTrue || '').includes('{') || (conditional.ifFalse || '').includes('{'))
    slots.push({
      type: 'attrs',
      conditionals,
      outcomesNeedModel,
      variantNeedsModel,
      openTag,
      closeTag,
      tagName: tagNameOf(el),
      variants: [],
      bodySource: dom(el).html(),
      body: null,
      stack
    })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  // an <include> is resolved while compiling: the partial is loaded, compiled, and becomes part of the parent's tree, so nothing about finding or parsing it is left to happen per render
  //
  // an <arg> is compiled as a template of its own and rendered against the model the include is reached with, rather than being handed to the partial as unrendered markup for a later pass to finish. that is what keeps an argument carrying markup or a {variable} on the fast path, and it resolves such an argument against the caller's model rather than against the partial's, which differs only where one argument's body names another argument
  function claimInclude (dom, el, slots, stack) {
    const src = attribValue(readAttribs(el), 'src')

    // the interpreter drops an include with no src rather than leaving anything behind
    if (!src) {
      if (params.verbosity > 1) console.warn('teddy encountered an include tag with no src attribute.')
      dom(el).replaceWith('')
      return
    }

    // a src that names a variable is not known until there is a model to read it from, so the partial behind it is loaded and compiled on the first render that asks for it and kept against that name
    if (src.includes('{')) {
      slots.push({
        type: 'dynamicInclude',
        src,
        bindings: readArgs(dom, el),
        compiled: new Map(),
        stack
      })
      dom(el).replaceWith(tokenFor(slots.length - 1))
      return
    }

    // a template that includes itself would otherwise be compiled forever
    if (stack.includes(src)) {
      throw new Error(`teddy: the template "${src}" includes itself, directly or through the templates it includes, so it can never finish compiling. include stack: ${stack.concat(src).map(name => JSON.stringify(name)).join(' -> ')}`)
    }

    const included = loadTemplate(src)
    let markup = included
    if (included === null) {
      if (params.verbosity > 1) console.warn(`teddy encountered an include tag with a src set to a template that could not be found: ${src}`)
      markup = params.includeNotFoundBehavior === 'display' ? `Template "${src}" not found!` : ''
    }

    slots.push({
      type: 'scope',
      bindings: readArgs(dom, el),
      bodySource: markup,
      body: null,
      stack: stack.concat(src)
    })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  // selected-value and checked-value mark whichever of an element's descendants carries a matching value
  //
  // when the value is written in the template the marking is settled here and nothing is left to a render. when it comes from the model, each candidate descendant gets its opening tag both ways and the render picks, which is the same approach one line ifs use
  //
  // a candidate written inside a <loop> or an <if> is still written in the template, so it is found and prepared here too; it simply ends up inside that construct's body and is decided once per iteration
  //
  // a candidate arriving through an <include> is the one case this cannot reach, because the partial has not been pulled in yet when this runs
  function applySelectionAttributes (dom, slots) {
    for (const [attr, childSelector, marker] of SELECTION_ATTRS) {
      for (const el of Array.from(dom(`[${attr}]`))) {
        if (browser) el.attribs = getAttribs(el)
        if (!inlineIncludes(dom, el)) {
          warn(params, `a ${attr} could not be applied because the elements it would mark come from an <include> that cannot be resolved before rendering: either its src is a variable, or it takes arguments. move the ${attr} inside the included template.`)
          for (const name of Object.keys(el.attribs || {})) {
            if ((name.includes('-teddyduplicate') ? name.split('-teddyduplicate')[0] : name) === attr) dom(el).removeAttr(name)
          }
          continue
        }

        for (const [name, valueSource] of readAttribs(el)) {
          if (name !== attr || !valueSource) continue
          const candidates = Array.from(dom(el).find(childSelector))
          for (const child of candidates) {
            if (browser) child.attribs = getAttribs(child)
            const ownValue = child.attribs.value
            // both sides have to be written out before the match can be settled here
            if (!valueSource.includes('{') && !(ownValue && ownValue.includes('{'))) {
              if (ownValue === valueSource) dom(child).attr(marker, marker)
              continue
            }
            claimSelectionCandidate(dom, child, slots, valueSource, ownValue, marker)
          }
        }

        // the attribute has done its job, and the interpreter takes it off too
        for (const name of Object.keys(el.attribs || {})) {
          if ((name.includes('-teddyduplicate') ? name.split('-teddyduplicate')[0] : name) === attr) dom(el).removeAttr(name)
        }
      }
    }
  }

  // an <include> inside a selection container is pulled in here, before the candidates are looked for, because otherwise its <option> or <input> elements would not be there to find. only a plain include can be inlined this way: one taking arguments has a scope of its own, which inlining would lose
  function inlineIncludes (dom, container) {
    for (let round = 0; round < 10; round++) {
      const includes = Array.from(dom(container).find('include'))
      if (!includes.length) return true
      for (const el of includes) {
        const src = attribValue(readAttribs(el), 'src')
        if (!src || src.includes('{')) return false
        for (const child of Array.from(dom(el).children())) if (tagNameOf(child) === 'arg') return false
        const markup = loadTemplate(src)
        if (markup === null) return false
        dom(el).replaceWith(markup)
      }
    }
    return false // includes nested past any sensible depth
  }

  // one candidate for a selected-value or checked-value whose value is not known yet: its opening tag is prepared both marked and unmarked, and the render writes whichever the model calls for
  function claimSelectionCandidate (dom, el, slots, valueSource, ownValue, marker) {
    const tagName = tagNameOf(el)
    const { openTag, closeTag } = splitTag(dom, el)

    const plain = []
    pushText(plain, openTag)

    const probe = cheerioLoad(openTag + closeTag, cheerioOptions)
    const target = probe(tagName)[0]
    if (!target) throw internalError(`a <${tagName}> could not be read back after being parsed on its own`)
    probe(target).attr(marker, marker)
    const rebuilt = probe(target).toString()
    const marked = []
    pushText(marked, closeTag && rebuilt.endsWith(closeTag) ? rebuilt.slice(0, rebuilt.length - closeTag.length) : rebuilt)

    slots.push({
      type: 'selection',
      valueSource,
      ownValue,
      variants: [plain, marked],
      closeTag,
      bodySource: dom(el).html(),
      body: null,
      stack: []
    })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  // <noteddy> and <noparse> keep their contents out of teddy's hands. the interpreter lifts them out of the markup, renders everything else, and puts them back at the very end; here they simply become a piece of text nothing further is done to, which is the same thing said more directly
  function claimNoParse (dom, el, slots, keepTags) {
    slots.push({ type: 'raw', value: keepTags ? dom(el).toString() : dom(el).html() })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  // a <pre> keeps its own tags as well as its contents, unless it carries a parse attribute, which asks for the opposite: its contents are compiled like anything else and the attribute itself comes off, which is what the stray tag sweep does for the interpreter
  function claimPre (dom, el, slots) {
    if (carriesParse(el)) {
      dom(el).removeAttr('parse')
      return
    }
    claimNoParse(dom, el, slots, true)
  }

  function carriesParse (el) {
    if (browser) el.attribs = getAttribs(el)
    return !!el.attribs && Object.prototype.hasOwnProperty.call(el.attribs, 'parse')
  }

  // a <cache> keeps the markup its body rendered to and writes that instead of rendering again. the interpreter does this in two halves, marking the element on the way in and storing what it produced once the output has gone stable; a compiled render knows when the body is finished, so it is one step here
  function claimCache (dom, el, slots, stack) {
    const attribs = readAttribs(el)
    slots.push({
      type: 'cache',
      name: attribValue(attribs, 'name'),
      // an absent key means the whole body is cached under one entry, which teddy calls 'none'
      key: attribValue(attribs, 'key'),
      maxAge: parseInt(attribValue(attribs, 'maxAge') || attribValue(attribs, 'maxage')) || 0,
      maxCaches: parseInt(attribValue(attribs, 'maxCaches') || attribValue(attribs, 'maxcaches')) || 1000,
      bodySource: dom(el).html(),
      body: null,
      stack
    })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  function claimInline (dom, el, slots) {
    const attribs = readAttribs(el)
    slots.push({ type: 'inline', css: attribValue(attribs, 'css'), js: attribValue(attribs, 'js') })
    dom(el).replaceWith(tokenFor(slots.length - 1))
  }

  function readArgs (dom, el) {
    const bindings = []
    for (const child of Array.from(dom(el).children())) {
      if (tagNameOf(child) !== 'arg') continue
      if (browser) child.attribs = getAttribs(child)
      // the interpreter takes an argument's name from its first attribute, and skips one that has none
      const name = Object.keys(child.attribs || {})[0]
      if (!name) continue
      bindings.push({ name, bodySource: dom(child).html(), body: null })
    }
    return bindings
  }

  // a template is parsed before the model contributes anything to it, so it has to be well formed on its own
  //
  // only a close with no open at all is reported: html leaves plenty of tags implicitly closed, and complaining about those would be noise
  function reportStrayClosingTags (source) {
    if (params.verbosity < 1 || !source || !source.includes('</')) return
    const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g
    const open = []
    let match
    while ((match = tag.exec(source))) {
      const name = match[2].toLowerCase()
      if (VOID_ELEMENTS.has(name) || match[3].trimEnd().endsWith('/')) continue
      if (!match[1]) open.push(name)
      else if (open.includes(name)) open.splice(open.lastIndexOf(name), 1)
      else {
        console.warn(`teddy: the template closes a <${name}> it never opened. templates are parsed on their own, so a closing tag cannot be paired up by markup arriving through the model, and this one will be dropped.`)
        return
      }
    }
  }

  // an element's opening and closing tags, taken apart by length rather than by looking for a bracket, since an attribute value may contain one. a void element has no closing tag and all of its serialization is the opening tag
  function splitTag (dom, el) {
    const outer = dom(el).toString()
    const inner = dom(el).html() || ''
    const closeTag = `</${tagNameOf(el)}>`
    if (!outer.endsWith(closeTag) || outer.length < closeTag.length + inner.length) return { openTag: outer, closeTag: '' }
    return { openTag: outer.slice(0, outer.length - closeTag.length - inner.length), closeTag }
  }

  // the opening tag as it looks with one combination of outcomes applied: the parser is handed the tag on its own, the one line if attributes come off it, the outcomes go on, and the result is read back out. bit `i` of outcomes is set when condition `i` came out true
  function openTagFor (openTag, closeTag, tagName, conditionals, outcomes) {
    const probe = cheerioLoad(openTag + closeTag, cheerioOptions)
    const target = probe(tagName)[0]
    if (!target) throw internalError(`a <${tagName}> carrying a one line if could not be read back after being parsed on its own`)
    if (browser) target.attribs = getAttribs(target)

    // the interpreter takes every one line if attribute off before it applies any outcome, so an outcome lands after whatever attributes the element keeps
    for (const name of Object.keys(target.attribs || {})) {
      const clean = name.includes('-teddyduplicate') ? name.split('-teddyduplicate')[0] : name
      if (clean.startsWith('if-') || OUTCOMES.has(clean) || JOINERS.has(clean)) probe(target).removeAttr(name)
    }
    for (let i = 0; i < conditionals.length; i++) {
      const outcome = (outcomes >> i) & 1 ? conditionals[i].ifTrue : conditionals[i].ifFalse
      if (!outcome) continue
      const parts = outcome.split('=')
      probe(target).attr(parts[0], parts[1] ? parts[1].replace(/["']/g, '') : '')
    }

    const rebuilt = probe(target).toString()
    return closeTag && rebuilt.endsWith(closeTag) ? rebuilt.slice(0, rebuilt.length - closeTag.length) : rebuilt
  }

  // from an <if> or <unless>, the elseif, elseunless and else tags belonging to it. this mirrors the interpreter's sibling walk exactly, including that it steps over text nodes and stops at the next fresh if or unless
  function collectChain (el) {
    const chain = [el]
    let sibling = el.nextSibling
    while (sibling) {
      const name = tagNameOf(sibling)
      if (ARM_TAGS.has(name)) {
        chain.push(sibling)
        sibling = sibling.nextSibling
      } else if (OPENERS.has(name)) break
      else sibling = sibling.nextSibling
    }
    return chain
  }

  function tagNameOf (el) {
    if (!el) return ''
    return (browser ? el.nodeName?.toLowerCase() : el.name) || ''
  }

  // an element's attributes in source order, as pairs rather than an object. a condition may name the same variable or the same operator twice, and those arrive renamed so an html parser will not drop them; collapsing them into an object by their real names would silently throw one away and change what the condition means
  function readAttribs (el) {
    if (browser) el.attribs = getAttribs(el)
    const pairs = []
    for (const name in el.attribs) {
      pairs.push([name.includes('-teddyduplicate') ? name.split('-teddyduplicate')[0] : name, el.attribs[name]])
    }
    return pairs
  }

  function attribValue (pairs, name) {
    for (const [key, value] of pairs) if (key === name) return value
    return undefined
  }

  function hasConstructAncestor (el) {
    let parent = el.parent || el.parentNode
    while (parent) {
      const name = tagNameOf(parent)
      if (!name || name === 'body' || name === 'html' || name === 'root') return false
      // a <pre parse> is asking for its contents to be parsed, so it does not own them
      if ((STRUCTURAL.has(name) && !(name === 'pre' && carriesParse(parent))) || carriesOneLineIf(parent)) return true
      parent = parent.parent || parent.parentNode
    }
    return false
  }

  function carriesOneLineIf (el) {
    if (browser) el.attribs = getAttribs(el)
    if (!el.attribs) return false
    for (const name in el.attribs) {
      if (OUTCOMES.has(name.includes('-teddyduplicate') ? name.split('-teddyduplicate')[0] : name)) return true
    }
    return false
  }

  // by the time this runs every construct has been claimed, so a teddy tag still standing here is one that belongs to nothing: e.g. an <arg> with no <include> around it, or an <else> with no <if> before it
  function sweepOrphanedTags (dom) {
    for (const name of ORPHANABLE) {
      for (const el of Array.from(dom(name))) {
        warn(params, `a <${name}> in the template has no ${name === 'arg' ? '<include> around it' : 'preceding <if> or <unless>'}, so it and its contents have been removed.`)
        dom(el).remove()
      }
    }
    for (const el of Array.from(dom('*'))) {
      if (browser) el.attribs = getAttribs(el)
      for (const name in el.attribs) {
        const clean = name.includes('-teddyduplicate') ? name.split('-teddyduplicate')[0] : name
        // a one line if is claimed before this runs, and one carrying no condition has had its attributes taken off, so nothing should be left here
        if (OUTCOMES.has(clean)) throw internalError(`a "${clean}" attribute survived one line if compilation on a <${tagNameOf(el)}>`)
      }
    }
  }

  // splits the serialized markup on its placeholders, and splits the literal text between them into runs of markup and variable slots
  function buildNodes (markup, slots) {
    const nodes = []
    let cursor = 0

    while (cursor < markup.length) {
      const open = markup.indexOf(token, cursor)
      if (open === -1) {
        pushText(nodes, markup.slice(cursor))
        break
      }
      pushText(nodes, markup.slice(cursor, open))
      const close = markup.indexOf(token, open + 1)
      if (close === -1) throw internalError('a placeholder did not survive serialization intact')
      const index = Number(markup.slice(open + 1, close))
      if (!Number.isInteger(index) || !slots[index]) throw internalError(`a placeholder referred to a slot that does not exist: ${JSON.stringify(markup.slice(open + 1, close))}`)
      nodes.push(slots[index])
      cursor = close + 1
    }

    return nodes
  }

  function pushText (nodes, text) {
    if (!text) return
    let cursor = 0
    let literalFrom = 0

    while (cursor < text.length) {
      const open = text.indexOf('{', cursor)
      if (open === -1) break

      // the closing brace is found by counting nested braces, the way teddy's own delimiter matcher does, so that only an outermost balanced pair is ever treated as a variable. that is what keeps a css rule or a block of javascript from being read as one: the interpreter does not substitute a variable sitting inside a brace pair either
      let depth = 0
      let close = -1
      for (let i = open; i < text.length; i++) {
        if (text[i] === '{') depth++
        else if (text[i] === '}' && --depth === 0) {
          close = i
          break
        }
      }
      if (close === -1) break // the braces do not balance, so the rest of this run is text
      const inner = text.slice(open + 1, close)

      if (!inner || !VALID_VARIABLE.test(inner)) {
        // not a variable, so the whole pair is ordinary text and the scan resumes after it
        cursor = close + 1
        continue
      }

      // a variable name may hold a variable of its own: {a{b}} resolves b, joins the result onto a, and looks up whatever that spells. the name is a little template, so it is compiled as one and rendered when there is a model to render it against
      const computed = inner.includes('{')

      // teddy substitutes a variable in both its {name} and its template literal ${name} form, so a dollar immediately before the brace is part of this variable's span and is consumed with it
      const spanStart = open > literalFrom && text[open - 1] === '$' ? open - 1 : open
      if (spanStart > literalFrom) nodes.push({ type: 'text', value: text.slice(literalFrom, spanStart) })
      if (computed) {
        const nameNodes = []
        pushText(nameNodes, inner)
        nodes.push({ type: 'computedVar', nameNodes, source: text.slice(spanStart, close + 1) })
      } else {
        // a variable's flags are the same for every render, so they are settled here rather than read off the end of its name every time
        const flags = variableFlags(inner)
        nodes.push({
          type: 'var',
          name: inner,
          flags,
          source: text.slice(spanStart, close + 1),
          dollar: spanStart !== open,
          // only a raw variable can put markup into the page that a further look would parse: an escaped one cannot, and a no parse one is never looked at again
          raw: flags.raw
        })
      }
      cursor = close + 1
      literalFrom = cursor
    }

    if (literalFrom < text.length) nodes.push({ type: 'text', value: text.slice(literalFrom) })
  }

  // #endregion

  // #region rendering

  const valueTemplates = new Map()

  // a value that arrived through the model may be a little template in its own right: it can hold {variables}, and a raw one can hold teddy tags. rather than handing the page back to the interpreter, the value is compiled and kept against itself, so a snippet that recurs is compiled once and rendered from then on
  //
  // returns null when the value has to go to the interpreter after all
  function compileValue (text) {
    let nodes = valueTemplates.get(text)
    if (nodes !== undefined) return nodes
    if (HAS_TEDDY_TAGS.test(text) && !isSelfContained(text)) nodes = null
    else nodes = compileTemplate(text)
    if (valueTemplates.size > MAX_VALUE_TEMPLATES) valueTemplates.clear()
    valueTemplates.set(text, nodes)
    return nodes
  }

  // whether a value's tags open and close within the value, so that it stands on its own
  //
  // a value that opens a construct the surrounding template closes, or closes one the template opened, only means anything joined to that template. teddy renders such a thing because it reparses its own output, and that is the one case a value cannot be compiled on its own
  function isSelfContained (text) {
    const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g
    const open = []
    let match
    while ((match = tag.exec(text))) {
      const [, closing, rawName, rest] = match
      const name = rawName.toLowerCase()
      if (VOID_ELEMENTS.has(name) || rest.trimEnd().endsWith('/')) continue
      if (!closing) open.push(name)
      else if (open[open.length - 1] === name) open.pop()
      else return false // closes something this value never opened
    }
    return open.length === 0
  }

  // a value that turned out to be a template: compiled, then rendered against the model in hand
  //
  // the chain of values being resolved is kept so that a value which comes round again is recognized as a loop in the model rather than chased until something gives out
  function renderValue (text, model, state) {
    if (state.values.includes(text) || state.values.length >= MAX_VALUE_DEPTH) {
      if (params.verbosity > 0) {
        const chain = state.values.concat(text).map(value => JSON.stringify(value.length > 40 ? value.slice(0, 40) + '...' : value))
        console.error(`teddy: a value in the model refers back to itself, so it can never finish resolving, and it has been written out as it stands. the values leading the chain were: ${chain.join(' -> ')}`)
      }
      return text
    }
    const nodes = compileValue(text)
    // markup arriving through the model has to make sense on its own. one that opens a teddy tag it does not close, or closes one it did not open, only means something joined to the template it landed in, and a template is no longer reparsed once its values are in place
    if (nodes === null) {
      warn(params, `a variable was given markup that is not complete on its own, so it has been left out. markup coming from the model has to open and close its own tags: ${JSON.stringify(text.length > 120 ? text.slice(0, 120) + '...' : text)}`)
      return ''
    }
    state.values.push(text)
    const out = renderNodes(nodes, model, state)
    state.values.pop()
    return out
  }

  function renderNodes (nodes, model, state) {
    let out = ''
    // the arms of one chain are always consecutive in a node list, so the winner is worked out when the first arm is reached and reused by the rest without any bookkeeping
    let openBranch = null
    let winningArm = -1

    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          out += node.value
          break

        case 'var': {
          const resolved = formatVariable(node.flags, getOrSetObjectByDotNotation(model, node.flags.name), model)
          // nothing to write, so the variable stays in the markup verbatim
          if (!resolved) {
            out += node.source
            break
          }
          // a variable that did not resolve keeps its own text, and the dollar of a ${name} form survives with it because teddy skips that substitution in this case
          if (node.dollar && resolved.skipTemplateLiteralReplacement) out += '$'
          out += writeValue(resolved, node.raw, model, state)
          break
        }

        case 'arm':
          if (node.branch !== openBranch) {
            openBranch = node.branch
            winningArm = pickArm(node.branch, model)
          }
          if (node.index === winningArm) out += renderNodes(node.branch.arms[node.index].body, model, state)
          break

        case 'attrs':
          out += renderNodes(attrsVariant(node, attrsOutcomes(node, model)), model, state)
          out += renderNodes(node.body, model, state)
          out += node.closeTag
          break

        case 'raw':
          out += rawBlock(node, model)
          break

        case 'inline':
          out += inlineBlock(node, model)
          break

        case 'computedVar':
          out += computedVariable(renderNodes(node.nameNodes, model, state), model, state)
          break

        case 'selection':
          out += renderNodes(node.variants[selectionMarked(node, model) ? 1 : 0], model, state)
          out += renderNodes(node.body, model, state)
          out += node.closeTag
          break

        case 'cache':
          out += cacheBlock(node, model, () => renderNodes(node.body, model, state))
          break

        case 'dynamicInclude':
          out += renderNodes(dynamicBody(node, model), node.bindings.length ? bindArgs(model, node.bindings, node.bindings.map(binding => renderNodes(binding.body, model, state))) : model, state)
          break

        case 'scope': {
          if (!node.bindings.length) {
            out += renderNodes(node.body, model, state)
            break
          }
          out += renderNodes(node.body, bindArgs(model, node.bindings, node.bindings.map(binding => renderNodes(binding.body, model, state))), state)
          break
        }

        case 'loop':
          out += renderLoop(node, model, state)
          break
      }
    }

    return out
  }

  // what a resolved variable actually writes. a value that turned out to hold {variables} or teddy tags of its own is a template and is rendered as one; anything else is already finished
  //
  // a variable that did not resolve is left out of this: its text always holds a brace, and treating every missing variable as a template would cost the win for nothing
  function writeValue (resolved, raw, model, state) {
    const text = writePlainValue(resolved, raw)
    return text === NEEDS_MODEL ? renderValue(resolved.text, model, state) : text
  }

  // what a {variable} carrying no flags writes, when that can be answered from the value alone, and undefined when the full path has to work it out
  //
  // undefined is the answer for "ask properly" because it is the cheapest thing a caller can test for, and no value this can say yes to is undefined
  //
  // a plain variable holding a plain string is the overwhelming majority of what a page writes, and for that there is nothing to decide: escape it and write it. answering it here saves working out flags that were settled at compile time, building the object that carries the answer, and asking a second time whether the answer is finished
  //
  // the one scan covers both jobs at once. a value with nothing in it that needs escaping and no {variable} of its own is finished, and a value that trips the scan is rare enough to be worth going back over
  function quickValue (value) {
    const type = typeof value
    // a string is asked about first because a string is what almost every variable holds, and the two questions it has to answer are answered by the one scan: nothing to escape and no {variable} of its own means the value is already what it writes
    //
    // the empty string is not checked for: it trips nothing here and writes as itself, which is what the full path would decide too
    if (type === 'string') {
      if (!QUICK_VALUE_STOP.test(value)) return value
      if (value.includes('{')) return undefined
      return escapeEntities(value)
    }
    // a number writes itself and needs no scanning: there is nothing in one to escape and nothing in one that could be teddy code. zero is left to the full path because whether it writes "0" or nothing at all depends on a setting, and so is a NaN, which writes the variable's own text
    if (type === 'number') return value === 0 || Number.isNaN(value) ? undefined : value
    if (type === 'boolean') return value || undefined // false writes the variable's own text
    return undefined
  }

  // what a variable writes when the quick answer did not apply
  //
  // this is one call rather than the half dozen lines of branching it replaces, because those lines sat in the emitted function for every variable on the page and were almost never the ones taken. a shorter function is one v8 will inline into, and the branches are the same branches either way
  //
  // dollar says the variable was written in template literal form. a variable that did not resolve keeps its own text, and the dollar keeps its place in front of it
  function slowValue (flags, value, raw, source, model, state, dollar) {
    const resolved = formatVariable(flags, value, model)
    if (resolved === null) return source
    const text = writePlainValue(resolved, raw)
    const written = text === NEEDS_MODEL ? renderValue(resolved.text, model, state) : text
    return dollar && resolved.skipTemplateLiteralReplacement ? '$' + written : written
  }

  // what a resolved variable writes, when that can be answered without a model, and NEEDS_MODEL when it cannot
  //
  // almost every value is finished the moment it is looked up, and the two that are not are a value holding a {variable} of its own and a raw value holding teddy markup. emitted code asks this first and only reaches for a model on the rare answer, which is what lets a loop body avoid building one at all
  function writePlainValue (resolved, raw) {
    const text = resolved.text
    if (typeof text !== 'string' || resolved.skipTemplateLiteralReplacement) return text
    if (text.includes('{')) return NEEDS_MODEL
    if (raw && needsAnotherLook(text)) return NEEDS_MODEL
    return text
  }

  // whether a raw value holds anything teddy still has to do something about. a value made only of finished markup and teddy's own placeholders is done
  function needsAnotherLook (text) {
    if (!LOOKS_LIKE_TEDDY.test(text)) return false
    return LOOKS_LIKE_TEDDY.test(text.replace(NOTEDDY_PLACEHOLDER, ''))
  }

  // which combination of a one line if's outcomes this model calls for, as a bitmask
  // valueSets, when given, holds what each conditional's conditions look up already looked up, one array per conditional, which is what a compiled template hands in rather than having the lookups done again
  function attrsOutcomes (node, model, valueSets) {
    let outcomes = 0
    for (let i = 0; i < node.conditionals.length; i++) {
      const conditional = node.conditionals[i]
      if (conditional.checks) {
        if (settleChecks(conditional.checks, model, valueSets ? valueSets[i] : null)) outcomes |= 1 << i
        continue
      }
      // evaluateConditional reduces the array it is handed to booleans as it goes, so a settled condition gets a copy: these have to survive to the next render
      const args = conditional.dynamic ? oneLineArgs(conditional.argSources, model) : conditional.args.slice()
      if (evaluateConditional(args, model)) outcomes |= 1 << i
    }
    return outcomes
  }

  // the element's opening tag for one combination of outcomes, worked out the first time a render calls for it and then kept
  function attrsVariant (node, outcomes) {
    let variant = node.variants[outcomes]
    if (variant === undefined) {
      // the opening tag may still hold a {variable} from one of the element's other attributes, so it is split into text and variable slots the same way the rest of the markup is
      variant = []
      pushText(variant, openTagFor(node.openTag, node.closeTag, node.tagName, node.conditionals, outcomes))
      node.variants[outcomes] = variant
    }
    return variant
  }

  // every opening tag a one line if can produce, worked out while the template is compiled so that emitted code can write the tag itself instead of handing the job to the tree walker, which would need a model built for it
  //
  // an element carrying many conditions has too many combinations to write them all out, so those keep the lazy path, which builds only the combination a render actually arrives at
  function attrsVariants (node) {
    const total = 1 << node.conditionals.length
    if (total > MAX_EMITTED_VARIANTS) return null
    const all = []
    for (let outcomes = 0; outcomes < total; outcomes++) all.push(attrsVariant(node, outcomes))
    return all
  }

  // the model an included template sees: the one the include was reached with, plus its arguments
  function bindArgs (model, bindings, values) {
    const localModel = Object.assign({}, model)
    for (let i = 0; i < bindings.length; i++) getOrSetObjectByDotNotation(localModel, bindings[i].name, values[i])
    return localModel
  }

  // content exempt from parsing is held out of the markup rather than written into it, because the stray tag sweep at the end of a render reparses the finished page and would strip a teddy tag out of it. the same restoration at the end of the render puts it back
  function rawBlock (node, model) {
    return `<noteddy id="${model._noTeddyBlocks.push(node.value) - 1}"></noteddy>`
  }

  function inlineBlock (node, model) {
    const css = node.css && getOrSetObjectByDotNotation(model, node.css)
    const js = node.js && getOrSetObjectByDotNotation(model, node.js)
    if (css) return `<style>${css}</style>`
    if (js) return `<script>${js}</script>`
    // teddy drops an inline that names neither
    if (params.verbosity > 1) console.warn('teddy encountered an <inline> element without a css or js attribute.')
    return ''
  }

  // a variable whose name was built from other variables: the name is rendered first, then looked up, so {a{b}} with b of X asks the model for aX
  function computedVariable (name, model, state) {
    const flags = VALID_VARIABLE.test(name) ? variableFlags(name) : null
    const resolved = flags ? formatVariable(flags, getOrSetObjectByDotNotation(model, flags.name), model) : null
    if (!resolved) return `{${name}}`
    return writeValue(resolved, name.slice(-6).includes('|s'), model, state)
  }

  // whether this candidate for a selected-value or checked-value is the one that carries the matching value
  function selectionMarked (node, model) {
    // teddy falls back to the attribute as written when the variable in it resolves to nothing
    const target = parseVars(node.valueSource, model) || node.valueSource
    // a candidate written inside a loop has had its own value substituted by the time it is compared, so it is compared substituted here too
    const own = node.ownValue && node.ownValue.includes('{') ? parseVars(node.ownValue, model) : node.ownValue
    return own === target
  }

  // whether one arm of a conditional chain is the one that applies
  //
  // values, when given, holds what each of the arm's conditions looks up, already looked up, which is what a compiled template hands in rather than having the lookups done again
  function armMatches (arm, model, isFirst, values) {
    if (arm.kind === 'else') return true
    const inverted = arm.kind === 'unless' || arm.kind === 'elseunless'
    // an arm of a shape settled at compile time is answered without building or reducing anything
    if (arm.checks) {
      const result = settleChecks(arm.checks, model, values)
      return inverted ? !result : result
    }
    // only the opening if or unless resolves a {variable} in a condition's value; elseif and elseunless read the value as written. that is inconsistent, and it is preserved here because changing it would change what existing templates render
    const result = evaluateConditional(conditionArgs(arm.attribs, model, isFirst), model, values)
    return inverted ? !result : result
  }

  function pickArm (branch, model) {
    for (let i = 0; i < branch.arms.length; i++) {
      if (armMatches(branch.arms[i], model, i === 0, undefined)) return i
    }
    return -1
  }

  // the names a compile time settled set of conditions looks up, in the slots settleChecks reads them from
  function conditionCheckPaths (checks) {
    if (!checks) return null
    if (checks.length === 1) return [checks[0].path]
    return [checks[0].path, null, checks[2].path]
  }

  // the names an arm's conditions look up, in the order evaluateConditional will want them, or null where the entry is a boolean operator rather than a condition
  function armPaths (arm) {
    return arm.attribs.map(([name, value]) => conditionPath(value ? `${name}=${value}` : name))
  }

  // a one line if's conditions in the form evaluateConditional wants them. a joiner is stored with no value and goes in on its own; a condition whose value is a variable is resolved against the model, which is only ever needed when the compile could not settle it
  function oneLineArgs (argSources, model) {
    const args = []
    for (const [name, value] of argSources) {
      if (value === null) args.push(name)
      else if (!value) args.push(name)
      else args.push(`${name}=${model && value.includes('{') ? parseVars(value, model) : value}`)
    }
    return args
  }

  function conditionArgs (attribs, model, resolveValues) {
    const args = []
    for (const [name, raw] of attribs) {
      let value = raw
      if (value) {
        if (resolveValues && value.includes('{')) value = parseVars(value, model)
        args.push(`${name}=${value}`)
      } else args.push(name)
    }
    return args
  }

  // what a loop walks: its collection's keys when the loop names its key, and the values themselves when it does not
  //
  // an array is walked by index rather than by key, which is both what the values already are and a far cheaper way to read an element than by a key spelled as a string
  function loopWalk (collection, needsKey) {
    if (needsKey) return Object.keys(collection)
    return Array.isArray(collection) ? collection : Object.values(collection)
  }

  // whether what a loop was pointed at can be iterated, given a value already looked up. teddy drops a loop it cannot run rather than leaving its body behind
  function iterable (collection, keyName, valName) {
    if (!collection) {
      if (params.verbosity > 1) console.warn('teddy encountered a loop without a through attribute.')
      return null
    }
    if (!keyName && !valName) {
      if (params.verbosity > 1) console.warn('teddy encountered a loop without a key or a val attribute.')
      return null
    }
    if (collection instanceof Set) return [...collection]
    return collection
  }

  // what a loop iterates when the name it was pointed at is only known once there is a model to read it from
  //
  // a {variable} may sit anywhere in the path rather than at its head, so any brace means the path has to be resolved before it is looked up
  function loopCollection (through, keyName, valName, model) {
    let source = through
    if (source && source.includes('{')) source = parseVars(source, model)
    return iterable(source ? getOrSetObjectByDotNotation(model, source) : undefined, keyName, valName)
  }

  // the model as a loop's body sees it: the model it was reached with, plus this iteration's key and val. emitted code needs this for the helpers it calls, which take a model rather than the javascript variables the emitted code keeps its locals in
  function loopScope (model, keyName, key, valName, value) {
    const localModel = Object.assign({}, model)
    getOrSetObjectByDotNotation(localModel, keyName, key)
    getOrSetObjectByDotNotation(localModel, valName, value)
    return localModel
  }

  // a <cache> writes the markup its body rendered to last time rather than rendering it again. renderBody is only called on a miss
  function cacheBlock (node, model, renderBody) {
    const name = node.name && node.name.includes('{') ? parseVars(node.name, model) : node.name
    const keySource = node.key && node.key.includes('{') ? parseVars(node.key, model) : node.key
    // a name or key that still holds a variable never resolved, and teddy leaves such an element alone until the stray tag sweep takes it away, contents and all
    if (!name || name.includes('{') || (keySource && keySource.includes('{'))) return ''
    const keyVal = keySource ? getOrSetObjectByDotNotation(model, keySource) : 'none'
    const existing = caches[name]
    const entry = existing && existing.entries && existing.entries[keyVal]
    if (entry) {
      const now = Date.now()
      // an entry with no max age set never goes stale
      if (!existing.maxAge || entry.lastAccessed + existing.maxAge > now) {
        entry.lastAccessed = now
        return entry.markup
      }
      delete existing.entries[keyVal]
    }
    const markup = renderBody()
    if (!caches[name]) caches[name] = { key: keySource || 'none', maxAge: node.maxAge, maxCaches: node.maxCaches, entries: {} }
    const stamp = Date.now()
    caches[name].entries[keyVal] = { lastAccessed: stamp, created: stamp, markup }
    // drop the least recently used entry once there are more than the element asked to keep
    const entries = caches[name].entries
    if (Object.keys(entries).length > node.maxCaches) {
      delete entries[Object.keys(entries).reduce((a, b) => entries[a].lastAccessed < entries[b].lastAccessed ? a : b)]
    }
    return markup
  }

  // the compiled body of an <include> whose src is only known once there is a model to read it from, compiled the first time a render asks for that name and kept against it
  function dynamicBody (node, model) {
    const src = parseVars(node.src, model)
    let body = node.compiled.get(src)
    if (body !== undefined) return body
    if (node.stack.includes(src)) {
      throw new Error(`teddy: the template "${src}" includes itself, directly or through the templates it includes, so it can never finish compiling. include stack: ${node.stack.concat(src).map(name => JSON.stringify(name)).join(' -> ')}`)
    }
    const markup = loadTemplate(src)
    body = markup === null
      ? [{ type: 'text', value: params.includeNotFoundBehavior === 'display' ? `Template "${src}" not found!` : '' }]
      : compileTemplate(markup, node.stack.concat(src))
    node.compiled.set(src, body)
    return body
  }

  function renderLoop (node, model, state) {
    const collection = loopCollection(node.through, node.keyName, node.valName, model)
    if (!collection) return ''

    let out = ''
    const needsKey = !!node.keyName
    const walk = loopWalk(collection, needsKey)
    for (let i = 0; i < walk.length; i++) {
      const key = needsKey ? walk[i] : null
      out += renderNodes(node.body, loopScope(model, node.keyName, key, node.valName, needsKey ? collection[key] : walk[i]), state)
    }
    return out
  }

  // #endregion

  // isSelfContained is returned so the test suite can attack it directly: it decides whether a value that arrived through the model can be compiled, and a wrong answer there is the one mistake in this module that would produce quietly incorrect output rather than a visible failure
  //
  // helpers are what emitted javascript calls into. every one of them is a function the tree walker calls too, so neither way of rendering a template can reach its own conclusion about what the template means
  return {
    compileTemplate,
    renderNodes,
    isSelfContained,
    helpers: {
      get: getOrSetObjectByDotNotation,
      format: formatVariable,
      write: writeValue,
      pick: pickArm,
      quick: quickValue,
      slow: slowValue,
      plain: writePlainValue,
      needs: NEEDS_MODEL,
      arm: armMatches,
      present: valuePresent,
      paths: armPaths,
      checkPaths: conditionCheckPaths,
      outcomes: attrsOutcomes,
      variant: attrsVariant,
      variants: attrsVariants,
      bind: bindArgs,
      render: renderNodes,
      raw: rawBlock,
      inline: inlineBlock,
      computed: computedVariable,
      marked: selectionMarked,
      cache: cacheBlock,
      dynamic: dynamicBody,
      iterable,
      walk: loopWalk,
      collection: loopCollection,
      scope: loopScope
    }
  }
}
