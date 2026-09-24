import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { packageVersion } from '../version.js'

// loaded when a render is first asked for rather than when this file is, because the module comes from a checkout next door rather than from the registry: an absent one should cost this engine its place in the run and nothing else
const require = createRequire(import.meta.url)
let php = null

// which files a scenario actually compiles: the template itself and any partial it pulls in. worked out once, because a cold measurement times everything inside load() and reading the templates to find that out is not what it is trying to measure
const includes = new Map()

function compiledFiles (scenario, ctx) {
  let files = includes.get(scenario)
  if (!files) {
    const entry = ctx.path(scenario)
    const source = fs.readFileSync(entry, 'utf8')
    const partials = [...source.matchAll(/include\s+'([^']+)'/g)].map(match => path.join(ctx.dir, match[1]))
    files = [entry, ...new Set(partials)]
    includes.set(scenario, files)
  }
  return files
}

// a cold render is the first one after a template changed, so the templates are marked as having changed. php notices and compiles them again, which is the work a cold measurement is for
//
// this is the closest thing php has to the other engines emptying their compile caches: there is no cache to empty, only a compiled form that is reused until the file it came from moves on
//
// it costs more than a recompile, and that is not a distortion. node-php-runner works out what a template reads so it can send only that part of the model, and a template that changed is one whose answer it can no longer trust, so a cold render also goes back to sending the whole model and working the answer out again. that is what the first render after an edit genuinely costs, and it is nearly all of the cold number: recompiling and re-reading the template come to a few percent of it
function markChanged (files) {
  const now = new Date()
  for (const file of files) fs.utimesSync(file, now, now)
}

export default {
  id: 'php',
  name: 'PHP (node-php-runner)',
  url: 'https://rooseveltframework.org/docs/node-php-runner',
  ext: 'php',
  version: packageVersion('php'),
  precompiledNotes: 'not a javascript engine, so there is nothing a browser can run either way',
  browserNotes: 'not a javascript engine, so there is nothing to run in a browser',
  notes: 'not a javascript engine: the template is PHP, and every render crosses into another process, so a fixed round trip and writing the part of the model the page reads as JSON cost more than running the template does',
  // not a javascript templating engine at all: node-php-runner hands the template to PHP itself, so the templating language is PHP and the renderer is the PHP interpreter
  //
  // measured the way an express app uses it, through the view engine, which sends each render to a PHP process that is already running. what that costs is not mostly php: a round trip with nothing in it is about 14 microseconds, and what is left over after that and after writing the model as JSON is under half of any scenario here. php running the template on its own is within a single digit multiple of teddy; reaching it is what the rest of the number is
  async load (scenario, ctx, options = {}) {
    if (!php) php = require('php')
    const template = ctx.path(scenario)
    if (options.cold) markChanged(compiledFiles(scenario, ctx))
    const model = { settings: { views: ctx.dir } }
    return data => new Promise((resolve, reject) => {
      php.__express(template, { ...data, ...model }, (err, markup) => err ? reject(err) : resolve(markup))
    })
  }
}
