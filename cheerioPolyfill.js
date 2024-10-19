// create a native DOMParser
const parser = new window.DOMParser()

// stub out cheerio using native dom methods for frontend so we don't have to bundle cheerio on the frontend
export function load (html) {
  const doc = parser.parseFromString(html, 'text/html')
  doc.body.innerHTML = doc.head.innerHTML + doc.body.innerHTML

  // return a querySelector function with function chains
  // e.g. dom('include') or dom(el) from teddy
  const $ = function (query) { // query can be a string, or a dom object
    // if query is a string, we need to create a dom object from the string: an object with elements in it, e.g. a list of include tag objects
    if (typeof query === 'string') {
      const els = doc.querySelectorAll(query)
      return els // return the object collection
    }

    // if query is an object, it's assumed we're trying to perform operations on a single dom node
    const el = query
    return {

      // e.g. dom(el).children() from teddy
      children: function () {
        return el.childNodes
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
        // can either be a string or an array of elements
        if (typeof html === 'object') {
          let newHtml = ''
          for (const el of html) {
            if (el.nodeType === window.Node.COMMENT_NODE) newHtml += '<!-- ' + el.textContent + ' -->'
            else newHtml += el.outerHTML || el.textContent
          }
          html = newHtml
        }
        const temp = document.createElement('div')
        temp.innerHTML = html
        el.replaceWith(...temp.childNodes)
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
