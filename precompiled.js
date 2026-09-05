// the data a precompiled template carries beside its emitted javascript, written out and read back
//
// emitting javascript is what makes a render fast, and it needs to build a function from a string to do it, which a page under a strict content security policy may not do. a template compiled ahead of time does not have to: the function is written to a file as source, and the browser loads it as a script like any other. what has to travel with it is the data the emitted code indexes into, which is what this module writes and reads
//
// the shapes involved are not plain json. the same node list is reached from more than one place, an arm holds its branch and the branch holds the arm back, and a dynamic include keeps a map. so every object is written once into a table and referred to by its place in it, which handles sharing and circularity alike

export const FORMAT = 1 // precompile version: a template compiled by one version of teddy and loaded by another whose format differs is refused rather than rendered into something wrong

const REF = '$r'
const MAP = '$m'
const UNDEFINED = '$u'

// the node types the compiler produces. a decoded object is rebuilt as a node when its type is one of these, so that it comes out with the same shape every other node has
const NODE_TYPES = new Set(['text', 'var', 'arm', 'loop', 'attrs', 'scope', 'raw', 'inline', 'computedVar', 'selection', 'cache', 'dynamicInclude'])

// true for an object that came out of the compiler's node factory. checking the type alone is not enough: a binding also has a name, and a conditional also has a type of sorts
function isNode (value) {
  return typeof value.type === 'string' && NODE_TYPES.has(value.type) && Object.prototype.hasOwnProperty.call(value, 'bodySource')
}

export function encode (value) {
  const table = []
  const places = new Map()

  function write (value) {
    if (value === undefined) return { [UNDEFINED]: 1 }
    if (value === null || typeof value !== 'object') {
      if (typeof value === 'function') throw new Error('teddy: a template holding a function in its compiled form cannot be precompiled')
      return value
    }

    const seen = places.get(value)
    if (seen !== undefined) return { [REF]: seen }
    // the place is claimed before the contents are written, so that something reaching back to this object finds a reference rather than going round again
    const place = table.length
    places.set(value, place)
    table.push(null)

    if (value instanceof Map) {
      table[place] = { [MAP]: [...value].map(([k, v]) => [write(k), write(v)]) }
      return { [REF]: place }
    }
    if (Array.isArray(value)) {
      table[place] = value.map(write)
      return { [REF]: place }
    }
    const written = {}
    for (const key of Object.keys(value)) written[key] = write(value[key])
    if (isNode(value)) written.$n = value.type
    table[place] = written
    return { [REF]: place }
  }

  const root = write(value)
  return { root, table }
}

// makeNode is the compiler's own node factory, passed in so that this module does not have to know what fields a node has
export function decode (encoded, makeNode) {
  const { root, table } = encoded
  const built = new Array(table.length).fill(undefined)
  const done = new Array(table.length).fill(false)

  function read (value) {
    if (value === null || typeof value !== 'object') return value
    if (value[UNDEFINED] !== undefined) return undefined
    // anything else write produced is a reference into the table
    return at(value[REF])
  }

  function at (place) {
    if (done[place]) return built[place]
    const raw = table[place]

    // the container is made and recorded before what is in it is read, so that something inside it referring back finds the same object rather than a second copy of it
    if (Array.isArray(raw)) {
      const out = []
      built[place] = out
      done[place] = true
      for (const item of raw) out.push(read(item))
      return out
    }
    if (raw[MAP] !== undefined) {
      const out = new Map()
      built[place] = out
      done[place] = true
      for (const [k, v] of raw[MAP]) out.set(read(k), read(v))
      return out
    }
    const out = raw.$n === undefined ? {} : makeNode(raw.$n)
    built[place] = out
    done[place] = true
    for (const key of Object.keys(raw)) {
      if (key === '$n') continue
      out[key] = read(raw[key])
    }
    return out
  }

  return read(root)
}
