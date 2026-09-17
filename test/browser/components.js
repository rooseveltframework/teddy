// loads what teddy renders for a component into a browser, and asks the browser what it made of it
//
// the rest of the browser suite runs teddy's own tests in a browser and compares rendered strings, which proves the renderer agrees with itself but says nothing about whether the markup works. every claim the component feature rests on is a claim about a browser: that a <template shadowrootmode> becomes a shadow root, that a child naming a slot no component defines is left unassigned, and that an unassigned child is not rendered. none of those can be seen in a string
//
// the payload bug this feature shipped with is the reason these exist. a slot attribute written as slot="" means the default slot, exactly as writing none does, so the hydration payload was projected into components that had one. the markup looked correct and every string assertion passed
import path from 'path'
import { fileURLToPath } from 'url'
import { test, expect } from '@playwright/test'
import teddy from '../../teddy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

teddy.setVerbosity(0)
teddy.setTemplateRoot(path.join(__dirname, '..', 'templates'))

// what teddy makes of a template and an include, as a page for the browser to parse
async function load (page, template, include, model = {}) {
  teddy.setTemplate('componentUnderTest', template)
  teddy.setTemplate('pageUnderTest', include)
  await page.setContent(`<!DOCTYPE html><title>component</title>${teddy.render('pageUnderTest', model)}`)
}

// an unassigned child is in the dom but has no box, which is how it is told apart from a rendered one
const rendered = locator => locator.evaluate(el => {
  const box = el.getBoundingClientRect()
  return box.width > 0 || box.height > 0
})

test.describe('what a browser makes of a rendered component', () => {
  test('should build a shadow root from the template teddy wrote', async ({ page }) => {
    await load(page, '<div class="card">in the shadow root</div>', "<include src='componentUnderTest' as='my-card' mode='shadow'></include>")
    const host = page.locator('my-card')
    expect(await host.evaluate(el => !!el.shadowRoot)).toBe(true)
    expect(await host.evaluate(el => el.shadowRoot.querySelector('.card').textContent)).toBe('in the shadow root')
    // the parser takes the template out of the tree as it builds the shadow root from it
    expect(await host.evaluate(el => !!el.querySelector('template'))).toBe(false)
  })

  test('should keep the styles of a component inside its shadow root', async ({ page }) => {
    await load(page, '<style>.card { position: absolute }</style><div class="card">x</div>', "<include src='componentUnderTest' as='my-card' mode='shadow'></include><div class='card'>outside</div>")
    const inside = await page.locator('my-card').evaluate(el => window.getComputedStyle(el.shadowRoot.querySelector('.card')).position)
    const outside = await page.locator('body > .card').evaluate(el => window.getComputedStyle(el).position)
    expect(inside).toBe('absolute')
    expect(outside, 'the styles of the component reached the rest of the page').toBe('static')
  })

  test('should project the light dom the page wrote into the slot that names it', async ({ page }) => {
    await load(page, '<div class="card"><slot name="description">fallback</slot></div>', "<include src='componentUnderTest' as='my-card' mode='shadow'><p slot='description'>from the page</p></include>")
    const slotted = page.locator('my-card > [slot="description"]')
    expect(await slotted.evaluate(el => el.assignedSlot?.name)).toBe('description')
    await expect(page.getByText('from the page')).toBeVisible()
    await expect(page.getByText('fallback')).toBeHidden()
  })

  test('should leave a slot showing its own content when the page gives it none', async ({ page }) => {
    await load(page, '<div class="card"><slot name="description">fallback</slot></div>', "<include src='componentUnderTest' as='my-card' mode='shadow'></include>")
    await expect(page.getByText('fallback')).toBeVisible()
  })
})

test.describe('what teddy keeps out of a component', () => {
  // the bug this feature shipped with: slot="" is the default slot, the same as writing no slot attribute at all
  test('should keep a hydrating component\'s model out of a default slot', async ({ page }) => {
    await load(page, '<div class="card"><slot></slot></div>', "<include src='componentUnderTest' as='my-card' mode='shadow' hydrate='something'></include>", { something: 'sent' })
    const payload = page.locator('my-card > script.teddy-component-model')
    await expect(payload).toHaveCount(1)
    expect(await payload.evaluate(el => el.assignedSlot), 'the payload was projected into the component').toBe(null)
    expect(await rendered(payload), 'the payload was rendered').toBe(false)
    // and it is still readable by the class that will hydrate the component
    expect(await payload.evaluate(el => JSON.parse(el.textContent))).toEqual({ something: 'sent' })
  })

  test('should keep the fallback out of a default slot', async ({ page }) => {
    await load(page, '<div class="card"><slot></slot></div>', "<include src='componentUnderTest' as='my-card'><p>from the page</p></include>")
    const fallback = page.locator('my-card > [slot="teddy-fallback"]')
    await expect(fallback).toHaveCount(1)
    expect(await fallback.evaluate(el => el.assignedSlot), 'the fallback was projected into the component').toBe(null)
    expect(await rendered(fallback), 'the fallback was rendered beside the component').toBe(false)
    // the content the page wrote still reaches that same default slot
    expect(await page.locator('my-card > p').evaluate(el => el.assignedSlot?.name)).toBe('')
  })

  test('should leave an unwrapped fallback unrendered when every slot is named', async ({ page }) => {
    await load(page, '<div class="card"><slot name="description"></slot></div>', "<include src='componentUnderTest' as='my-card'></include>")
    // asked of the host rather than through a locator: a locator reaches into the shadow root as well, and both copies of the markup match
    const fallback = await page.locator('my-card').evaluate(el => {
      const child = el.querySelector(':scope > .card')
      const box = child.getBoundingClientRect()
      return { wrapped: el.innerHTML.includes('teddy-fallback'), assigned: child.assignedSlot, rendered: box.width > 0 || box.height > 0 }
    })
    expect(fallback.wrapped, 'a component with no default slot was given a wrapper it does not need').toBe(false)
    expect(fallback.assigned).toBe(null)
    expect(fallback.rendered, 'the fallback was rendered beside the component').toBe(false)
  })

  test('should show the component once, not the shadow root and the fallback both', async ({ page }) => {
    await load(page, '<style>.card { display: block }</style><div class="card">the component</div>', "<include src='componentUnderTest' as='my-card'></include>")
    // both copies are in the dom, which is the point of the fallback; only one of them may be rendered
    const copies = await page.locator('my-card').evaluate(el => {
      const all = [...el.querySelectorAll('.card'), ...el.shadowRoot.querySelectorAll('.card')]
      const box = node => { const rect = node.getBoundingClientRect(); return rect.width > 0 || rect.height > 0 }
      return { inTheDom: all.length, rendered: all.filter(box).length }
    })
    expect(copies).toEqual({ inTheDom: 2, rendered: 1 })
  })
})

test.describe('what a browser that builds no shadow root would make of it', () => {
  // no browser playwright drives is one, so the same bytes are parsed through innerHTML, which does not process shadowrootmode and so leaves the markup in the shape such a browser would see
  const withoutShadowRoots = async (page, markup) => {
    await page.setContent('<!DOCTYPE html><title>no declarative shadow dom</title><div id="holder"></div>')
    return page.evaluate(html => {
      const holder = document.getElementById('holder')
      holder.innerHTML = html
      const host = holder.firstElementChild
      const box = el => { if (!el) return null; const rect = el.getBoundingClientRect(); return rect.width > 0 || rect.height > 0 }
      return {
        builtAShadowRoot: !!host.shadowRoot,
        templateRendered: box(host.querySelector('template')),
        fallbackRendered: box(host.querySelector('[slot="teddy-fallback"]') || host.querySelector('.card')),
        text: host.innerText.replace(/\s+/g, ' ').trim()
      }
    }, markup)
  }

  test('should render the fallback teddy wrote beside the shadow root', async ({ page }) => {
    teddy.setTemplate('componentUnderTest', '<div class="card"><slot></slot></div>')
    teddy.setTemplate('pageUnderTest', "<include src='componentUnderTest' as='my-card'>the page wrote this</include>")
    const result = await withoutShadowRoots(page, teddy.render('pageUnderTest', {}))
    expect(result.builtAShadowRoot).toBe(false)
    expect(result.templateRendered, 'an unsupported template is inert').toBe(false)
    expect(result.fallbackRendered, 'the fallback did not render').toBe(true)
    expect(result.text).toContain('the page wrote this')
  })

  test('should render nothing at all in shadow mode, which is what that mode trades away', async ({ page }) => {
    teddy.setTemplate('componentUnderTest', '<div class="card">only in the shadow root</div>')
    teddy.setTemplate('pageUnderTest', "<include src='componentUnderTest' as='my-card' mode='shadow'></include>")
    const result = await withoutShadowRoots(page, teddy.render('pageUnderTest', {}))
    expect(result.builtAShadowRoot).toBe(false)
    expect(result.text).toBe('')
  })
})
