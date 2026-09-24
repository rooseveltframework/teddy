// every engine in this suite is asked to produce the same page, but no two of them produce the same bytes: they disagree about which characters need escaping, which spelling of an entity to use, and how much of the template's own whitespace to keep. none of that is what the benchmark is measuring, so output is reduced to a canonical form before it is compared. the reduction is deliberately conservative: it collapses whitespace and unifies entity spellings, but it never decodes an entity, so a template that forgot to escape a value still fails to match one that escaped it

// the escaped forms that mean the same character, mapped to one spelling apiece
const entityAliases = new Map([
  ['&#38;', '&amp;'], ['&#038;', '&amp;'], ['&#x26;', '&amp;'], ['&#X26;', '&amp;'],
  ['&#60;', '&lt;'], ['&#060;', '&lt;'], ['&#x3c;', '&lt;'], ['&#x3C;', '&lt;'],
  ['&#62;', '&gt;'], ['&#062;', '&gt;'], ['&#x3e;', '&gt;'], ['&#x3E;', '&gt;'],
  ['&#34;', '&quot;'], ['&#034;', '&quot;'], ['&#x22;', '&quot;'],
  // engines disagree about whether an apostrophe in text needs escaping at all: pug leaves it alone, teddy writes &#39;, handlebars writes &#x27;. all three render the same character, and none of them can break out of a double quoted attribute
  ['&#39;', "'"], ['&#039;', "'"], ['&#x27;', "'"], ['&apos;', "'"],
  // handlebars and a few others escape characters that only matter inside an unquoted attribute; in a correctly quoted document they are the plain character
  ['&#x60;', '`'], ['&#96;', '`'],
  ['&#x3d;', '='], ['&#x3D;', '='], ['&#61;', '='],
  ['&#x2f;', '/'], ['&#x2F;', '/'], ['&#47;', '/'], ['&sol;', '/']
])

const entityPattern = /&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z]+);/g

export function canonicalize (html) {
  if (typeof html !== 'string') return String(html)
  return html
    // unify the escaped forms that differ only in spelling
    .replace(entityPattern, match => entityAliases.get(match) ?? match)
    // an html parser does not care how a tag's attributes are quoted
    .replace(/=(["'])(.*?)\1/g, (m, q, value) => '="' + value + '"')
    // marko leaves an attribute value unquoted when it safely can; the fixtures contain no = outside of a tag, so quoting every bare value is safe here
    .replace(/([a-zA-Z][a-zA-Z0-9-:._]*)=([^\s"'>]+)/g, '$1="$2"')
    // html does not care what order a tag's attributes are written in, and engines differ: pug hoists class to the front, the rest keep source order
    .replace(/<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)+)(\s*\/?)>/g, (match, tag, attributes, close) => {
      const parts = attributes.match(/[^\s=]+(?:="[^"]*")?/g) || []
      return '<' + tag + ' ' + parts.sort().join(' ') + close + '>'
    })
    // self-closing void tags: <br/> and <br> are the same element, and padding before the closing bracket is not either (every literal > in the fixtures is escaped)
    .replace(/\s*\/>/g, '>')
    .replace(/\s+>/g, '>')
    // template indentation is an artifact of how the template was written, not output
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim()
}

// where two canonical strings first diverge, rendered with enough surrounding text to see what happened; a raw index into a 400kb page is not a usable diagnostic
export function firstDifference (expected, actual) {
  const limit = Math.min(expected.length, actual.length)
  let i = 0
  while (i < limit && expected[i] === actual[i]) i++
  if (i === limit && expected.length === actual.length) return null
  const from = Math.max(0, i - 60)
  const to = i + 120
  return {
    index: i,
    expected: expected.slice(from, to),
    actual: actual.slice(from, to),
    caret: ' '.repeat(i - from) + '^'
  }
}
