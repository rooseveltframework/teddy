// extend HTMLElement prototype to include cheerio properties
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
// TODO: nextSibling, children?

// create a native DOMParser
const parser = new window.DOMParser()

// stub out cheerio using native dom methods for frontend so we don't have to bundle cheerio on the frontend
export function load (html) {
  console.log('Loading cheerio polyfill... TODO: This is unfinished! Please use teddy.mjs or teddy.cjs via a bundle for now.')
  const doc = parser.parseFromString(html, 'text/html')
  console.log('doc:', doc.body.innerHTML)

  // return a querySelector function with function chains
  // e.g. dom('include') or dom(el) from teddy
  const $ = function (query) { // query can be a string, or a dom object
    // if query is a string, we need to create a dom object from the string: an object with elements in it, e.g. a list of include tag objects
    if (typeof query === 'string') {
      const els = doc.querySelectorAll(query)
      console.log('cheerio polyfill: dom(query)', els)
      return els // return the object collection
    }

    // if query is an object, it's assumed we're trying to perform operations on a single dom node
    const el = query
    return {

      // e.g. dom(el).children() from teddy
      children: function () {
        console.log('cheerio polyfill: children()', el.children)
        return el.children
      },

      // e.g. dom(arg).html() from teddy
      html: function () {
        console.log('cheerio polyfill: html()', el.innerHTML)
        return el.innerHTML
      },

      // e.g. dom(el).attr('teddy_deferred_dynamic_include', 'true') from teddy
      attr: function (attr, val) {
        console.log('cheerio polyfill: attr()', attr, val)
        return el.setAttribute(attr, val)
      },

      // dom(el).removeAttr(attr) from teddy
      removeAttr: function (attr) {
        console.log('cheerio polyfill: removeAttr()', attr)
        return el.removeAttribute(attr)
      },

      // e.g. dom(el).replaceWith(localDom.html()) from teddy
      replaceWith: function (html) {
        // can either be a string or an array of elements
        console.log('replaceWith doc:', doc.body.innerHTML)
        if (typeof html === 'object') {
          let newHtml = ''
          for (const el of html) newHtml += el.outerHTML
          html = newHtml
        }
        const temp = document.createElement('div')
        temp.innerHTML = html
        el.replaceWith(...temp.children)
        console.log('replaceWith doc:', doc.body.innerHTML)
      },

      // e.g. dom(el).remove() from teddy
      remove: function () {
        console.log('cheerio polyfill: remove()', el)
        return el.remove()
      }
    }
  }

  // e.g. dom.html() from teddy
  $.html = function () {
    console.log('cheerio polyfill: dom.html()', doc.body.innerHTML)
    return doc.body.innerHTML
  }

  return $
}
