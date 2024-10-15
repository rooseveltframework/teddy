// extend HTMLElement prototype to include cheerio properties
Object.defineProperty(window.HTMLElement.prototype, 'attribs', {
  get: function () {
    if (this.__attribs === undefined) this.__attribs = this.attributes
    return this.__attribs
  }
})

Object.defineProperty(window.HTMLElement.prototype, 'name', {
  get: function () {
    if (this.__name === undefined) this.__name = this.nodeName.toLowerCase()
    return this.__name
  }
})

Object.defineProperty(window.HTMLElement.prototype, 'parent', {
  get: function () {
    if (this.__parent === undefined) this.__parent = this.parentNode
    return this.__parent
  }
})

// TODO: write more HTMLElement property extensions to polyfill cheerio: this will require reading teddy.js line by line to see what properties from cheerio each method uses and adapt them like above one property at a time

// create a native DOMParser
const parser = new window.DOMParser()

// stub out cheerio using native dom methods for frontend so we don't have to bundle cheerio on the frontend
export function load (html) {
  console.log('Loading cheerio polyfill... TODO: This is unfinished! Please use teddy.mjs or teddy.cjs via a bundle for now.')
  const doc = parser.parseFromString(html, 'text/html')

  // return a querySelector function with function chains
  // e.g. dom('include') or dom(el) from teddy
  const $ = function (query) { // query can be a string, or a dom object
    // if query is a string, we need to create a dom object from the string: an object with elements in it, e.g. a list of include tag objects
    if (typeof query === 'string') {
      const els = doc.querySelectorAll(query)
      console.log(els)
      return els // return the object collection
    }

    // if query is an object, it's assumed we're trying to perform operations on a single dom node
    const el = query
    return {
      // e.g. dom(el).children() from teddy
      children: function () {
        return el.children
      },

      // e.g. dom(arg).html() from teddy
      html: function () {
        return el.innerHTML
      },

      // e.g. dom(el).attr('teddy_deferred_dynamic_include', 'true') from teddy
      attr: function (attr, val) {
        return el.setAttribute(attr, val)
      },

      // dom(el).removeAttr(attr) from teddy
      removeAttr: function (attr) {
        return el.removeAttribute(attr)
      },

      // e.g. dom(el).replaceWith(localDom.html()) from teddy
      replaceWith: function (html) {
        const temp = document.createElement('div')
        temp.innerHTML = html
        el.replaceWith(...temp.children)
      },

      // e.g. dom(el).remove() from teddy
      remove: function () {
        return el.remove()
      }
    }
  }
  // e.g. dom.html() from teddy
  $.html = function () {
    return doc.body.innerHTML
  }

  return $
}
