import teddy from './teddy.js'
import ejs from './ejs.js'
import pug from './pug.js'
import mustache from './mustache.js'
import handlebars from './handlebars.js'
import dust from './dust.js'
import marko from './marko.js'
import nunjucks from './nunjucks.js'
import liquid from './liquid.js'
import eta from './eta.js'
import squirrelly from './squirrelly.js'
import dot from './dot.js'
import lodash from './lodash.js'
import artTemplate from './artTemplate.js'
import php from './php.js'

// teddy first, because it is the subject; the rest in the order they are most likely to be the thing a reader is comparing teddy against, and php last: it is not a javascript templating engine and is here for a different question
export default [
  teddy,
  ejs,
  pug,
  mustache,
  handlebars,
  dust,
  marko,
  nunjucks,
  liquid,
  eta,
  squirrelly,
  dot,
  lodash,
  artTemplate,
  php
]
