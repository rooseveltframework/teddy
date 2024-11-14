// stub out cheerio using native dom methods for frontend so we don't have to bundle cheerio on the frontend
export function load (html) {
  const doc = parseTeddyDOMFromString(html) // create a DOM

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
        return getTeddyDOMInnerHTML(el)
      },

      // e.g. dom(el).attr('teddydeferreddynamicinclude', 'true') from teddy
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
            if (el.nodeType === window.Node.COMMENT_NODE) newHtml += '<!--' + el.textContent + '-->'
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
    return getTeddyDOMInnerHTML(doc)
  }

  return $
}

load.isCheerioPolyfill = true

// DOM parser function like DOMParser's parseFromString but allows Teddy elements to exist in places where they otherwise wouldn't be allowed, like inside of <select> elements
function parseTeddyDOMFromString (html) {
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
  const root = document.createElement('body')
  const dom = [root]
  const tagAndCommentRegex = /<\/?([a-zA-Z0-9]+)([^>]*)>|<!--([\s\S]*?)-->/g
  const attrRegex = /([a-zA-Z0-9-:._]+)(?:=(["'])(.*?)\2)?/g
  let lastIndex = 0
  let match

  // loop through each match and build a DOM
  while ((match = tagAndCommentRegex.exec(html)) !== null) {
    if (!dom[dom.length - 1]) throw new Error('Error parsing your template. There may be a coding mistake in your HTML. Look for extra closing </tags> and other common mistakes.')
    const textBeforeMatch = html.slice(lastIndex, match.index)

    // append text nodes
    if (textBeforeMatch.trim()) {
      const textNode = document.createTextNode(textBeforeMatch)
      dom[dom.length - 1].appendChild(textNode)
    }

    if (match[0].startsWith('<!--')) {
      // handle comments
      const commentNode = document.createComment(match[3])
      dom[dom.length - 1].appendChild(commentNode)
    } else {
      // handle tags
      const [fullMatch, tagName, attrString] = match
      const isClosingTag = fullMatch.startsWith('</')
      if (isClosingTag) dom.pop() // pop the list if it's a closing tag
      else {
        // create a new element
        const element = document.createElement(tagName)

        // set attributes
        let attrMatch
        const attrMap = new Map()
        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
          const attrName = attrMatch[1]
          const attrValue = attrMatch[3]

          // handle duplicate attributes for special tags
          if (attrMap.has(attrName)) {
            let count = 1
            let newAttrName
            do {
              newAttrName = `${attrName}-teddyduplicate${count}`
              count++
            } while (attrMap.has(newAttrName))
            attrMap.set(newAttrName, attrValue)
          } else attrMap.set(attrName, attrValue)
        }

        // apply attributes to the element
        for (const [name, value] of attrMap) element.setAttribute(name, value || '')

        // append the new element to the current parent
        dom[dom.length - 1].appendChild(element)

        // push the new element to the dom if it's not self-closing
        if (!selfClosingTags.has(tagName.toLowerCase()) && !fullMatch.endsWith('/>')) dom.push(element)
      }
    }

    lastIndex = tagAndCommentRegex.lastIndex
  }

  // append any remaining text after the last match
  if (lastIndex < html.length) {
    const remainingText = html.slice(lastIndex)
    if (remainingText.trim()) {
      const textNode = document.createTextNode(remainingText)
      dom[dom.length - 1].appendChild(textNode)
    }
  }

  return root
}

// custom function to get inner HTML without escaping various things to prevent teddy from infinitely escaping them
function getTeddyDOMInnerHTML (node) {
  const doublyEncodedEntities = {
    '&amp;amp;': '&amp;',
    '&amp;lt;': '&lt;',
    '&amp;gt;': '&gt;',
    '&amp;quot;': '&quot;',
    '&amp;#39;': '&#39;',
    '&amp;#x2F;': '&#x2F;'
  }
  const entityEntries = Object.entries(doublyEncodedEntities)

  // build html string
  let html = ''
  for (const child of node.childNodes) {
    if (child.nodeType === window.Node.ELEMENT_NODE) {
      let outerHTML = child.outerHTML
      for (const [doublyEncoded, singleEncoded] of entityEntries) outerHTML = outerHTML.replace(new RegExp(doublyEncoded, 'g'), singleEncoded)
      html += outerHTML
    } else if (child.nodeType === window.Node.TEXT_NODE) {
      let textContent = child.textContent
      for (const [doublyEncoded, singleEncoded] of entityEntries) textContent = textContent.replace(new RegExp(doublyEncoded, 'g'), singleEncoded)
      html += textContent
    } else if (child.nodeType === window.Node.COMMENT_NODE) {
      let commentContent = child.textContent
      for (const [doublyEncoded, singleEncoded] of entityEntries) commentContent = commentContent.replace(new RegExp(doublyEncoded, 'g'), singleEncoded)
      html += `<!--${commentContent}-->`
    }
  }

  return html
}
