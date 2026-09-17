// checks the component examples in the documentation against what teddy really renders
//
// every example in docs/statics/pages/usage.html is written by hand, and nothing about writing one stops it drifting from the markup teddy produces. these render the examples as the docs describe them and compare what comes out against what the page shows
//
// an example that elides part of its output writes `...` where the elision is, so a documented block is read as the pieces around its elisions rather than as one string: each piece has to appear, in the order the doc shows it
import test from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import teddy from '../teddy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// line endings are whatever the checkout made them, and windows makes them \r\n, so the page is read as lines rather than as bytes
const usage = fs.readFileSync(path.join(__dirname, '..', 'docs', 'statics', 'pages', 'usage.html'), 'utf8').replace(/\r\n/g, '\n')

// the markup blocks under a heading, as the page shows them
function blocksUnder (id) {
  const from = usage.indexOf(`id="${id}"`)
  assert.notStrictEqual(from, -1, `usage.html has no section with the id ${id}`)
  // where the next section starts, which is a heading that carries an id of its own. the examples hold headings too, so a bare <h is not the boundary
  const heading = /<h[1-6] id="/g
  heading.lastIndex = from
  const next = heading.exec(usage)
  const section = usage.slice(from, next ? next.index : undefined)
  return [...section.matchAll(/<escape>\n([\s\S]*?)\n\s*<\/escape>/g)].map(match => match[1].trim())
}

// what the page shows, allowing for the parts it elides
function showsRender (documented, rendered, message) {
  const pieces = documented.split(/\s*\.\.\.\s*/).map(piece => piece.trim()).filter(Boolean)
  let at = 0
  for (const piece of pieces) {
    const found = rendered.indexOf(piece, at)
    assert.notStrictEqual(found, -1, `${message}\n\nthe documentation shows:\n${piece}\n\nteddy renders:\n${rendered}`)
    at = found + piece.length
  }
}

// whitespace is what a template's own indentation decides, and the docs lay their examples out for reading
const squash = markup => markup.replace(/\s+/g, ' ').replace(/> </g, '><').trim()

const examples = [
  {
    id: 'components',
    what: 'rendering an include as a web component',
    templates: { productCard: '<style>.card { color: green }</style><div class="card">...</div>' },
    page: '<include src="productCard" as="product-card"></include>'
  },
  {
    id: 'componentattributes',
    what: 'configuring a component',
    templates: { productCard: '<div class="card">...</div>' },
    page: '<include src="productCard" as="product-card" data-theme="dark" data-id="{product.id}"></include>',
    model: { product: { id: 7 } }
  },
  {
    id: 'componentslots',
    what: 'putting content inside a component',
    templates: { productCard: '<div class="card">\n  <h3>{name}</h3>\n  <slot name="description">No description yet.</slot>\n</div>' },
    page: '<include src="productCard" as="product-card">\n  <arg name>Kettle</arg>\n  <p slot="description">Boils water in under a minute.</p>\n</include>'
  }
]

test('the component examples in the documentation', async (t) => {
  for (const example of examples) {
    await t.test(`should show what teddy renders for ${example.what}`, () => {
      teddy.setVerbosity(0)
      teddy.clearTemplates()
      for (const name in example.templates) teddy.setTemplate(name, example.templates[name])
      teddy.setTemplate('documentedPage', example.page)
      const rendered = squash(teddy.render('documentedPage', example.model || {}))

      const blocks = blocksUnder(example.id)
      assert.ok(blocks.length >= 2, `the ${example.id} section shows fewer than two markup blocks`)

      // the last block of a section is its output, and the ones before it are the input the section says produces it
      showsRender(squash(blocks[blocks.length - 1]), rendered, `the ${example.id} section of usage.html does not show what teddy renders`)
    })
  }
})

test('the documentation shows the include that each example says it does', async (t) => {
  for (const example of examples) {
    await t.test(`should write the include for ${example.what} as the example renders it`, () => {
      const blocks = blocksUnder(example.id).map(squash)
      assert.ok(blocks.some(block => block === squash(example.page)), `usage.html no longer shows this include in the ${example.id} section:\n${example.page}\n\nit shows:\n${blocks.join('\n\n')}`)
    })
  }
})
