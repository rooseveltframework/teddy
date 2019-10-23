(function (global) {
  var teddy // @namespace

  // private utility vars
  var consoleWarnings // used to overload console.warn for the server-side error gui
  var consoleErrors // used to overload console.error for the server-side error gui
  var fs // server-side filesystem module
  var path // server-side utility for manipulating file paths
  var contextModels = [] // stores local models for later consumption by template logic tags
  var matchRecursive // see below
  var jsonStringifyCache
  var endParse = false // Stops rendering if necessary

  // List of all relevant teddy tags
  var primaryTags = {
    include: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', ' '],
    arg: ['<', 'a', 'r', 'g', ' '],
    if: ['<', 'i', 'f', ' '],
    loop: ['<', 'l', 'o', 'o', 'p', ' '],
    unless: ['<', 'u', 'n', 'l', 'e', 's', 's', ' '],
    noteddy: ['<', 'n', 'o', 't', 'e', 'd', 'd', 'y', '>'],
    argInvalid: ['<', 'a', 'r', 'g', '>'],
    includeInvalid: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', '>'],
    ifInvalid: ['<', 'i', 'f', '>'],
    loopInvalid: ['<', 'l', 'o', 'o', 'p', '>'],
    unlessInvalid: ['<', 'u', 'n', 'l', 'e', 's', 's', '>'],
    carg: ['<', '/', 'a', 'r', 'g', '>'],
    cinclude: ['<', '/', 'i', 'n', 'c', 'l', 'u', 'd', 'e', '>'],
    cif: ['<', '/', 'i', 'f', '>'],
    cloop: ['<', '/', 'l', 'o', 'o', 'p', '>'],
    cunless: ['<', '/', 'u', 'n', 'l', 'e', 's', 's', '>'],
    cnoteddy: ['<', '/', 'n', 'o', 't', 'e', 'd', 'd', 'y', '>']
  }

  var secondaryTags = {
    elseif: ['<', 'e', 'l', 's', 'e', 'i', 'f', ' '],
    else: ['<', 'e', 'l', 's', 'e', '>'],
    elseunless: ['<', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', ' '],
    celseif: ['<', '/', 'e', 'l', 's', 'e', 'i', 'f', '>'],
    celse: ['<', '/', 'e', 'l', 's', 'e', '>'],
    celseunless: ['<', '/', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', '>']
  }

  teddy = {
    /**
     * public member vars
     */

    // default values for parameters sent to teddy
    params: {},

    // compiled templates are stored as object collections, e.g. { "myTemplate.html": "<p>some markup</p>"}
    templates: {},

    // cache of fully rendered temmplates, e.g. { "myTemplate.html": "<p>some markup</p>"}
    renderedTemplates: {},

    /**
     * mutator methods for public member vars
     */

    // sets all params to their default values
    setDefaultParams: function () {
      teddy.params.verbosity = 1
      teddy.params.templateRoot = './'
      teddy.params.cacheRenders = false
      teddy.params.defaultCaches = 1
      teddy.params.templateMaxCaches = {}
      teddy.params.cacheWhitelist = false
      teddy.params.cacheBlacklist = []
      teddy.params.compileAtEveryRender = false
      teddy.params.minify = false
      teddy.params.maxPasses = 25000
    },

    // mutator method to set verbosity param. takes human-readable string argument and converts it to an integer for more efficient checks against the setting
    setVerbosity: function (v) {
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
      teddy.params.verbosity = v
    },

    // mutator method to set template root param; must be a string
    setTemplateRoot: function (v) {
      teddy.params.templateRoot = String(v)
    },

    // turn on or off the setting to cache template renders
    cacheRenders: function (v) {
      teddy.params.cacheRenders = Boolean(v)
    },

    // mutator method to set default caches param: the number of cached versions of each templates to store by default if cacheRenders is enabled
    setDefaultCaches: function (v) {
      teddy.params.defaultCaches = parseInt(v)
    },

    // mutator method to set max caches for a given registered template
    setMaxCaches: function (template, v) {
      teddy.params.templateMaxCaches[String(template)] = parseInt(v)
    },

    // mutator method to set a whitelist of templates to cache, e.g. { "myTemplate.html": maxCaches} where maxCaches is an integer
    setCacheWhitelist: function (o) {
      var i
      teddy.params.cacheWhitelist = o
      for (i in o) {
        teddy.setMaxCaches(i, o[i])
      }
    },

    // mutator method to set a blacklist of templates not to cache as an array
    setCacheBlacklist: function (a) {
      teddy.params.cacheBlacklist = a
    },

    // turn on or off the setting to compile templates at every render
    compileAtEveryRender: function (v) {
      teddy.params.compileAtEveryRender = Boolean(v)
    },

    // turn on or off the setting to minify templates using teddy's internal minifier
    minify: function (v) {
      teddy.params.minify = Boolean(v)
    },

    // mutator method to set max passes param: the number of times the parser can iterate over the template
    setMaxPasses: function (v) {
      teddy.params.maxPasses = Number(v)
    },

    // teddy's internal console logging system
    warnings: [],
    errors: [],
    console: {
      warn: function (value) {
        console.warn(value)
        teddy.warnings.push(value)
        consoleWarnings += '<li>' + escapeHtmlEntities(value) + '</li>'
      },
      error: function (value) {
        console.error(value)
        teddy.errors.push(value)
        consoleErrors += '<li>' + escapeHtmlEntities(value) + '</li>'
      }
    },

    /**
     * public methods
     */

    // compiles a template
    compile: function (template) {
      var name = template
      var register = false

      // it's assumed that the argument is already a template string if we're not server-side
      if (typeof template !== 'string') {
        if (teddy.params.verbosity > 1) {
          teddy.console.warn('teddy.compile attempted to compile a template which is not a string.')
        }
        return ''
      }
      // get contents of file if template is a file
      if (template.indexOf('<') === -1 && fs) {
        register = true
        try {
          template = fs.readFileSync(template, 'utf8')
        } catch (e) {
          try {
            template = fs.readFileSync(teddy.params.templateRoot + template, 'utf8')
          } catch (e) {
            try {
              template = fs.readFileSync(teddy.params.templateRoot + '/' + template, 'utf8')
            } catch (e) {
              // do nothing, attempt to render it as code
              register = false
            }
          }
        }
      } else {
        if (teddy.templates[template]) {
          template = teddy.templates[template]
          register = true
        }
      }

      if (register) {
        teddy.templates[name] = template
        return template
      } else {
        return template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
      }
    },

    // invalidates cache of a given template and model combination
    // if no model is supplied, deletes all caches of the given template
    flushCache: function (template, model) {
      // ensure template is a string
      if (typeof template !== 'string') {
        if (teddy.params.verbosity > 1) {
          teddy.console.warn('teddy.flushCache attempted to invalidate cache of template that is not a string')
        }
        return ''
      }

      // append extension if not present
      if (template.slice(-5) !== '.html') {
        template += '.html'
      }

      if (model) {
        var renders = teddy.renderedTemplates[template]
        var i
        var l
        var render
        var stringyModel
        var renderStringyModel

        if (renders) {
          l = renders.length
        } else {
          return
        }

        jsonStringifyCache = []
        stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences)
        for (i = 0; i < l; i++) {
          render = renders[i]
          jsonStringifyCache = []
          renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences)
          if (renderStringyModel === stringyModel) {
            teddy.renderedTemplates[template].splice(i, 1)
          }
        }
      } else {
        delete teddy.renderedTemplates[template]
      }
    },

    // parses a template
    render: function (template, model, callback) {
      model = Object.assign({}, model) // make a copy of the model

      // ensure template is a string
      if (typeof template !== 'string') {
        if (teddy.params.verbosity > 1) {
          teddy.console.warn('teddy.render attempted to render a template which is not a string.')
        }
        return ''
      }

      // declare vars
      var renderedTemplate
      var diff
      var loops = []
      var loopCount
      var loop
      var noteddys = []
      var noteddysMatches
      var noteddysCount
      var i
      var l
      var el
      var localModel
      var errors
      var passes = 0
      var renders
      var render
      var stringyModel
      var renderStringyModel
      var maxPasses = teddy.params.maxPasses
      var maxPassesError = 'Render aborted due to max number of passes (' + maxPasses + ') exceeded; there is a possible infinite loop in your template logic.'
      var tags = []
      var tag
      var src
      var incdoc
      var comments
      var oldTemplate

      // overload console logs
      consoleWarnings = ''
      consoleErrors = ''

      // express.js support
      if (model.settings && model.settings.views) {
        teddy.params.templateRoot = path.resolve(model.settings.views)
      }

      // remove templateRoot from template name if necessary
      if (template.slice(teddy.params.templateRoot.length) === teddy.params.templateRoot) {
        template = template.replace(teddy.params.templateRoot, '')
      }

      // append extension if not present
      // TODO: handle logic differently
      /*
      if (template.slice(-5) !== '.html') {
        template += '.html'
      }
      */

      // return cached template if one exists
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        jsonStringifyCache = []
        stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences)
        teddy.renderedTemplates[template] = teddy.renderedTemplates[template] || []
        renders = teddy.renderedTemplates[template]

        l = renders.length
        for (i = 0; i < l; i++) {
          render = renders[i]
          jsonStringifyCache = []
          renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences)
          if (renderStringyModel === stringyModel) {
            // move to last position in the array to mark it as most recently accessed
            teddy.renderedTemplates[template].push(teddy.renderedTemplates[template].splice(i, 1)[0])
            return render.renderedTemplate
          }
        }
      }

      // compile template if necessary
      if (!teddy.templates[template] || teddy.params.compileAtEveryRender) {
        renderedTemplate = teddy.compile(template)
      }

      renderedTemplate = teddy.templates[template] || renderedTemplate

      // TODO: rewrite method
      // renderedTemplate = removeComments(renderedTemplate)

      // prepare to cache the template if caching is enabled and this template is eligible
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        teddy.renderedTemplates[template] = teddy.renderedTemplates[template] || []
        l = teddy.renderedTemplates[template].length
        if ((teddy.params.templateMaxCaches[template] && l >= teddy.params.templateMaxCaches[template]) || (!teddy.params.templateMaxCaches[template] && l >= teddy.params.defaultCaches)) {
          teddy.renderedTemplates[template].shift()
        }
        l = teddy.renderedTemplates[template].push({
          renderedTemplate: '',
          model: Object.assign({}, model)
        })
      }

      if (!renderedTemplate) {
        if (teddy.params.verbosity) {
          teddy.console.warn('teddy.render attempted to render a template which doesn\'t exist: ' + template)
        }
        return ''
      }

      // NEW LOGIC HERE
      renderedTemplate = scanTemplate([...renderedTemplate], model)

      // clean up temp vars
      contextModels = []

      // if we have no template and we have errors, render an error page
      if (!renderedTemplate && (consoleErrors || consoleWarnings)) {
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

      // parse removed noparse or noteddy includes
      // TODO: remove?
      for (i = 0; i < tags.length; i++) {
        tag = tags[i]
        if (tag) {
          // try for a version of this loop that might have a data model attached to it now
          el = renderedTemplate.match(new RegExp('(?:{' + (i + 1) + '_tag data-local-model=[0-9]*})'))
          if (el && el[0]) {
            el = el[0]
            localModel = el.split(' ')
            localModel = localModel[1].slice(0, -1)
            renderedTemplate = parseIncludes(renderedTemplate, model)
          } else {
            // no data model on it, render it vanilla
            renderedTemplate = replaceNonRegex(renderedTemplate, '{' + (i + 1) + '_tag}', parseIncludeWithFlag(tag))
          }
          tags[i] = null // this prevents parseIncludeWithFlag from attempting to render it again
        }
      }

      // cache the template if caching is enabled and this template is eligible
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        teddy.renderedTemplates[template][l - 1].renderedTemplate = renderedTemplate
      }

      // execute callback if present, otherwise simply return the rendered template string
      if (typeof callback === 'function') {
        if (!errors) {
          callback(null, renderedTemplate)
        } else {
          callback(consoleErrors, renderedTemplate)
        }
      } else {
        return renderedTemplate
      }
    }
  }

  // set params to default values
  teddy.setDefaultParams()

  /**
   * private utility methods
   */

  // Parse <if> <unless> <elseif> <elseunless> <else>
  function parseConditional (statement, type, model) {
    var currentClosingTag = primaryTags['c' + type] // </if> </unless>
    var currentOpenTag = primaryTags[type] // <if> <unless> <elseif> <elseunless>
    var closingElseTag = secondaryTags.celse // </else>
  
    // Primary variables
    var condition =  {
      type: type
    }
    var varList = []
    var conditionList = []
    var bocList = []
    var eocList = []
    var nested = 0
    var teddyVarName = ''
    var teddyVarExpected = ''
    var readingConditional = true // start parsing by reading first <if> statement
    var readMode = false          // start parsing equality condition (ex: <if something='here'>)
  
    // Look for begin/end of conditionals
    for (let i = currentOpenTag.length; i < statement.length; i++) {
      if (readingConditional) {
        if (!readMode && (statement[i] === ' ' || statement[i] === ':')) {
          if (teddyVarName === 'or' || teddyVarName === 'and' || teddyVarName === 'xor' || teddyVarName === 'not') {
            condition.operator = teddyVarName
          } else {
            varList.push({
              name: teddyVarName,
              expected: (teddyVarExpected === '') ? undefined : teddyVarExpected.slice(2, -1)
            })
          }
          teddyVarName = ''
          teddyVarExpected = ''
        }
        else if (statement[i] === '>') {
          // Push teddy var to list of teddy vars
          varList.push({
            name: teddyVarName,
            expected: (teddyVarExpected === '') ? undefined : teddyVarExpected.slice(2, -1)
          })
  
          // push to list of all conditionals
          condition.variables = varList
          conditionList.push(condition)
  
          // Reset important lists
          varList = []
          teddyVarName = ''
          teddyVarExpected = ''
          condition = {
            type: type
          }
          readMode = false
          readingConditional = false
          
          bocList.push([i+1])
          currentOpenTag = secondaryTags['else' + type]
        }
        else {
          // begin reading literal value
          if (statement[i] === '=' && (statement[i+1] === '\'' || statement[i+1] === '"')) {
            readMode = true
          } 
          // stop reading literal value
          else if ((statement[i] === '\'' || statement[i] === '"') && statement[i+1] === ' ') {
            readMode = false
          }
  
          // read teddy var names and values
          if (readMode) {
            teddyVarExpected += statement[i]
          } else {
            if (statement[i] === '"' || statement[i] === "'") {
              teddyVarExpected += statement[i]            
            } else {
              teddyVarName += statement[i]
            }
          }
        }
      }
      // found tag
      else if (statement[i] === '<') {
        // nested <if> or <unless>
        if (twoArraysEqual(statement.slice(i, i + primaryTags.if.length), primaryTags.if) || twoArraysEqual(statement.slice(i, i + primaryTags.unless.length), primaryTags.unless)) {
          nested++
        }
        // Closing <if> tag
        else if (twoArraysEqual(statement.slice(i, i + currentClosingTag.length), currentClosingTag) || (twoArraysEqual(statement.slice(i, i + closingElseTag.length), closingElseTag) && nested > 0)) {
          if (nested > 0) {
            nested--
          }
          else if (eocList.length < 1) {
            eocList.push([i]) // important indices
            currentClosingTag = secondaryTags['celse' + type]
          } else {
            eocList.push([i, i + currentClosingTag.length]) // important indices
          }
        } 
        // Closing <else> tag
        else if (twoArraysEqual(statement.slice(i, i + closingElseTag.length), closingElseTag) && nested < 1) {
          eocList.push([i, i + closingElseTag.length]) // important indices
          break
        }
        // Opening <elseif> or <elseunless> tag
        else if (twoArraysEqual(statement.slice(i, i + currentOpenTag.length), currentOpenTag) && nested < 1) {
          readingConditional = true
          i += currentOpenTag.length -1
        } 
        // Opening <else> tag
        else if (twoArraysEqual(statement.slice(i, i + secondaryTags.else.length), secondaryTags.else) && nested < 1) {
          bocList.push([i + secondaryTags.else.length]) // important indices
        }
      }
    }

    // Evaluate conditionals
    for (let i = 0; i < conditionList.length; i++) {
      if (evaluateCondition(conditionList[i], model)) {
        if (eocList.length === 1) {
          return [...statement.slice(bocList[0][0], eocList[0][0]), ...statement.slice(eocList[0][0]+primaryTags['c' + type].length)]
        } else {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        }
      }
    }
  
    if (eocList.length === 1) {
      return [...statement.slice(eocList[0][0]+primaryTags['c' + type].length)]
    } else {
      return [...statement.slice(bocList[bocList.length-1][0], eocList[eocList.length-1][0]), ...statement.slice(eocList[eocList.length-1][1])]
    }
  }

  // Goes through condition logic and returns true/false
  function evaluateCondition(condition, model) {
    switch (condition.operator) {
      case 'or':  // <if something or somethingElse>
        if (condition.variables[0].expected && condition.variables[1].expected) { // Two conditions compare against literal values
          if (model[condition.variables[0].name] === condition.variables[0].expected || model[condition.variables[1].name] === condition.variables[1].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else if (condition.variables[0].expected) { // One condition needs to be compared to a literal value
          if (model[condition.variables[0].name] === condition.variables[0].expected || model[condition.variables[1].name]) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else if (condition.variables[1].expected) { // One condition needs to be compared to a literal value
          if (model[condition.variables[0].name] || model[condition.variables[1].name] === condition.variables[1].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else { // No conditions need to be compared to a literal value
          if (model[condition.variables[0].name] || model[condition.variables[1].name]) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        }
      case 'and': // <if something and somethingElse>
        if (condition.variables[0].expected && condition.variables[1].expected) { // Two conditions compare against literal values
          if (model[condition.variables[0].name] === condition.variables[0].expected && model[condition.variables[1].name] === condition.variables[1].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else if (condition.variables[0].expected) { // One condition needs to be compared to a literal value
          if (model[condition.variables[0].name] === condition.variables[0].expected && model[condition.variables[1].name]) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else if (condition.variables[1].expected) { // One condition needs to be compared to a literal value
          if (model[condition.variables[0].name] && model[condition.variables[1].name] === condition.variables[1].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else { // No conditions need to be compared to a literal value
          if (model[condition.variables[0].name] && model[condition.variables[1].name]) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        }
      case 'xor': // <if something xor somethingElse>
        if (condition.variables[0].expected && condition.variables[1].expected) { // Two conditions compare against literal values
          if (model[condition.variables[0].name] === condition.variables[0].expected) {
            return (condition.type === 'if') ? true : false
          } else if (model[condition.variables[1].name] === condition.variables[1].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else if (condition.variables[0].expected) { // One condition needs to be compared to a literal value
          if (model[condition.variables[0].name] === condition.variables[0].expected) {
            return (condition.type === 'if') ? true : false
          } else if (isTruthy(model[condition.variables[1].name])) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else if (condition.variables[1].expected) { // One condition needs to be compared to a literal value
          if (isTruthy(model[condition.variables[0].name])) {
            return (condition.type === 'if') ? true : false
          } else if (model[condition.variables[1].name] === condition.variables[1].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        } else { // No conditions need to be compared to a literal value
          if (isTruthy(model[condition.variables[0].name]) && isTruthy(model[condition.variables[1].name])) {
            return (condition.type === 'if') ? false : true
          } else if (isTruthy(model[condition.variables[0].name])) {
            return (condition.type === 'if') ? true : false            
          } else if (isTruthy(model[condition.variables[1].name])) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        }
      case 'not': // <if not:something>
        if (isTruthy(model[condition.variables[0].name])) {
          return (condition.type === 'if') ? false : true
        } else {
          return (condition.type === 'if') ? true : false
        }
      default:    // <if something>
        if (condition.variables[0].expected) {
          if (model[condition.variables[0].name] === condition.variables[0].expected) {
            return (condition.type === 'if') ? true : false
          } else {
            return (condition.type === 'if') ? false : true
          }
        }
        else if (isTruthy(model[condition.variables[0].name])) {
          return (condition.type === 'if') ? true : false
        } else {
          return (condition.type === 'if') ? false : true
        }
    }
  }

  // Get truthyness of a value 
  function isTruthy(myVar) {
    if (typeof myVar === 'object') {
      if (myVar === null) {
        return !!myVar
      } else {
        return !!myVar.length
      }
    } else if (typeof myVar === 'boolean') {
      return true
    } else {
      return !!myVar
    }
  }

  // Parse <loop> 
  function parseLoop (statement, model) {
    var nested = 0
    var params = {}
    var teddyName = ''
    var slicedStatement
    var statementCopy
    var modifiedStatement = ''
    var endOfStatement
    var sov
    var itValues
    var itKeys
    var itTeddy
    var periodIndex
    var teddyRead = false
    var teddyString = ''
    var context 
    var isNested = false 
    var containsTag = false
    var containsComment = false
    var parsedContents = false
    var sol // start of loop
    var eol // end of loop


    // Read <loop> inner contents 
    for (let i = primaryTags.loop.length; i < statement.length; i++) {
      if (statement[i] === ' ' && teddyName.length > 6) {
        if (teddyName[0] === 't') {
          params.through = teddyName.slice(9, teddyName.length-1) // params.through
        } else { // key/val
          params[teddyName.slice(0, 3)] = teddyName.slice(5, teddyName.length-1) // params.key || params.val
        }
        teddyName = ''
      }
      else if (statement[i] === '>' && teddyName.length > 6) {
        sol = i + 1
        params[teddyName.slice(0, 3)] = teddyName.slice(5, teddyName.length-1) // params.key || params.val
        teddyName = ''
      }
      else if (statement[i] === '<') {
        if (twoArraysEqual(statement.slice(i, i + primaryTags.loop.length), primaryTags.loop)) {
          nested++
          isNested = true
        } else if (twoArraysEqual(statement.slice(i, i + primaryTags.cloop.length), primaryTags.cloop)) {
          if (nested > 0) {
            nested--
          } else {
            eol = i
            break
          }
        } else if (twoArraysEqual(statement.slice(i, i + primaryTags.if.length), primaryTags.if)) {
          containsTag = true
        } else if (twoArraysEqual(statement.slice(i, i + primaryTags.unless.length), primaryTags.unless)) {
          containsTag = true
        } else if (twoArraysEqual(statement.slice(i, i + primaryTags.include.length), primaryTags.include)) {
          containsTag = true
        } else if (statement.slice(i, i+24).join('').includes(' if-')) {
          containsTag = true
        }
      } 
      else {
        if (Object.keys(params).length < 3 && !Object.keys(params).includes('val')) {
          teddyName += statement[i]
        }
      }
    }

    // Get content inside of loop and make a copy of it
    endOfStatement = statement.slice(eol+primaryTags.cloop.length)
    slicedStatement = statement.slice(sol, eol)
    statementCopy = slicedStatement

    // Get object values/keys
    if (params.through) {
      periodIndex = params.through.indexOf('.')

      // <loop through='list' key='index' val='value'>
      if (periodIndex < 0) {
        itTeddy = model[params.through]
      } else {
        // Nested loop that requires context
        if (model[params.through.slice(0, periodIndex)] === undefined) {
          context = findContext(contextModels, params.through)
          itTeddy = model[context.slice(0, context.indexOf('['))][context.slice(context.indexOf('[')+1, context.length-1)][params.through.slice(periodIndex+1)]
        } else { // Loop whose through param is an object
          itTeddy = model[params.through.slice(0, periodIndex)][params.through.slice(periodIndex+1)]
        }
      }

      // Get relevant teddy keys/values
      if (itTeddy) {
        itKeys = Object.keys(itTeddy)
        itValues = Object.values(itTeddy)
      }
    }
    
    if (itValues && params.val) {
      for (let i = 0; i < itValues.length; i++) {
        for (let j = 0; j < slicedStatement.length; j++) {
          // Reading a Teddy Variable in template
          if (teddyRead) {
            if (slicedStatement[j] === '}') {
              // Is the Teddy parameter a value, key, or an object attribute
              if (teddyName === params.val) {
                teddyString = `${itValues[i]}`
              } else if (teddyName === params.key) {
                teddyString = `${itKeys[i]}`
              } else if (teddyName.indexOf('.') >= 0 && (teddyName.slice(0, teddyName.indexOf('.')) === params.val)) {
                teddyString = `${itValues[i][teddyName.slice(teddyName.indexOf('.')+1)]}`
              }
              // Replace Teddy var name with actual value
              if (teddyString !== '' && teddyString !== 'undefined') {
                slicedStatement = insertValue(slicedStatement, teddyString, sov, j+1)

                // Recalibrate iterator based on length of inserted value (if necessary)
                if (teddyString.length < teddyName.length) {
                  j -= (teddyName.length - teddyString.length)
                }
              }

              // Reset reading variables
              teddyRead = false
              teddyName = ''
              teddyString = ''
            } else {
              teddyName += slicedStatement[j]
            }
          }
          else if (slicedStatement[j] === '{' && slicedStatement[j+1] !== '!') {
            sov = j
            teddyRead = true
          } else if (slicedStatement[j] === '{' && slicedStatement[j+1] === '!') {
            containsComment = true
          }
        }
      
        // Join parsed templates together
        if (containsTag) {
          slicedStatement = scanTemplate(slicedStatement, model)
          modifiedStatement += slicedStatement
          parsedContents = true
        } else {
          modifiedStatement += slicedStatement.join('')
        }

        
        // Reset template back to a copy
        slicedStatement = statementCopy

        // Save context if template contains a nested loop
        if (isNested) {
          contextModels.push([params.val, `${params.through}[${i}]`])
        }
      }
    } else {
      // Could not parse Teddy loop tag
      return [...statement.slice(eol + primaryTags.cloop.length)]
    }

    if (modifiedStatement.length > 49999 && endOfStatement.length <= 1 && (parsedContents || (!containsTag && !containsComment))) {
      endParse = true
    }

    // Return template with loop parsed
    return [...modifiedStatement, ...endOfStatement]
  }

  // Parse <include>
  function parseInclude (statement, model) {
    let inArg = false
    let readingVar = false
    let inComment = false
    let srcName = ''
    let teddyVarName = ''
    let includeTemplate
    let startInclude
    let endInclude
    let startIndex
    let readingSrc = false
    let noTeddyFlag = false
    let noParseFlag = false
    let teddyAttribute

    // 
    let includeArgs = []
    let includeArg = {
      name: '',
      value: '',
      start: 0,
      end: 0
    }

    // Get HTML source from include tag
    for (let i = primaryTags.include.length; i < statement.length; i++) {
      teddyAttribute = statement.slice(i, i + 7).join('')
      if (statement[i] === '=' && (statement[i+1] === '"' || statement[i+1] === "'")) {
        readingSrc = true
      }
      else if (statement[i] === '>') {
        startInclude = i + 1
        break
      } 
      else if (readingSrc) {
        if (statement[i] === ' ') {
          readingSrc = false
        } else {
          srcName += statement[i]
        }
      }
      // noparse or noteddy attributes
      else if (teddyAttribute === 'noteddy') {
        noTeddyFlag = true
      } else if (teddyAttribute === 'noparse') {
        noParseFlag = true
      }
    }

    srcName = srcName.slice(1, -1)

    // check if dynamic src name
    if (srcName[0] === '{') {
      srcName = model[srcName.slice(1, -1)]
    } else if (srcName.slice(-5) !== '.html') {
      srcName += '.html'
    }

    includeTemplate = [...teddy.compile(srcName)]

    // Read contents of <include> tag
    for (let i = startInclude; i < statement.length; i++) {
      if (inArg) {
        // Get include argument value
        if (includeArg.start > 0) {
          if (statement[i] === '<' && twoArraysEqual(statement.slice(i, i + primaryTags.carg.length), primaryTags.carg)) {
            includeArg.end = i
            includeArgs.push(includeArg)

            // reset
            inArg = false
            includeArg = {
              name: '',
              value: '',
              start: 0,
              end: 0
            }
          } else {
            includeArg.value += statement[i]
          }
        }
        // Get include argument name
        else if (statement[i] === '>') {
          includeArg.start = i + 1
        } else {
          includeArg.name += statement[i]
        }
      }
      // Check if we hit a teddy <arg> tag
      else if (statement[i] === '<' && twoArraysEqual(statement.slice(i, i + primaryTags.arg.length), primaryTags.arg)) {
        inArg = true
        i += 4
      }
      else if (statement[i] === '<' && statement[i + 1] === '/' && twoArraysEqual(statement.slice(i, i + primaryTags.cinclude.length), primaryTags.cinclude)) {
        endInclude = i + primaryTags.cinclude.length
        break
      }
    }

    // Read contents of include src template
    for (let i = 0; i < includeTemplate.length; i++) {
      if (inComment) {
        if (includeTemplate[i] === '!' && includeTemplate[i+1] === '}') {
          inComment = false
        }
      }
      else if (readingVar) {
        if (includeTemplate[i] === '}') {
          readingVar = false
          // find appropriate arg value
          for (let j = 0; j < includeArgs.length; j++) {
            if (teddyVarName === includeArgs[j].name) {
              includeTemplate = insertValue(includeTemplate, includeArgs[j].value, startIndex, i+1)
            }
          }
        } else {
          teddyVarName += includeTemplate[i]
        }
      }
      else if (includeTemplate[i] === '{') {
        if (includeTemplate[i+1] === '!') {
          inComment = true
        } else {
          startIndex = i
          readingVar = true
        }
      }
    }
    includeTemplate.unshift(' ')
    return insertValue(statement, includeTemplate, 0, endInclude+1)
  }

  // Parse <tag if-something>
  function parseOneLineIf(statement, model) {
    let readingName = false
    let readingLiteral = false
    let readingConditions = false
    let startIndex
    let endIndex
    let conditionText = ''
    let condition = {
      varName: '',
      varLiteral: '',
      true: '',
      false: ''
    }
    for (let i = 0; i < statement.length; i++) {
      // Get teddy var name
      if (readingName) {
        if (statement[i] === ' ') {
          readingConditions = true
          readingName = false
        } else if (statement[i] === '=') {
          readingLiteral = true
          readingName = false
        } else {
          condition.varName += statement[i]
        }
      } else if (readingLiteral) {
        if (statement[i] === ' ' || statement[i] === '\n' && (statement[i-1] === '"' || statement[i-1] === "'")) {
          readingConditions = true
          readingLiteral = false
          condition.varLiteral = condition.varLiteral.slice(1, -1)
        } else {
          condition.varLiteral += statement[i]
        }
      } else if (readingConditions) {
        // Get first condition
        if (statement[i] === ' ' || statement[i] === '\n') {
          if (conditionText[0] === 't') {
            condition.true = conditionText.slice(6, -1)
          } else {
            condition.false = conditionText.slice(7, -1)
          }
          conditionText = ''
        }
        // Get second condition
        else if (statement[i] === '>' || (statement[i] === '/' && statement[i+1] === '>')) {
          if (conditionText[0] === 't') {
            condition.true = conditionText.slice(6, -1)
          } else {
            condition.false = conditionText.slice(7, -1)
          }
          conditionText = ''
          endIndex = i
          break
        } else {
          conditionText += statement[i]
        }
      }
      else if (statement[i] === ' ') {
        startIndex = i + 1
      }
      else if (statement[i] === '-') {
        readingName = true
      }
    }

    // Evaluate condition to true or false
    if (condition.varLiteral.length > 0) {
      if (model[condition.varName] === condition.varLiteral) {
        return insertValue(statement, condition.true, startIndex, endIndex)
      } else {
        // ISSUE HERE
        return insertValue(statement, condition.false, startIndex, endIndex)      
      }
    } else {
      // if var is present in model
      if (model[condition.varName]) {
        return insertValue(statement, condition.true, startIndex, endIndex)
      } else {
        return insertValue(statement, condition.false, startIndex, endIndex)      
      }
    }
  }

  // Get inner content of <noteddy> tag without parsing teddy contents
  function parseNoTeddy(statement) {
    for (let i = 0; i < statement.length; i++) {
      if (twoArraysEqual(statement.slice(i, i + primaryTags.cnoteddy.length), primaryTags.cnoteddy)) {
        return [...statement.slice(primaryTags.noteddy.length, i), ...statement.slice(i + primaryTags.cnoteddy.length)]
      }
    }
  
    return statement
  }

  // Returns teddy primary tag name
  function detectTeddyPrimaryTag (charList, tags) {
    let type = 'unknown'
    let keys = Object.keys(tags)
    let currentTag

    // check through teddy primary tags
    for (let i = 0; i < keys.length; i++) {
      currentTag = tags[keys[i]]
      if (twoArraysEqual(currentTag, charList.slice(0, currentTag.length))) {
        if (keys[i].indexOf('Invalid') > -1) {
          type = keys[i].slice(0, keys[i].indexOf('Invalid'))
        } else {
          type = keys[i]
        }
        return type
      } 
    }

    // check if it is a one-line if statement
    for (let i = 0; i < charList.length; i++) {
      if (twoArraysEqual(charList.slice(i, i + 3), ['i', 'f', '-'])) {
        return 'one-line-if'
      }
    }

    return type
  }

  // Returns true if two arrays are equal
  function twoArraysEqual(a1, a2) {
    // Check if the arrays are the same length
    if (a1.length !== a2.length) return false
    
    // Check if all items exist and are in the same order
    for (var i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) return false
    }

    return true
  }

  // Returns a list of characters with teddy var names replaced with actual values
  function insertValue(str, val, start, end) {
    // String before value + new value + String after value
    return [...str.slice(0, start), ...val, ...str.slice(end)]
  }

  // Finds correct context for a nested loop
  function findContext(models, str) {
    let current = models.shift()

    if (str.indexOf(current[0]) > -1) {
      return current[1]
    }

    return false
  }

  // Removes comment from teddy template
  function removeTeddyComment (myTemplate) {
    let teddyComment = ''

    for (let i = 2; i < myTemplate.length; i++) {
      if (myTemplate[i] === '!' && myTemplate[i + 1] === '}') {
        return myTemplate.slice(teddyComment.length + 4, myTemplate.length)
      } else {
        teddyComment += myTemplate[i]
      }
    }

    return myTemplate
  }

  // Handles calls to variables in the model
  function insertTeddyVariable(myTemplate, myModel) {
    let varName = ''

    for (let i = 1; i < myTemplate.length; i++) {
      if (myTemplate[i] === '}') {
        if (myModel[varName]) {
          return insertValue(myTemplate, `${myModel[varName]}`, 0, i+1)
        } else {
          return myTemplate
        }
      } else {
        varName += myTemplate[i]
      }
    }
  }

  function isAnotherOpeningTag(a1, a2) {
    a1.pop()
    return twoArraysEqual(a1, a2)
  }

  function isClosingTag(a1, a2) {
    return twoArraysEqual(a1, a2)
  }

  function twoArraysEqual(a1, a2) {
    var a1l = a1.length
    var i
    for (i = 0; i < a1l; i++) {
      if (a1[i] !== a2[i]) {
        return false
      }
    }
    return true
  }
  // NEW LOGIC ENDS
  // TODO: finish

  // gets nested object by string
  function getNestedObjectByString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
    s = s.replace(/^\./, '') // strip leading dot
    var a = s.split('.')
    var n

    while (a.length) {
      n = a.shift()
      if (n in o) {
        o = o[n]
      } else {
        return
      }
    }
    return o
  }

  // get all attributes of an element
  function getAttributes(el) {
    var attributes = el.split('>')
    attributes = attributes[0]
    attributes = attributes.substring(attributes.indexOf(' '))
    attributes = attributes.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
    return attributes
  }

  // get a specific attribute from a given element
  function getAttribute(el, attr) {
    var i, l, a, match

    if (attr === 'data-local-model') {
      el = el.split('data-local-model=')
      if (el[1]) {
        el = el[1]
        el = el.split('>')
        el = el[0]
        el = el.split(' ')
        el = el[0]
        return el
      } else {
        return false
      }
    }

    match = el.match(new RegExp(attr.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '=(\\\'.*?\\\'|\\".*?\\")'))

    if (!match) {
      return false
    }

    l = match.length
    for (i = 0; i < l; i++) {
      a = match[i]
      if (a && typeof a === 'string') {
        a = a.trim()
        if (a.substring(0, attr.length) === attr) {
          // got a match
          break
        }
      }
    }
    a = a.substring(attr.length + 2).slice(0, -1)
    return a
  }

  // get a specific attribute from a given element
  function removeAttribute(el, attr) {
    attr = attr.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
    var newEl = el.replace(new RegExp('(?: (?:' + attr + '(?: |>))| (?:' + attr + '=)(?:("(.*?)")|(\'(.*?)\'))($|(?=[\\s >/])))'), '')
    return newEl
  }

  // gets children of a given element
  function getInnerHTML(el) {
    el = el.trim()

    var nodeName = getNodeName(el)
    el = el.replace(new RegExp('<' + nodeName.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '(?:>| [\\S\\s]*?>)'), '')
    el = el.substring(0, el.lastIndexOf('</' + nodeName + '>'))
    return el.trim()
  }

  // get an element's node name
  function getNodeName(el) {
    var nodeName = el.split(' ')
    nodeName = nodeName[0]
    nodeName = nodeName.split('>')
    nodeName = nodeName[0]
    nodeName = nodeName.substring(1, nodeName.length)
    return nodeName
  }

  function escapeHtmlEntities(v) {
    if (v && typeof v === 'string') {
      return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#34;').replace(/'/g, '&#39;')
    } else {
      return v
    }
  }

  function replaceNonRegex(str, find, replace) {
    if (typeof str === 'string') {
      return str.split(find).join(replace)
    } else {
      teddy.console.error('teddy: replaceNonRegex passed invalid arguments.')
    }
  }

  function jsonStringifyRemoveCircularReferences(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (jsonStringifyCache.indexOf(value) !== -1) {
        // circular reference found, discard key
        return
      }
      jsonStringifyCache.push(value)
    }
    return value
  }

  // Scan template file
  function scanTemplate(templateArray, model) {
    var passes = 0
    var maxPasses = teddy.params.maxPasses
    var maxPassesError = 'Render aborted due to max number of passes (' + maxPasses + ') exceeded; there is a possible infinite loop in your template logic.'
    var renderedTemplate = ''
    var renderedTemplateLength

    while (templateArray[0]) {
      if (!endParse) {
        // Return an error if in infinite loop
        if (passes >= maxPasses) {
          return maxPassesError
        }

        switch (templateArray[0]) {
          case '{': // Detects teddy curly bracket (comment or variable)
            if (templateArray[1] === '!') {
              templateArray = removeTeddyComment(templateArray)
            } else if (templateArray[1] === '|') { // Other logic

            } else {
              templateArray = insertTeddyVariable(templateArray, model)
            }
            break
          case '<': // Teddy/HTML tag
            if (templateArray[1] === '/') {
            } else {
              let primaryTag = detectTeddyPrimaryTag(templateArray, primaryTags)
              switch (primaryTag) {
                case 'if':
                case 'unless':
                  templateArray = parseConditional(templateArray, primaryTag, model)
                  break
                case 'include':
                  renderedTemplateLength = templateArray.length
                  templateArray = parseInclude(templateArray, model)
                  if (templateArray.length > renderedTemplateLength) {
                    passes++
                  }
                  break
                case 'loop':
                  templateArray = parseLoop(templateArray, model)
                  break
                case 'one-line-if':
                  templateArray = parseOneLineIf(templateArray, model)
                  break
                case 'noteddy':
                  templateArray = parseNoTeddy(templateArray)
                  break
              }
            }
            break
        }

        // Remove extra whitespace
        if ((templateArray[0] === ' ' || templateArray[0] === '\n') && (templateArray[1] === ' ' || templateArray[1] === '\n' || (templateArray[1] === '<' && templateArray[2] !== ' ') || (templateArray[1] === '{' && templateArray[2] === '!'))) {
          while (templateArray[0] === ' ' || templateArray[0] === '\n') {
            if (templateArray[1] === '}' && renderedTemplate[renderedTemplate.length-1] !== ' ') {
              renderedTemplate += ' '
            }
            templateArray.shift()
          }
        } else {
          renderedTemplate += templateArray[0]

          // add an extra space for js within html template
          if ((templateArray[0] === '{' || templateArray[0] === ';') && templateArray[1] === '\n') {
            renderedTemplate += ' '
          } 
          templateArray.shift()
        }
      } else {
        renderedTemplate = templateArray.join('')
        endParse = false
        break
      }
    }

    // return parsed html file
    return renderedTemplate
  }

  // expose as a CommonJS module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = teddy // makes teddy requirable in server-side JS
    module.exports.__express = teddy.render // express.js support

    if (require) {
      // server-side module dependencies
      fs = require('fs')
      path = require('path')
    }
  }

  // set env specific vars for client-side
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    global.teddy = teddy

    // IE does not populate console unless the developer tools are opened
    if (typeof console === 'undefined') {
      window.console = {}
      console.log = console.warn = console.error = function () { }
    }

    // Object.assign polyfill
    if (typeof Object.assign !== 'function') {
      Object.assign = function (target, varArgs) { // .length of function is 2
        var i,
          l,
          to,
          nextSource,
          nextKey

        if (target === null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object')
        }

        to = Object(target)

        l = arguments.length
        for (i = 1; i < l; i++) {
          nextSource = arguments[i]

          if (nextSource !== null) { // skip over if undefined or null
            for (nextKey in nextSource) {
              // avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey]
              }
            }
          }
        }
        return to
      }
    }
  }
})(this)
