const params = {} // default values for parameters sent to teddy

// set params to default values
setDefaultParams()

module.exports.params = params

const templates = {} // compiled templates are stored as object collections, e.g. { "myTemplate.html": "<p>some markup</p>"}
let renderedTemplates = {} // cache of fully rendered temmplates, e.g. { "myTemplate.html": "<p>some markup</p>"}

let jsonStringifyCache

let consoleWarnings // used to overload console.warn for the server-side error gui
let consoleErrors // used to overload console.error for the server-side error gui

let fs
let path

// teddy's internal console logging system
let warnings = []
let errors = []

const teddyConsole = {
  warn: function (value) {
    if (!warnings.includes(value)) {
      console.warn(value)
      warnings.push(value)
      consoleWarnings += '<li>' + escapeEntities(value) + '</li>'
    }
  },
  error: function (value) {
    if (!errors.includes(value)) {
      console.error(value)
      errors.push(value)
      consoleErrors += '<li>' + escapeEntities(value) + '</li>'
    }
  }
}

module.exports = {
  // State
  params,
  teddyConsole,

  // Functions
  setDefaultParams,
  setVerbosity,
  setTemplateRoot,
  cacheRenders,
  setDefaultCaches,
  setMaxCaches,
  setCacheWhitelist,
  setCacheBlacklist,
  compileAtEveryRender,
  minify,
  setMaxPasses,
  getTemplates,
  setTemplate,
  getRenderedTemplates,
  setRenderedTemplates,
  flushCache,
  render,
  compile
}

const { cleanNoParseContent, escapeEntities } = require('./utils')
const { scanTemplate } = require('./scanTemplate')

function setDefaultParams () {
  params.verbosity = 1
  params.templateRoot = './'
  params.cacheRenders = false
  params.defaultCaches = 1
  params.templateMaxCaches = {}
  params.cacheWhitelist = false
  params.cacheBlacklist = []
  params.compileAtEveryRender = false
  params.minify = false
  params.maxPasses = 25000
}

// mutator method to set verbosity param. takes human-readable string argument and converts it to an integer for more efficient checks against the setting
function setVerbosity (v) {
  switch (v) {
    case 'none':
    case 0:
      v = 0
      break
    case 'verbose':
    case 2:
      v = 2
      break
    case 'DEBUG':
    case 3:
      v = 3
      break
    default: // concise
      v = 1
  }
  params.verbosity = v
}

// mutator method to set template root param; must be a string
function setTemplateRoot (v) {
  params.templateRoot = String(v)
}

// turn on or off the setting to cache template renders
function cacheRenders (v) {
  params.cacheRenders = Boolean(v)
}

// mutator method to set default caches param: the number of cached versions of each templates to store by default if cacheRenders is enabled
function setDefaultCaches (v) {
  params.defaultCaches = parseInt(v)
}

// mutator method to set max caches for a given registered template
function setMaxCaches (template, v) {
  params.templateMaxCaches[String(template)] = parseInt(v)
}

// mutator method to set a whitelist of templates to cache, e.g. { "myTemplate.html": maxCaches} where maxCaches is an integer
function setCacheWhitelist (o) {
  let i
  params.cacheWhitelist = o
  for (i in o) {
    setMaxCaches(i, o[i])
  }
}

// mutator method to set a blacklist of templates not to cache as an array
function setCacheBlacklist (a) {
  params.cacheBlacklist = a
}

// turn on or off the setting to compile templates at every render
function compileAtEveryRender (v) {
  params.compileAtEveryRender = Boolean(v)
}

// turn on or off the setting to minify templates using teddy's internal minifier
function minify (v) {
  params.minify = Boolean(v)
}

// mutator method to set max passes param: the number of times the parser can iterate over the template
function setMaxPasses (v) {
  params.maxPasses = Number(v)
}

// access fully rendered templates
function getRenderedTemplates () {
  return renderedTemplates
}

// mutator method to set rendered templates
function setRenderedTemplates (v) {
  renderedTemplates = v
}

// access compiled templates
function getTemplates () {
  return templates
}

// mutator method to cache compiled template
function setTemplate (file, template) {
  templates[file] = template
}

/**
 * public methods
 */

// invalidates cache of a given template and model combination
// if no model is supplied, deletes all caches of the given template
function flushCache (template, model) {
  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) {
      teddyConsole.warn('teddy.flushCache attempted to invalidate cache of template that is not a string')
    }
    return ''
  }

  // append extension if not present
  if (template.slice(-5) !== '.html') {
    template += '.html'
  }

  if (model) {
    const renders = renderedTemplates[template]
    let i
    let l
    let render
    let renderStringyModel

    if (renders) {
      l = renders.length
    } else {
      return
    }

    jsonStringifyCache = []
    const stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences)
    for (i = 0; i < l; i++) {
      render = renders[i]
      jsonStringifyCache = []
      renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences)
      if (renderStringyModel === stringyModel) {
        renderedTemplates[template].splice(i, 1)
      }
    }
  } else {
    delete renderedTemplates[template]
  }
}

function jsonStringifyRemoveCircularReferences (key, value) {
  if (typeof value === 'object' && value !== null) {
    if (jsonStringifyCache.indexOf(value) !== -1) {
      // circular reference found, discard key
      return
    }
    jsonStringifyCache.push(value)
  }
  return value
}

// compiles a template
function compile (template, fs) {
  const name = template
  let register = false

  // it's assumed that the argument is already a template string if we're not server-side
  if (typeof template !== 'string') {
    if (params.verbosity > 1) {
      teddyConsole.warn('teddy.compile attempted to compile a template which is not a string.')
    }
    return ''
  }

  // get contents of file if template is a file
  if (template.indexOf('<') === -1 && fs !== undefined && fs.readFileSync !== undefined) {
    // append extension if not present
    if (template.slice(-5) !== '.html') {
      template += '.html'
    }

    register = true
    try {
      template = fs.readFileSync(template, 'utf8')
    } catch (e) {
      try {
        template = fs.readFileSync(params.templateRoot + template, 'utf8')
      } catch (e) {
        try {
          template = fs.readFileSync(params.templateRoot + '/' + template, 'utf8')
        } catch (e) {
          // do nothing, attempt to render it as code
          register = false
        }
      }
    }
  } else {
    if (templates[template]) {
      template = templates[template]
      register = true
    } else {
      // append extension if not present
      if (template.slice(-5) !== '.html') {
        template += '.html'
      }
      if (templates[template]) {
        template = templates[template]
        register = true
      }
    }
  }

  if (register) {
    templates[name] = template
    return template
  } else {
    return template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
  }
}

// parses a template
function render (template, model, callback) {
  model = Object.assign({}, model) // make a copy of the model
  const passes = 0

  // ensure template is a string
  if (typeof template !== 'string') {
    if (params.verbosity > 1) {
      teddyConsole.warn('teddy.render attempted to render a template which is not a string.')
    }
    return ''
  }

  // declare vars
  let renderedTemplate
  let i
  let l
  let renders
  let render
  let stringyModel
  let renderStringyModel
  let errorMessage

  // overload console logs
  consoleWarnings = ''
  consoleErrors = ''

  // reset errors and warnings
  errors = []
  warnings = []

  // express.js support
  if (model.settings && model.settings.views && path) {
    params.templateRoot = path.resolve(model.settings.views)
  }

  // remove templateRoot from template name if necessary
  if (template.slice(params.templateRoot.length) === params.templateRoot) {
    template = template.replace(params.templateRoot, '')
  }

  // return cached template if one exists
  if (params.cacheRenders && templates[template] && (!params.cacheWhitelist || params.cacheWhitelist[template]) && params.cacheBlacklist.indexOf(template) < 0) {
    jsonStringifyCache = []
    stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences)
    renderedTemplates[template] = renderedTemplates[template] || []
    renders = renderedTemplates[template]

    l = renders.length
    for (i = 0; i < l; i++) {
      render = renders[i]
      jsonStringifyCache = []
      renderStringyModel = JSON.stringify(render.model, (key, value) => jsonStringifyRemoveCircularReferences(key, value, jsonStringifyCache))
      if (renderStringyModel === stringyModel) {
        // move to last position in the array to mark it as most recently accessed
        renderedTemplates[template].push(renderedTemplates[template].splice(i, 1)[0])

        if (typeof callback === 'function') {
          callback(null, render.renderedTemplate)
          return
        } else {
          return render.renderedTemplate
        }
      }
    }
  }

  // compile template if necessary
  if (!templates[template] || params.compileAtEveryRender) {
    renderedTemplate = compile(template, fs)
  }

  renderedTemplate = templates[template] || renderedTemplate

  // prepare to cache the template if caching is enabled and this template is eligible
  if (params.cacheRenders && templates[template] && (!params.cacheWhitelist || params.cacheWhitelist[template]) && params.cacheBlacklist.indexOf(template) < 0) {
    renderedTemplates[template] = renderedTemplates[template] || []
    l = renderedTemplates[template].length
    if ((params.templateMaxCaches[template] && l >= params.templateMaxCaches[template]) || (!params.templateMaxCaches[template] && l >= params.defaultCaches)) {
      renderedTemplates[template].shift()
    }
    l = renderedTemplates[template].push({
      renderedTemplate: '',
      model: Object.assign({}, model)
    })
  }

  if (!renderedTemplate) {
    if (params.verbosity) {
      teddyConsole.warn('teddy.render attempted to render a template which doesn\'t exist: ' + template)
    }
    return ''
  }

  // Parse template
  renderedTemplate = scanTemplate([...renderedTemplate].reverse(), model, false, passes, fs, false, [], []).template

  // if we have no template and we have errors, render an error page
  if (errors.includes(renderedTemplate) && (consoleErrors || consoleWarnings)) {
    errorMessage = consoleErrors
    renderedTemplate = '<!DOCTYPE html><html lang=\'en\'><head><meta charset=\'utf-8\'><title>Could not parse template</title></head><body><h1>Could not parse template</h1>'
    if (consoleErrors) {
      renderedTemplate += '<p>The following errors occurred while parsing the template:</p>'
      renderedTemplate += '<ul>'
      renderedTemplate += consoleErrors
      renderedTemplate += '</ul>'
    }
    if (consoleWarnings) {
      renderedTemplate += '<p>The following warnings occurred while parsing the template:</p>'
      renderedTemplate += '<ul>'
      renderedTemplate += consoleWarnings
      renderedTemplate += '</ul>'
    }
    renderedTemplate += '</body></html>'
    consoleWarnings = ''
    consoleErrors = ''
  }

  // cache the template if caching is enabled and this template is eligible
  if (params.cacheRenders && templates[template] && (!params.cacheWhitelist || params.cacheWhitelist[template]) && params.cacheBlacklist.indexOf(template) < 0) {
    renderedTemplates[template][l - 1].renderedTemplate = renderedTemplate
  }

  renderedTemplate = cleanNoParseContent(renderedTemplate)

  // execute callback if present, otherwise simply return the rendered template string
  if (typeof callback === 'function') {
    if (errorMessage) {
      callback(errorMessage, renderedTemplate)
    } else {
      callback(null, renderedTemplate)
    }
  } else {
    return renderedTemplate
  }
}

if (typeof module !== 'undefined' && module.exports && typeof window) {
  module.exports.__express = render

  if (typeof require !== 'undefined' && typeof window === 'undefined') {
    fs = require('fs')
    path = require('path')
  }
}
