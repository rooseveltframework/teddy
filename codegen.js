// teddy's code emitter
//
// the compiler turns a template into a tree of nodes, and a render walks that tree. this module takes the same tree and writes javascript that does the walking's job with no tree left to walk: literal markup becomes string concatenation, a loop's key and val become real javascript variables, and a dotted path becomes a property read
//
// what it does not do is reimplement what a {variable} or an <if> means. the emitted code calls the same helpers the tree walker calls, so the two ways of rendering a template cannot come to different conclusions about the language itself. the emitter only removes the dispatch and the bookkeeping around those calls, which is where the time goes
//
// this is used in node.js only. emitting javascript means building a function at runtime, which a page served under a strict content security policy is not allowed to do, so browser builds swap this module for a stub and walk the tree instead, which is slower, but more secure in browser contexts

// every node kind the compiler can produce
const EMITTABLE = new Set(['text', 'var', 'arm', 'loop', 'attrs', 'scope', 'raw', 'inline', 'computedVar', 'selection', 'cache', 'dynamicInclude'])

export function canEmit (nodes) {
  if (nodes === null) return false
  for (const node of nodes) {
    if (!EMITTABLE.has(node.type)) return false
    if (node.body && !canEmit(node.body)) return false
    if (node.type === 'arm' && !canEmit(node.branch.arms[node.index].body)) return false
    if (node.nameNodes && !canEmit(node.nameNodes)) return false
    if (node.variants) {
      // a one line if fills its variants in as renders call for them, so there may be none yet; a selection has both of its from the start
      for (const variant of node.variants) if (variant && !canEmit(variant)) return false
    }
    if (node.bindings) {
      for (const binding of node.bindings) if (!canEmit(binding.body)) return false
    }
  }
  return true
}

// builds a render function from a node tree
//
// helpers are the tree walker's own: get for a model lookup, format and write for what a variable resolves to and what it writes, pick for which arm of a conditional wins, and collection for what a loop iterates. they arrive in one object the emitted code reads from, so the generated source closes over nothing of its own supplied by the compiler, which knows which names an arm's conditions look up
let armPaths = () => []
let checkPaths = () => null
let attrsVariants = () => null

export function emit (nodes, helpers) {
  armPaths = helpers.paths
  checkPaths = helpers.checkPaths
  attrsVariants = helpers.variants
  const state = { locals: new Map(), model: 'm', base: 'm', uid: 0, flags: [], branches: [], branchIds: new Map(), nodes: [] }
  const body = mergeWrites(`let o = ''\n${walk(nodes, state, 'o')}return o`)
  // eslint-disable-next-line no-new-func
  const compiled = new Function('m', 'r', 's', body)
  const runtime = { ...helpers, flags: state.flags, branches: state.branches, nodes: state.nodes }
  return {
    source: body,
    render: (model, renderState) => compiled(model, runtime, renderState)
  }
}

// one write of literal text, which is the only shape of line this merges. the strings are written by JSON.stringify, so a newline in the text is escaped rather than ending the line
const LITERAL_WRITE = /^([A-Za-z_$][\w$]*) \+= ("(?:[^"\\]|\\.)*")$/

// merges runs of literal writes into one write each
//
// markup arrives in pieces: a chain folded into real control flow writes the text around a body separately from the body's own text, a closing tag is its own write, and a construct between two runs of markup splits what would otherwise be one. all of those strings are known while the template is compiled, so joining them is work a render should not be repeating
function mergeWrites (source) {
  const lines = []
  let target = null
  let pending = ''

  const flush = () => {
    if (target !== null) lines.push(`${target} += ${JSON.stringify(pending)}`)
    target = null
    pending = ''
  }

  for (const line of source.split('\n')) {
    const write = LITERAL_WRITE.exec(line)
    if (write) {
      // a run only continues while the writes are going to the same place
      if (write[1] !== target) flush()
      target = write[1]
      pending += JSON.parse(write[2])
      continue
    }
    flush()
    lines.push(line)
  }
  flush()

  return lines.join('\n')
}

function walk (nodes, state, out) {
  let js = ''

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]
    switch (node.type) {
      case 'text':
        js += `${out} += ${JSON.stringify(node.value)}\n`
        break
      case 'var':
        js += emitVar(node, state, out)
        break
      case 'arm': {
        // a whole chain compiles to one if/else chain wherever it can, which is most of the time
        const chain = node.index === 0 ? emitChain(nodes, index, state, out) : null
        if (chain) {
          js += chain.js
          index += chain.consumed - 1
        } else js += emitArm(node, state, out)
        break
      }
      case 'loop':
        js += emitLoop(node, state, out)
        break
      case 'attrs':
        js += emitAttrs(node, state, out)
        break
      case 'scope':
        js += emitScope(node, state, out)
        break
      case 'raw':
        js += `${out} += r.raw(${nodeRef(node, state)}, ${state.model})\n`
        break
      case 'inline':
        js += `${out} += r.inline(${nodeRef(node, state)}, ${state.model})\n`
        break
      case 'computedVar':
        js += emitComputedVar(node, state, out)
        break
      case 'selection':
        js += emitSelection(node, state, out)
        break
      case 'cache':
        js += emitCache(node, state, out)
        break
      case 'dynamicInclude':
        js += emitDynamicInclude(node, state, out)
        break
    }
  }

  return js
}

// the node itself, for a helper that needs more of it than a few values
function nodeRef (node, state) {
  return `r.nodes[${state.nodes.push(node) - 1}]`
}

// a dotted path becomes a property read. case insensitive only as the fallback for when the exact spelling is not there, which is the rare case
//
// a loop's key and val are javascript variables, so a path rooted at one of those reads it directly. anything else reads the model the loop was reached with rather than the model its body sees, because the only difference between those two is the key and the val, and a path naming either of those has already been answered by the javascript variables above
//
// the model read from is not always the model the template was called with: an <include> that takes arguments binds them into a model of its own
//
// the javascript variable is named by the emitter rather than by the template, because a name teddy is happy with is not always one javascript will take: a loop may be given a val of "5", or "my-item", or "class". names are matched without regard to case
function access (path, state) {
  const keys = String(path).split('.')
  const local = state.locals.get(keys[0].toLowerCase())
  const root = local || state.base
  const rest = local ? keys.slice(1) : keys
  if (!rest.length) return { setup: '', expr: root }
  // the property chain is read into a variable rather than written into the expression twice, which is what asking whether it came back undefined used to cost
  const found = `p${state.uid++}`
  const chain = root + rest.map(key => `?.[${JSON.stringify(key)}]`).join('')
  const setup = `let ${found} = ${chain}\nif (${found} === undefined) ${found} = r.get(${root}, ${JSON.stringify(rest.join('.'))})\n`
  return { setup, expr: found }
}

function emitVar (node, state, out) {
  // the flags were settled when the template was compiled, so the emitted code carries an index into a table of them rather than working them out again
  const flags = state.flags.push(node.flags) - 1
  const value = access(node.flags.name, state)
  let js = value.setup

  // a variable carrying no flags at all, holding a plain string with nothing special in it, is most of what a page writes, and that case is answered in one call: no flags to consult, no object to carry the answer, and no second question about whether the answer is finished
  //
  // everything else is one call too. it sits in the false half of a conditional, so the model it is handed is only reached for when that half is taken, which is what lets a loop body avoid building one at all
  const plain = !node.flags.noparse && !node.flags.raw && !node.flags.hide && !node.flags.display
  const slow = `r.slow(r.flags[${flags}], ${value.expr}, ${node.raw}, ${JSON.stringify(node.source)}, ${state.model}, s, ${!!node.dollar})`
  if (plain) {
    const quick = `q${state.uid++}`
    js += `const ${quick} = r.quick(${value.expr})\n`
    js += `${out} += ${quick} !== undefined ? ${quick} : ${slow}\n`
  } else {
    js += `${out} += ${slow}\n`
  }
  return js
}

// every arm of a chain gets its own block, and which one wins is worked out once, when the first arm is reached. the arms cannot be an if/else chain: teddy writes the winning arm's content where that arm sat, and the markup between the arms belongs to the page either way
function branchId (branch, state) {
  let id = state.branchIds.get(branch)
  if (id === undefined) {
    id = state.branches.push(branch) - 1
    state.branchIds.set(branch, id)
  }
  return id
}

function emitArm (node, state, out) {
  const id = branchId(node.branch, state)
  const winner = `w${id}`
  let js = ''
  if (node.index === 0) js += emitPick(node.branch, id, winner, state)
  js += `if (${winner} === ${node.index}) {\n`
  js += walk(node.branch.arms[node.index].body, state, out)
  js += '}\n'
  return js
}

// a whole conditional chain as one if/else chain
//
// the arms of a chain are siblings in the document rather than nested blocks, so whatever sits between them belongs to the page and is written whichever arm wins. that is why a chain cannot simply become an if/else in the order it was written: the content between the arms would have nowhere to go
//
// it can become one anyway, by folding that content into every branch. each arm writes the content that precedes it, then its own body, then the content that follows it, and the arrangement is different in each branch but settled at compile time. one test per arm, short circuited, and the literals around a body merge into single writes rather than one write per run of text
//
// returns null when anything other than text sits between the arms, because then that content has to be written where it stands and the chain keeps the winner and position form below
function emitChain (nodes, start, state, out) {
  const branch = nodes[start].branch
  const total = branch.arms.length
  const between = [] // the content between one arm and the next, one entry per gap
  let cursor = start + 1
  let text = ''
  let found = 1

  while (found < total && cursor < nodes.length) {
    const node = nodes[cursor]
    if (node.type === 'text') {
      text += node.value
      cursor++
    } else if (node.type === 'arm' && node.branch === branch && node.index === found) {
      between.push(text)
      text = ''
      found++
      cursor++
    } else return null // something that is not text is in the way
  }
  if (found < total) return null // the rest of the chain is not in this list

  const id = branchId(branch, state)
  const write = value => (value ? `${out} += ${JSON.stringify(value)}\n` : '')
  let js = ''
  let depth = 0
  let settled = false

  for (let i = 0; i < total; i++) {
    const body = write(between.slice(0, i).join('')) + walk(branch.arms[i].body, state, out) + write(between.slice(i).join(''))
    // an <else> is the arm that applies when nothing before it did, so it needs no test of its own and nothing after it can win
    if (branch.arms[i].kind === 'else') {
      js += body
      settled = true
      break
    }
    const { setup, test } = armTest(branch, id, i, state)
    js += setup
    js += `if (${test}) {\n${body}} else {\n`
    depth++
  }
  // no arm applied, so only what sits between them is written
  if (!settled) js += write(between.join(''))
  js += '}\n'.repeat(depth)

  return { js, consumed: cursor - start }
}

// which arm of a chain applies, worked out arm by arm so a later arm's conditions are not looked up once an earlier one has matched
//
// each condition's value is read here, inline, rather than inside the shared reduction. that is what stops a dotted name being split apart again on every render. the reduction itself is still teddy's own, handed the values it would otherwise have looked up for itself what one arm of a chain needs read before it can be tested, and the test itself
//
// an arm's conditions are looked up here, inline, rather than inside the shared reduction, which is what stops a dotted name being split apart again on every render
function armTest (branch, id, index, state) {
  const arm = branch.arms[index]
  let setup = ''
  const values = []
  for (const path of armPaths(arm)) {
    if (path === null) {
      values.push('undefined')
      continue
    }
    const value = access(path, state)
    setup += value.setup
    values.push(value.expr)
  }

  // an arm asking whether one thing is simply there is most of what conditionals are, and the answer to that is the one helper that says what being there means, reached directly rather than through everything that decides how else an arm might have to be answered
  const checks = arm.checks
  const bare = checks && checks.length === 1 && !checks[0].not && checks[0].compare === null
  if (bare) {
    const inverted = arm.kind === 'unless' || arm.kind === 'elseunless'
    return { setup, test: `${inverted ? '!' : ''}r.present(${values[0]})` }
  }

  // the values above are every lookup the arm makes, so the one thing left that a model could be wanted for is a {variable} standing in for a condition's value, which only the opening arm of a chain resolves. the variable may sit anywhere in the value, so what counts as one has to be decided the same way conditionArgs decides it, or the model it needs will not have been passed
  const wantsModel = index === 0 && arm.attribs.some(([, value]) => value && value.includes('{'))
  return { setup, test: `r.arm(r.branches[${id}].arms[${index}], ${wantsModel ? state.model : 'null'}, ${index === 0}, [${values.join(', ')}])` }
}

function emitPick (branch, id, winner, state) {
  let js = `let ${winner} = -1\n`
  let depth = 0
  for (let i = 0; i < branch.arms.length; i++) {
    const { setup, test } = armTest(branch, id, i, state)
    js += setup
    js += `if (${test}) ${winner} = ${i}\n`
    js += 'else {\n'
    depth++
  }
  js += '}\n'.repeat(depth)
  return js
}

// a variable whose name is built from other variables: the name is a little template of its own, so it is rendered into its own accumulator and then looked up
function emitComputedVar (node, state, out) {
  const name = `n${state.uid++}`
  let js = `let ${name} = ''\n`
  js += walk(node.nameNodes, state, name)
  js += `${out} += r.computed(${name}, ${state.model}, s)\n`
  return js
}

// a candidate for a selected-value or checked-value: its opening tag was prepared both marked and unmarked, so the render only picks
function emitSelection (node, state, out) {
  const ref = nodeRef(node, state)
  const marked = `d${state.uid++}`
  let js = `const ${marked} = r.marked(${ref}, ${state.model}) ? 1 : 0\n`
  js += `${out} += r.render(${ref}.variants[${marked}], ${state.model}, s)\n`
  js += walk(node.body, state, out)
  js += `${out} += ${JSON.stringify(node.closeTag)}\n`
  return js
}

// a <cache> writes what its body rendered to last time, so the body is emitted behind a function the helper only calls on a miss
function emitCache (node, state, out) {
  const acc = `q${state.uid++}`
  let js = `${out} += r.cache(${nodeRef(node, state)}, ${state.model}, () => {\n`
  js += `let ${acc} = ''\n`
  js += walk(node.body, state, acc)
  js += `return ${acc}\n`
  js += '})\n'
  return js
}

// an <include> whose src is only known at render: the body it resolves to is compiled the first time a render asks for that name, and is walked rather than emitted since it is not known when this code is written
function emitDynamicInclude (node, state, out) {
  const ref = nodeRef(node, state)
  let js = ''
  let model = state.model
  if (node.bindings.length) {
    const values = []
    for (const binding of node.bindings) {
      const acc = `g${state.uid++}`
      values.push(acc)
      js += `let ${acc} = ''\n`
      js += walk(binding.body, state, acc)
    }
    const scope = `l${state.uid++}`
    js += `const ${scope} = r.bind(${state.model}, ${ref}.bindings, [${values.join(', ')}])\n`
    model = scope
  }
  js += `${out} += r.render(r.dynamic(${ref}, ${state.model}), ${model}, s)\n`
  return js
}

// a one line if: which combination of outcomes applies is worked out by the same helper the tree walker uses, and the opening tag for it is looked up the same way
function emitAttrs (node, state, out) {
  const ref = nodeRef(node, state)
  const outcomes = `a${state.uid++}`
  let js = ''
  const sets = []
  for (const conditional of node.conditionals) {
    const paths = checkPaths(conditional.checks)
    if (!paths) {
      sets.push('null')
      continue
    }
    const slots = []
    for (const path of paths) {
      if (path === null) {
        slots.push('undefined')
        continue
      }
      const value = access(path, state)
      js += value.setup
      slots.push(value.expr)
    }
    sets.push(`[${slots.join(', ')}]`)
  }
  js += `const ${outcomes} = r.outcomes(${ref}, ${node.outcomesNeedModel ? state.model : 'null'}, [${sets.join(', ')}])\n`

  // the opening tag is written here, one branch per combination of outcomes, rather than by handing the tree walker the combination this render arrived at. a tag holding a {variable} is what makes the difference: written here it reads a loop's val out of a javascript variable, and handed over it would need a whole model built for it to look the same value up in
  const variants = attrsVariants(node)
  if (variants) {
    for (let i = 0; i < variants.length; i++) {
      js += `${i ? 'else ' : ''}if (${outcomes} === ${i}) {\n`
      js += walk(variants[i], state, out)
      js += '}\n'
    }
  } else {
    js += `${out} += r.render(r.variant(${ref}, ${outcomes}), ${node.variantNeedsModel ? state.model : 'null'}, s)\n`
  }
  js += walk(node.body, state, out)
  js += `${out} += ${JSON.stringify(node.closeTag)}\n`
  return js
}

// an include's arguments are templates of their own, so each is rendered into its own accumulator and the results become the model the included template sees
function emitScope (node, state, out) {
  if (!node.bindings.length) return walk(node.body, state, out)

  let js = ''
  const values = []
  for (const binding of node.bindings) {
    const acc = `g${state.uid++}`
    values.push(acc)
    js += `let ${acc} = ''\n`
    js += walk(binding.body, state, acc)
  }

  const scope = `l${state.uid++}`
  js += `const ${scope} = r.bind(${state.model}, ${nodeRef(node, state)}.bindings, [${values.join(', ')}])\n`
  const outerModel = state.model
  const outerBase = state.base
  state.model = scope
  state.base = scope
  js += walk(node.body, state, out)
  state.model = outerModel
  state.base = outerBase
  return js
}

// the loop's key and val become real javascript variables rather than keys copied into a fresh model object for every item, which is what lets the body read them with a plain property access
//
// working out what to iterate happens once per loop rather than once per item, so that is left to the helper, which also reports a loop teddy cannot run
function emitLoop (node, state, out) {
  const collection = `c${state.uid++}`
  const key = `k${state.uid++}`
  const val = `u${state.uid++}`

  const keyName = JSON.stringify(node.keyName ?? null)
  const valName = JSON.stringify(node.valName ?? null)

  // a through naming a {variable} anywhere in its path is not known until there is a model to read it from, so that one goes through the helper; anything else is a path this code can read directly, which matters for a loop nested inside another whose collection is the outer loop's val
  let js = ''
  if (node.through && node.through.includes('{')) {
    js += `const ${collection} = r.collection(${JSON.stringify(node.through)}, ${keyName}, ${valName}, ${state.model})\n`
  } else {
    const source = access(node.through, state)
    js += source.setup
    js += `const ${collection} = r.iterable(${source.expr}, ${keyName}, ${valName})\n`
  }

  // the walk is worked out once for the whole loop, and whether the key is wanted was settled when the template was compiled, so no iteration asks that question again
  const items = `d${state.uid++}`
  const index = `i${state.uid++}`
  js += `const ${items} = ${collection} ? r.walk(${collection}, ${!!node.keyName}) : null\n`
  js += `if (${items}) for (let ${index} = 0; ${index} < ${items}.length; ${index}++) {\n`
  if (node.keyName) {
    js += `const ${key} = ${items}[${index}]\n`
    js += `const ${val} = ${collection}[${key}]\n`
  } else {
    js += `const ${key} = null\n`
    js += `const ${val} = ${items}[${index}]\n`
  }

  const outerLocals = state.locals
  const outerModel = state.model
  const scope = `l${state.uid++}`
  // the body reads the key and the val out of the javascript variables above, and reads everything else out of the model the loop was reached with, so the model a loop's body sees exists only for the helpers that take one. those are the minority, so it is built on first use and not before: a body of plain markup, variables and conditionals never builds one at all, which is one object copy per item of every loop on the page saved
  js += `let ${scope}\n`
  state.locals = new Map(outerLocals)
  if (node.keyName) state.locals.set(node.keyName.toLowerCase(), key)
  if (node.valName) state.locals.set(node.valName.toLowerCase(), val)
  state.model = `(${scope} || (${scope} = r.scope(${outerModel}, ${keyName}, ${key}, ${valName}, ${val})))`
  js += walk(node.body, state, out)
  state.locals = outerLocals
  state.model = outerModel

  js += '}\n'
  return js
}
