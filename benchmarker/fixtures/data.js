// the shared data model every engine renders from
//
// the model is deliberately made of strings, numbers, and booleans that are already in their final display form: no dates to format, no numbers to round, no lists to sort. teddy has no filters or helpers, so any scenario that needed one would either force the other engines to do work teddy cannot do, or force teddy's competitors to leave their own fast paths. keeping the formatting out of the template means every engine is measured on the same job: walking a tree and concatenating strings

// a seeded generator, so every run of the suite renders byte-identical output and results can be compared across machines and across commits
function mulberry32 (seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = ['Ada', 'Grace', 'Alan', 'Edsger', 'Barbara', 'Ken', 'Margaret', 'Donald', 'Frances', 'Dennis', 'Radia', 'Linus']
const LAST_NAMES = ['Lovelace', 'Hopper', 'Turing', 'Dijkstra', 'Liskov', 'Thompson', 'Hamilton', 'Knuth', 'Allen', 'Ritchie', 'Perlman', 'Torvalds']
const DEPARTMENTS = ['Engineering', 'Design', 'Support', 'Sales', 'Operations', 'Research']
const TAG_POOL = ['durable', 'lightweight', 'handmade', 'recycled', 'limited', 'classic', 'seasonal', 'bestseller']
const ADJECTIVES = ['Sturdy', 'Plush', 'Vintage', 'Woven', 'Stitched', 'Padded', 'Jointed', 'Mohair']
const NOUNS = ['Bear', 'Cub', 'Panda', 'Koala', 'Grizzly', 'Bruin', 'Teddy', 'Honeypot']

export default function makeModel (options = {}) {
  const tableRows = options.tableRows ?? 1000
  const productCount = options.products ?? 24
  const random = mulberry32(42)
  const pick = list => list[Math.floor(random() * list.length)]

  const products = []
  for (let i = 0; i < productCount; i++) {
    const tags = []
    for (let t = 0; t < 3; t++) tags.push({ label: pick(TAG_POOL) })
    products.push({
      id: 'sku-' + (1000 + i),
      name: pick(ADJECTIVES) + ' ' + pick(NOUNS),
      price: '$' + (19 + Math.floor(random() * 80)) + '.99',
      description: 'A ' + pick(ADJECTIVES).toLowerCase() + ' companion, stuffed by hand and stitched to last.',
      inStock: random() > 0.25,
      onSale: random() > 0.6,
      rating: (3 + Math.floor(random() * 3)) + ' of 5',
      tags
    })
  }

  const rows = []
  for (let i = 0; i < tableRows; i++) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    rows.push({
      id: 'EMP-' + (10000 + i),
      name: first + ' ' + last,
      email: first.toLowerCase() + '.' + last.toLowerCase() + '@example.com',
      department: pick(DEPARTMENTS),
      title: pick(['Junior', 'Staff', 'Senior', 'Principal']) + ' ' + pick(['Engineer', 'Designer', 'Analyst']),
      tenure: (1 + Math.floor(random() * 20)) + ' years',
      active: random() > 0.15
    })
  }

  return {
    site: {
      name: 'Teddy & Co.',
      tagline: 'Handmade bears since 1902',
      url: 'https://example.com',
      supportEmail: 'help@example.com',
      copyright: '© 1902–2026 Teddy & Co.'
    },
    page: {
      title: 'Our whole collection',
      heading: 'Every bear we make',
      description: 'Browse the full catalog, sorted the way our stitchers like it.',
      // exercises the escaping path. it is deliberately limited to < and &, the two characters every engine in the suite escapes: marko leaves > and " alone in body text, pug leaves ' alone, and a value containing those would be comparing escaping policy rather than rendering speed
      unsafe: 'Bears & bows <3 honey, 2 for 1 & free bows',
      // deliberately rendered unescaped, to exercise the raw-output path
      blurb: '<strong>Free shipping</strong> on orders over $50.',
      breadcrumb: 'Home / Shop / Collection',
      updated: 'August 24, 2026'
    },
    user: {
      name: 'Grace Hopper',
      email: 'grace@example.com',
      loggedIn: true,
      admin: false,
      editor: true,
      plan: 'Workshop',
      unreadCount: 7,
      greeting: 'Good afternoon',
      lastSeen: 'two hours ago'
    },
    flags: {
      beta: false,
      darkMode: true,
      showBanner: true,
      compact: false,
      newCheckout: true
    },
    nav: [
      { label: 'Shop', href: '/shop', current: false },
      { label: 'Collection', href: '/collection', current: true },
      { label: 'Workshop', href: '/workshop', current: false },
      { label: 'Care guide', href: '/care', current: false },
      { label: 'Stockists', href: '/stockists', current: false },
      { label: 'About', href: '/about', current: false },
      { label: 'Journal', href: '/journal', current: false },
      { label: 'Contact', href: '/contact', current: false }
    ],
    products,
    rows,
    // a short slice of the same rows, for the composite page scenario, so that the full 1,000 row stress test stays isolated in the table scenario
    //
    // copies rather than the row objects themselves, which is a workaround: node-php-runner 1.2.0 sends a model to PHP as JSON and replaced every reference to an object it had already sent with the string "[Circular]", so the twenty five shared rows arrived as strings. that is fixed but not yet published, and this line can go back to rows.slice(0, 25) once it is. the values are identical either way, so no engine renders anything different because of it
    recent: rows.slice(0, 25).map(row => ({ ...row })),
    footer: {
      year: '2026',
      note: 'All bears are hand-finished in Brooklyn.',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Returns', href: '/returns' },
        { label: 'Accessibility', href: '/accessibility' }
      ]
    }
  }
}
