(function (global) {
  var teddy // @namespace

  // private utility vars
  var consoleWarnings // used to overload console.warn for the server-side error gui
  var consoleErrors // used to overload console.error for the server-side error gui
  var fs // server-side filesystem module
  var path // server-side utility for manipulating file paths
  var contextModels = [] // stores local models for later consumption by template logic tags
  var jsonStringifyCache
  var endParse = false // Stops rendering if necessary
  var currentContext
  var passes

  // List of all primary teddy tags
  var primaryTags = {
    include: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', ' '].reverse(),
    arg: ['<', 'a', 'r', 'g', ' '].reverse(),
    if: ['<', 'i', 'f', ' '].reverse(),
    loop: ['<', 'l', 'o', 'o', 'p', ' '].reverse(),
    olif: ['i', 'f', '-'].reverse(),
    unless: ['<', 'u', 'n', 'l', 'e', 's', 's', ' '].reverse(),
    noteddy: ['<', 'n', 'o', 't', 'e', 'd', 'd', 'y', '>'].reverse(),
    argInvalid: ['<', 'a', 'r', 'g', '>'].reverse(),
    includeInvalid: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', '>'].reverse(),
    ifInvalid: ['<', 'i', 'f', '>'].reverse(),
    loopInvalid: ['<', 'l', 'o', 'o', 'p', '>'].reverse(),
    unlessInvalid: ['<', 'u', 'n', 'l', 'e', 's', 's', '>'].reverse(),
    carg: ['<', '/', 'a', 'r', 'g'].reverse(),
    cinclude: ['<', '/', 'i', 'n', 'c', 'l', 'u', 'd', 'e'].reverse(),
    cif: ['<', '/', 'i', 'f'].reverse(),
    cloop: ['<', '/', 'l', 'o', 'o', 'p'].reverse(),
    cunless: ['<', '/', 'u', 'n', 'l', 'e', 's', 's'].reverse(),
    cnoteddy: ['<', '/', 'n', 'o', 't', 'e', 'd', 'd', 'y'].reverse()
  }

  // List of all secondary tags for teddy conditionals
  var secondaryTags = {
    elseif: ['<', 'e', 'l', 's', 'e', 'i', 'f', ' '].reverse(),
    else: ['<', 'e', 'l', 's', 'e', '>'].reverse(),
    elseunless: ['<', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', ' '].reverse(),
    celseif: ['<', '/', 'e', 'l', 's', 'e', 'i', 'f'].reverse(),
    celse: ['<', '/', 'e', 'l', 's', 'e'].reverse(),
    celseunless: ['<', '/', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's'].reverse()
  }

  var tagLengths = {
    if: 4,
    cif: 4,
    elseif: 8,
    celseif: 8,
    else: 6,
    celse: 6,
    unless: 8,
    cunless: 8,
    elseunless: 12,
    celseunless: 12,
    loop: 6,
    cloop: 6,
    include: 9,
    cinclude: 9,
    arg: 5,
    carg: 5,
    noteddy: 9,
    cnoteddy: 9
  }

  // HTML entities to escape
  var escapeHtmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&#34;',
    "'": '&#39;'
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
        if (!teddy.warnings.includes(value)) {
          console.warn(value)
          teddy.warnings.push(value)
          consoleWarnings += '<li>' + escapeEntities(value) + '</li>'
        }
      },
      error: function (value) {
        if (!teddy.errors.includes(value)) {
          console.error(value)
          teddy.errors.push(value)
          consoleErrors += '<li>' + escapeEntities(value) + '</li>'
        }
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

      // append extension if not present
      if (template.slice(-5) !== '.html') {
        template += '.html'
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
      passes = 0

      // ensure template is a string
      if (typeof template !== 'string') {
        if (teddy.params.verbosity > 1) {
          teddy.console.warn('teddy.render attempted to render a template which is not a string.')
        }
        return ''
      }

      // declare vars
      var renderedTemplate
      var i
      var l
      var renders
      var render
      var stringyModel
      var renderStringyModel
      var errorMessage

      // overload console logs
      consoleWarnings = ''
      consoleErrors = ''

      // reset errors and warnings
      teddy.errors = []
      teddy.warnings = []

      // express.js support
      if (model.settings && model.settings.views) {
        teddy.params.templateRoot = path.resolve(model.settings.views)
      }

      // remove templateRoot from template name if necessary
      if (template.slice(teddy.params.templateRoot.length) === teddy.params.templateRoot) {
        template = template.replace(teddy.params.templateRoot, '')
      }

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

      // clean up temp vars
      contextModels = []
      currentContext = []

      // Parse template
      renderedTemplate = scanTemplate([...renderedTemplate].reverse(), model)

      // if we have no template and we have errors, render an error page
      if (teddy.errors.includes(renderedTemplate) && (consoleErrors || consoleWarnings)) {
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
      if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
        teddy.renderedTemplates[template][l - 1].renderedTemplate = renderedTemplate
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
  }

  // set params to default values
  teddy.setDefaultParams()

  /**
   * private utility methods
   */

  // Scan template file and return a usable HTML document
  function scanTemplate (charList, model, escapeOverride) {
    var maxPasses = teddy.params.maxPasses
    var maxPassesError = 'Render aborted due to max number of passes (' + maxPasses + ') exceeded; there is a possible infinite loop in your template logic.'
    var renderedTemplate = ''

    while (charList[0]) {
      if (!endParse) {
        // Return an error if in infinite loop
        if (passes >= maxPasses) {
          if (teddy.params.verbosity) {
            teddy.console.error(maxPassesError)
          }
          return maxPassesError
        }

        switch (charList[charList.length - 1]) {
          case '{': // Detects teddy curly bracket (comment or variable)
            if (charList[charList.length - 2] === '!') { // Teddy comment
              charList = removeTeddyComment(charList)
            } else if (charList[charList.length - 2] === '~') { // Internal notation for a noteddy block of text
              [charList, renderedTemplate] = noParseTeddyVariable(charList, renderedTemplate)
            } else if (charList[charList.length - 2] === ' ' || charList[charList.length - 2] === '\n') { // Plain text curly bracket
            } else { // Replace teddy {variable} with its value in the model
              charList = getValueAndReplace(charList, model, escapeOverride)
            }
            break
          case '<': // Teddy/HTML tag
            if (charList[charList.length - 2] === '/') { // Closing template tag
            } else {
              // Find out if the tag we hit is a teddy tag
              const primaryTag = findTeddyTag(charList, primaryTags)
              switch (primaryTag) {
                case 'if':
                case 'unless':
                  charList = parseConditional(charList, primaryTag, model)
                  continue
                case 'include':
                  charList = parseInclude(charList, model)
                  passes++
                  continue
                case 'loop':
                  charList = parseLoop(charList, model)
                  continue
                case 'one-line-if':
                  charList = parseOneLineIf(charList, model)

                  // Evaluate again when multiple oneline-ifs
                  while (findTeddyTag(charList, primaryTags) === 'one-line-if') {
                    charList = parseOneLineIf(charList, model)
                  }
                  break
                case 'noteddy':
                  charList = parseNoTeddy(charList)
                  break
                case 'arg': // orphaned arg
                  while (charList[charList.length - 1]) {
                    if (charList[charList.length - 1] === '<' && charList[charList.length - 2] === '/') { // closing tag
                      if (validEndingTag(charList, charList.length - 1) && twoArraysEqual(charList.slice(charList.length - tagLengths.carg, charList.length), primaryTags.carg)) {
                        const endOfClosingTag = charList.lastIndexOf('>')
                        for (let i = charList.length - 1; i >= endOfClosingTag; i--) {
                          charList.pop()
                        }
                        break
                      }
                    }
                    charList.pop()
                  }
                  continue
              }
            }
            break
        }

        if (charList[0]) {
          renderedTemplate += charList[charList.length - 1]

          // add an extra space for js within html template
          if ((charList[charList.length - 1] === '{' || charList[charList.length - 1] === ';') && charList[charList.length - 2] === '\n') {
            renderedTemplate += ' '
          }
          charList.pop()
        }
      } else { // Stop parsing and return if endParse flag is true
        renderedTemplate = charList.join('')
        endParse = false
        break
      }
    }

    // Return our rendered HTML file
    return renderedTemplate
  }

  // Parse conditional teddy tags (i.e <if> <unless> <elseif> <elseunless> <else>)
  function parseConditional (charList, type, model) {
    var i // Template index
    var j // Comment index
    var l = charList.length // Length of template array

    var currentChar // Current character in our template array
    var tagStart = l - 1 // Index of '<' for the beginning of our conditional
    var readingConditional = true // Start parsing contents of <if> <elseif> <unless> <elseunless> tags
    var readMode = false // Start parsing literal equality condition (ex: <if something='here'>)
    var outsideTags = false // Flag telling us we are inbetween condition tags
    var isNested = false // Extra check for whether or not the nested condition also has an <else>
    var nested = 0 // Keeps track of how many nested conditionals are present
    var teddyVarName = '' // Teddy conditional argument name or operator used (i.e: or, and, xor, not)
    var teddyVarExpected = '' // Literal value for a conditional teddy argument (i.e: <if something='some content'>)
    var condition = {
      type: type // <if> <unless>
    }

    var boc = [] // Array of 2-length lists that contain the relevant indices for an open conditional tag [<, >]
    var eoc = [] // Array of 2-length lists that contain the relevant indices for a closing conditionaltag [<, >]
    var conditions = [] // List of objects containing all operators, variables and type of conditional (if or unless)
    var varList = [] // List of objects containing relevant information about our conditions arguments
    var operators = [] // List of operators used in a single conditional statement
    var commentList = [] // Array of 2-length lists that contain the start/end indices for template comments inbetween conditionals
    var commentIndices = [] // 2-length list containing start/end indices for template comments inbetween conditionals

    var currentOpenTag = primaryTags[type] // <if> <unless> <elseif> <elseunless>

    // Look for begin/end of conditionals
    for (i = l - currentOpenTag.length - 1; i >= 0; i--) {
      currentChar = charList[i]
      if (readingConditional) { // Read conditional for teddy variables and logical operators
        if (!readMode && (currentChar === ' ' || currentChar === ':')) { // Stop reading teddyVarName when we hit whitespace
          if (teddyVarName === 'or' || teddyVarName === 'and' || teddyVarName === 'xor' || teddyVarName === 'not') { // teddyVarName is a logical operator
            operators.push(teddyVarName)
          } else if (teddyVarName.trim() !== '') { // teddyVarName is an actual teddy variable
            teddyVarName = teddyVarName.trim() // clean up whitespace
            varList.push({
              name: teddyVarName,
              value: getTeddyVal(teddyVarName, model),
              expected: (teddyVarExpected === '') ? false : teddyVarExpected.slice(2, -1)
            })
          }
          // Reset relevant string variables
          teddyVarName = ''
          teddyVarExpected = ''
        } else if (currentChar === '>') { // Hit closing angle bracket for condition tag
          varList.push({
            name: teddyVarName,
            value: getTeddyVal(teddyVarName, model),
            expected: (teddyVarExpected === '') ? false : teddyVarExpected.slice(2, -1)
          })

          // Add relevant variable and operator information to condition object
          condition.variables = varList
          condition.operators = operators

          // Push condition to list of conditions
          conditions.push(condition)

          // Push [start, end] indices of opening <if> to a list
          boc.push([tagStart, i])

          // Reset relevant variables
          varList = []
          operators = []
          teddyVarName = ''
          teddyVarExpected = ''
          condition = {
            type: type
          }
          readMode = false
          readingConditional = false
        } else { // Reading conditional arguments
          if (currentChar === '=' && (charList[i - 1] === '\'' || charList[i - 1] === '"')) { // Start reading literal value to compare against
            readMode = true
          } else if ((currentChar === '\'' || currentChar === '"') && charList[i - 1] === ' ') { // Stop reading literal value to compare against
            readMode = false
          }

          // Get teddy variable name or logical operator from template
          if (readMode) {
            teddyVarExpected += currentChar
          } else { // Get teddy variable name or logical operator from template
            if (currentChar === '"' || currentChar === "'") { // Get literal value to compare teddy value against
              teddyVarExpected += currentChar
            } else { // Get teddy variable name
              teddyVarName += currentChar
            }
          }
        }
      } else if (outsideTags) { // Currently inbetween teddy tags (i.e: <if></if>right here<elseif></elseif>or here<else></else>)
        if (currentChar === '-' && charList[i - 1] === '>') { // Hit end of HTML comment
          if (commentList.length > 0 && Math.abs(commentList[commentList.length - 1][1] - commentIndices[0]) < 10) { // Executes if there is more than one comment to keep track of
            commentList[commentList.length - 1][1] = i - 1
          } else { // Get ending index of HTML comment
            commentIndices.push(i - 1)
            commentList.push(commentIndices)
          }

          // Reset relevant variables
          commentIndices = []
          outsideTags = false
        }
      } else if (currentChar === '<') { // Found tag
        if (charList[i - 1] === '!') { // Hit the start of HTML comment inbetween teddy tags
          outsideTags = true
          commentIndices.push(i)
        } else if (twoArraysEqual(charList.slice(i - tagLengths.if + 1, i + 1), primaryTags.if) || twoArraysEqual(charList.slice(i - tagLengths.unless + 1, i + 1), primaryTags.unless)) { // nested <if> or <unless>
          nested++
        } else if (validEndingTag(charList, i) && (twoArraysEqual(charList.slice(i - tagLengths.cif + 1, i + 1), primaryTags.cif) || twoArraysEqual(charList.slice(i - tagLengths.cunless + 1, i + 1), primaryTags.cunless) || (twoArraysEqual(charList.slice(i - tagLengths.celse + 1, i + 1), secondaryTags.celse) && nested > 0))) { // Closing <if> tag
          if (nested > 0) { // Outside one level of nested conditional (only looks for <if> or <unless>)
            nested--

            if (nested === 0) { // In case the nested conditional has an else tag
              isNested = true
            }
          } else { // Push [start, end] index of closing conditional tag to our list marking the ends of condition tags (i.e. </if> </unless>)
            const endOfClosingTag = charList.lastIndexOf('>', i)
            eoc.push([i, endOfClosingTag])
            isNested = false
          }
        } else if ((twoArraysEqual(charList.slice(i - tagLengths.elseif + 1, i + 1), secondaryTags.elseif) || twoArraysEqual(charList.slice(i - tagLengths.elseunless + 1, i + 1), secondaryTags.elseunless)) && nested < 1) { // Beginning <elseif> or <elseunless> tag
          if (!isNested) {
            // Set the condition type to be either if or unless dependent on the tag being currently read
            condition.type = charList[i - 5] === 'i' ? 'if' : 'unless'

            readingConditional = true
            tagStart = i
            i = charList.lastIndexOf(' ', i)
          }
        } else if (validEndingTag(charList, i) && (twoArraysEqual(charList.slice(i - tagLengths.celseif + 1, i + 1), secondaryTags.celseif) || twoArraysEqual(charList.slice(i - tagLengths.celseunless + 1, i + 1), secondaryTags.celseunless))) { // Get [start, end] indices of </elseif> or </elseunless>
          if (!isNested) {
            const endOfClosingTag = charList.lastIndexOf('>', i)
            eoc.push([i, endOfClosingTag]) // important indices
          }
        } else if (twoArraysEqual(charList.slice(i - tagLengths.else + 1, i + 1), secondaryTags.else) && nested < 1) { // <else> tag
          if (!isNested) { // Push [start, end] indices of <else> to list
            boc.push([i, i - tagLengths.else])
          }
        } else if (validEndingTag(charList, i) && twoArraysEqual(charList.slice(i - tagLengths.celse + 1, i + 1), secondaryTags.celse) && nested < 1) { // </else> tag
          if (isNested) { // skip </else> tag for a nested condition
            isNested = false
          } else { // Push [start, end] indices of </else> to list
            const endOfClosingTag = charList.lastIndexOf('>', i)
            eoc.push([i, endOfClosingTag])
            break
          }
        }
      }
    }

    // Loop through our list of conditional tags
    for (i = 0; i < conditions.length; i++) {
      if (evalCondition(conditions[i])) { // If one of our conditions is true, return contents along with the rest of the template
        if (eoc.length === 1) { // There is a single <if> or <unless> tag without an <else>
          return [...charList.slice(0, eoc[0][1]), ...charList.slice(eoc[0][0] + 1, boc[0][1])]
        } else {
          // Check if there are HTML comments inbetween our conditional tags
          if (commentList.length > 0) {
            // Loop through HTML comments list
            for (j = 0; j < commentList.length - 1; j++) {
              if (Math.abs(commentList[j][1] - boc[i][0]) < 10) {
                // Return preceding HTML comment and parsed conditional tag content with the rest of the template
                return [...charList.slice(0, eoc[eoc.length - 1][1]), ...charList.slice(eoc[i][0] + 1, boc[i][1]), ...charList.slice(commentList[j][1], commentList[j][0] + 1)]
              }
            }
          } else {
            // Return contents in true conditional along with rest of template
            return [...charList.slice(0, eoc[eoc.length - 1][1]), ...charList.slice(eoc[i][0] + 1, boc[i][1])]
          }
        }
      }
    }

    // Render template if there are no true conditionals
    if (eoc.length === 1) { // Skip conditional content if evaluated to false and there are no <else> siblings
      const endOfClosingTag = charList.lastIndexOf('>', eoc[0][0])
      return [...charList.slice(0, endOfClosingTag)]
    } else { // Return template with <else> tag contents
      // Check if there are HTML comments inbetween our conditional tags
      if (commentList.length > 0) {
        // Loop through HTML comments list
        for (j = 0; j < commentList.length; j++) {
          if (Math.abs(commentList[j][1] - boc[boc.length - 1][0]) < 10) {
            // Return preceding HTML comment and <else> content with the rest of the template
            return [...charList.slice(0, eoc[eoc.length - 1][1]), ...charList.slice(eoc[eoc.length - 1][0] + 1, boc[boc.length - 1][1]), ...charList.slice(commentList[j][1], commentList[j][0] + 1)]
          }
        }
      } else {
        // If number of conditions === number of endOfConditions array, then the last one is not an else statement, return just the content after the last condition
        if (conditions.length === eoc.length) {
          return [...charList.slice(0, eoc[eoc.length - 1][1])]
        } else {
          // Return contents of <else> tag along with rest of template
          return [...charList.slice(0, eoc[eoc.length - 1][1]), ...charList.slice(eoc[eoc.length - 1][0] + 1, boc[boc.length - 1][1] + 1)]
        }
      }
    }
  }

  // Parse logic within our teddy tag and return true or false
  function evalCondition (condition) {
    var isIf = (condition.type === 'if') // Determines if the returning value should be negated in the case of an <unless>
    var partialCondition

    if (condition.operators.length > 1) { // More than 2 values to check in if statement (i.e. <if something or somethingElse and somethingMore>)
      partialCondition = evalPartial(condition)

      // Keep evaluating expression until we have an result
      while (partialCondition[0].variables.length > 0) {
        partialCondition = evalPartial(condition, partialCondition[1])
      }

      // Return correct value based on <if> or <unless>
      return (isIf) ? partialCondition[1].value : !partialCondition[1].value
    } else {
      // Return correct value based on <if> or <unless>
      return (isIf) ? getLogicalValue(condition, condition.operators[0], condition.variables[0], condition.variables[1])[1].value : !getLogicalValue(condition, condition.operators[0], condition.variables[0], condition.variables[1])[1].value
    }
  }

  // Evaluates conditional tag logic two values at a time in the case that there are more than two values to check
  function evalPartial (condition, pVal) {
    var operator = condition.operators.shift() // Next operator in conditional tag
    var var1 = condition.variables.shift() // Next teddy argument in conditional tag
    var var2 // Second value to compare against

    if (pVal) { // If this function ran once already we have a value to use again
      var2 = pVal
    } else { // First time running this function
      if (operator !== 'not') { // Two variables are required when using any other operator
        var2 = condition.variables.shift()
      }
    }

    // Returns and 2-length array containing the condition we are evaluating and the true/false value of two values
    return getLogicalValue(condition, operator, var1, var2)
  }

  // Truth table for all possible logic
  function getLogicalValue (condition, operator, firstVal, secondVal) {
    // Check if we need to change values to false from {varName}
    if (firstVal.value[0] === '{') {
      firstVal.value = false
    }

    // Make sure a second value exists and change value to false if value is {varName}
    if (secondVal && secondVal.value[0] === '{') {
      secondVal.value = false
    }

    // or, and, xor, not
    switch (operator) {
      case 'or': // <if something or somethingElse>
        if (firstVal.expected && secondVal.expected) { // <if something='yes' or somethingElse='no'>
          if (firstVal.value === firstVal.expected || secondVal.value === secondVal.expected) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (firstVal.expected) { // <if something='yes' or somethingElse>
          if (firstVal.value === firstVal.expected || isValue(secondVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (secondVal.expected) { // <if something or somethingElse='no'>
          if (isValue(firstVal.value) || secondVal.value === secondVal.expected) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else { // <if something or somethingElse>
          if (isValue(firstVal.value) || isValue(secondVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        }
      case 'and': // <if something and somethingElse>
        if (firstVal.expected && secondVal.expected) { // <if something='yes' and somethingElse='no'>
          if (firstVal.value === firstVal.expected && secondVal.value === secondVal.expected) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (firstVal.expected) { // <if something='yes' and somethingElse>
          if (firstVal.value === firstVal.expected && isValue(secondVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (secondVal.expected) { // <if something and somethingElse='no'>
          if (isValue(firstVal.value) && secondVal.value === secondVal.expected) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else { // <if something and somethingElse>
          if (isValue(firstVal.value) && isValue(secondVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        }
      case 'xor': // <if something xor somethingElse>
        if (firstVal.expected && secondVal.expected) { // <if something='yes' xor somethingElse='no'>
          if (firstVal.value === firstVal.expected && secondVal.value === secondVal.expected) {
            return [condition, { value: false }]
          } else if (firstVal.value === firstVal.expected) {
            return [condition, { value: true }]
          } else if (secondVal.value === secondVal.expected) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (firstVal.expected) { // <if something='yes' xor somethingElse>
          if (firstVal.value === firstVal.expected) {
            return [condition, { value: true }]
          } else if (isValue(secondVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (secondVal.expected) { // <if something xor somethingElse='no'>
          if (secondVal.value === secondVal.expected) {
            return [condition, { value: true }]
          } else if (isValue(firstVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else { // <if something xor somethingElse>
          if (isValue(firstVal.value) && isValue(secondVal.value)) {
            return [condition, { value: false }]
          } else if (isValue(firstVal.value)) {
            return [condition, { value: true }]
          } else if (isValue(secondVal.value)) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        }
      case 'not': // <if not:something>
        if (isValue(firstVal.value)) {
          return [condition, { value: false }]
        } else {
          return [condition, { value: true }]
        }
      default: // <if something>
        if (firstVal.expected) { // <if something='yes'>
          if (firstVal.value === firstVal.expected) {
            return [condition, { value: true }]
          } else {
            return [condition, { value: false }]
          }
        } else if (isValue(firstVal.value)) {
          return [condition, { value: true }]
        } else {
          return [condition, { value: false }]
        }
    }
  }

  // Parse looping teddy tags (i.e <loop through='list' val='item'>)
  function parseLoop (charList, model) {
    let nested = 0 // Nested counter
    const params = {} // Save all loop parameters in this object
    const modifiedModel = Object.assign({}, model) // Used when we need to scan inner loop contents
    let teddyName = '' // Name of teddy variable
    let periodIndex // Index of '.' if a teddy variable name includes one
    let through // through=
    let keyVals // key=
    let vals // val=
    let vl // Length of val= model value
    let context // If a loop is nested and requires the context of a previous loop, this will contain the previous loop value
    let sol // start of <loop>
    let eol // end of <loop>
    let sov // Index of '{' when reading a teddy variable
    let currentChar // Current character in character lists
    let slicedTemplate // Contents of <loop>
    let modifiedStatement = '' // slicedTemplate after parsing {vars}
    let teddyString = '' // Actual value to insert into template inside <loop>
    let isNested = false // <loop> is nested
    let readingVar = false // reading a teddy variable name within a <loop>
    let containsTag = false // <loop> contains other teddy tags
    let containsComment = false // <loop> contains teddy comments
    let parsedTags = false // <loop> variable has been parsed more than once due to additional teddy tags
    let i
    let j
    const l = charList.length

    // Read <loop> inner contents
    for (i = l - tagLengths.loop; i >= 0; i--) {
      currentChar = charList[i]
      if (currentChar === ' ' && teddyName.length > 6) { // Whitespace inbetween <loop> attributes
        if (teddyName.slice(0, 3) === 'key') { // params.key
          params.key = teddyName.slice(5, teddyName.length - 1)
        } else if (teddyName.slice(0, 3) === 'val') { // params.val
          params.val = teddyName.slice(5, teddyName.length - 1)
        } else if (teddyName.slice(0, 7) === 'through') { // params.through
          params.through = teddyName.slice(9, teddyName.length - 1)
        }
        teddyName = ''
      } else if (currentChar === '>' && (teddyName.length > 6 || typeof sol === 'undefined')) { // End of opening <loop>
        if (teddyName.slice(0, 3) === 'key') { // params.key
          params.key = teddyName.slice(5, teddyName.length - 1)
        } else if (teddyName.slice(0, 3) === 'val') { // params.val
          params.val = teddyName.slice(5, teddyName.length - 1)
        }
        sol = i // Save index location of '>' of <loop> tag
        teddyName = ''
      } else if (currentChar === '<') { // Found either an HTML tag or teddy tag
        if (twoArraysEqual(charList.slice(i - tagLengths.loop + 1, i + 1), primaryTags.loop)) { // Found a nested <loop>
          isNested = true
          nested++
        } else if (validEndingTag(charList, i) && twoArraysEqual(charList.slice(i - tagLengths.cloop + 1, i + 1), primaryTags.cloop)) { // Found </loop>
          if (nested > 0) { // Belongs to a nested <loop>
            nested--
          } else { // Not a nested <loop>
            eol = i
            break
          }
        } else if (twoArraysEqual(charList.slice(i - tagLengths.if + 1, i + 1), primaryTags.if)) { // Found <if>
          containsTag = true
        } else if (twoArraysEqual(charList.slice(i - tagLengths.unless + 1, i + 1), primaryTags.unless)) { // Found <unless>
          containsTag = true
        } else if (twoArraysEqual(charList.slice(i - tagLengths.include + 1, i + 1), primaryTags.include)) { // Found <include>
          containsTag = true
        } else if (charList.slice(i - 23, i).join('').includes(' if-')) { // Found one line if
          containsTag = true
        }
      } else { // Get all <loop> attributes and their declared values
        if (currentChar.match(/\s/)) continue // skip whitespace
        if (Object.keys(params).length < 3 && !Object.keys(params).includes('val')) { // Make sure we end up with params.through, params.val, params.key (optional)
          teddyName += currentChar
        }
      }
    }

    const endOfClosingTag = charList.lastIndexOf('>', eol)
    const endOfStatement = charList.slice(0, endOfClosingTag) // Rest of the template array after the <loop>
    slicedTemplate = charList.slice(eol + 1, sol) // Contents of <loop>
    const templateCopy = charList.slice(eol + 1, sol) // Keep a copy of <loop> contents

    // Get object values/keys
    if (params.through) {
      periodIndex = params.through.indexOf('.')

      // <loop through='list' key='index' val='value'>
      if (periodIndex < 0) { // Loop through value is not an object
        through = model[params.through]
      } else { // Loop through value is an object
        if (model[params.through.slice(0, periodIndex)] === undefined) { // Loop through object value requires context
          context = findContext(params.through)
          through = getContext(model, context, params.through.slice(periodIndex + 1))
        } else { // Loop through object value does not require context
          through = model[params.through.slice(0, periodIndex)][params.through.slice(periodIndex + 1)]
        }
      }

      if (through) { // Get key/val values from model
        keyVals = Object.keys(through)
        vals = Object.values(through)
      }
    }

    // If we have values to loop through, continue
    if (vals) {
      vl = vals.length
      for (i = 0; i < vl; i++) { // Loop through every value in list
        for (j = slicedTemplate.length - 1; j >= 0; j--) { // Loop through every character inbetween <loop> tags
          currentChar = slicedTemplate[j]
          if (readingVar) { // Reading a variable in template
            if (currentChar === '}') { // Closing curly bracket means we are done reading variable name
              if (teddyName === params.val) { // {var} name read is a val
                teddyString = `${vals[i]}`
              } else if (teddyName === params.key) { // {var} name read is a key
                teddyString = `${keyVals[i]}`
              } else if (teddyName.indexOf('.') >= 0 && (teddyName.slice(0, teddyName.indexOf('.')) === params.val)) { // {var.next} name read is a val that is an object
                teddyString = `${vals[i][teddyName.slice(teddyName.indexOf('.') + 1)]}`
              }
              // Replace teddy variable name with actual value
              if (teddyString !== '' && teddyString !== 'undefined') {
                slicedTemplate = insertValue(slicedTemplate, teddyString.split('').reverse().join(''), sov, j)

                // Recalibrate iterator based on length of inserted value (if necessary)
                if (teddyString.length < teddyName.length) {
                  j += (teddyName.length - teddyString.length)
                }
              }

              // Reset reading variables
              readingVar = false
              teddyName = ''
              teddyString = ''
            } else {
              teddyName += currentChar
            }
          } else if (currentChar === '{') { // We reached a possible teddy var or comment inside of <loop>
            if (slicedTemplate[j - 1] === '!') { // Its a comment
              containsComment = true
            } else { // Its a variable
              sov = j + 1
              readingVar = true
            }
          }
        }

        // Join parsed templates together
        if (containsTag) { // If loop contents contain a teddy tag, parse template again until no extra teddy tags remain
          modifiedModel[params.val] = vals[i]
          slicedTemplate = scanTemplate(slicedTemplate, modifiedModel).split('').reverse().join('')

          modifiedStatement = slicedTemplate + modifiedStatement
          parsedTags = true
        } else {
          modifiedStatement = slicedTemplate.join('') + modifiedStatement
        }

        // Reset template back to a copy
        slicedTemplate = templateCopy

        // Save context if template contains a nested loop
        if (isNested) {
          if (currentContext.length > 0 && params.val !== currentContext[0]) {
            contextModels.push([params.val, `${currentContext[1] + params.through.slice(params.through.indexOf('.'))}[${i}]`])
          } else {
            contextModels.push([params.val, `${params.through}[${i}]`])
          }
        }
      }
    } else {
      // Could not parse <loop>, return rest of template
      const endOfClosingTag = charList.lastIndexOf('>', eol)
      return [...charList.slice(0, endOfClosingTag)]
    }

    // In cases of very large datasets, we use the global endParse var to save time (since it will go character by character)
    if (modifiedStatement.length > 49999 && endOfStatement.length <= 1 && (parsedTags || (!containsTag && !containsComment))) {
      endParse = true
    }

    // Return template with loop parsed
    return [...endOfStatement, ...modifiedStatement]
  }

  // Parse <include src='myTemplate.html'>
  function parseInclude (charList, model) {
    let src = '' // src=
    let noParseSlice // slices out 'noparse' or 'noteddy' from <include>
    let includeTemplate // Contents of src
    let startInclude // Starting index of <include> for slicing
    let endInclude // Ending index of <include> for slicing
    const includeArgs = {} // Object of <arg>'s
    const modifiedModel = Object.assign({}, model)
    let argName = ''
    let argValue = ''

    let inArg = false // Reading a <arg> tag
    let readingArgVal = false // Reading a teddy arg value
    let invalidArg = false // Signals to stop parsing if this is triggered when reading include args
    let stopReading = false // Signals to stop reading either the src value or teddy variable name
    let noParseFlag = false // noteddy or noparse tag inside <include>
    let inLoop = false
    let nested = 0

    let i
    let currentChar
    const l = charList.length

    // Get HTML source from include tag
    for (i = l - tagLengths.include; i >= 0; i--) {
      currentChar = charList[i]
      if (currentChar === '=') { // Reached src value
        if (src === 'src') {
          src = '' // Reset to obtain value
        }
      } else if (currentChar === '>') { // End of <include> open tag
        src = src.trim().slice(1, -1) // Remove quotations from src
        startInclude = i - 1
        break
      } else if (currentChar.match(/\s/)) { // Reached a 'noteddy' or 'noparse'
        noParseSlice = charList.slice(i - 7, i).reverse().join('')
        if (noParseSlice === 'noteddy' || noParseSlice === 'noparse') { // noteddy or noparse attribute in <include>
          noParseFlag = true
          stopReading = true
        }
      } else if (currentChar === '<') { // This only happens in this case <include></include>
        if (charList.slice(i, i + 10)) {
          return charList.slice(i + 11)
        }
      } else {
        if (currentChar.match(/\s/)) continue // skip whitespace
        if (!stopReading) {
          src += currentChar
        }
      }
    }

    // check if dynamic src name
    if (src[0] === '{') {
      src = getTeddyVal(src, model)
    }

    // Parse <include> src
    includeTemplate = [...teddy.compile(src)].reverse()

    // Read contents of <include> tag
    for (i = startInclude; i >= 0; i--) {
      currentChar = charList[i]
      if (inArg) { // Read contents of <arg>
        if (readingArgVal) { // Get include argument value
          if (currentChar === '<' && validEndingTag(charList, i) && twoArraysEqual(charList.slice(i - tagLengths.carg + 1, i + 1), primaryTags.carg)) { // Closing argument tag, push arg object to list of args
            if (nested > 0) {
              argValue += currentChar
              nested--
            } else {
              includeArgs[argName.trim()] = argValue
              // Reset important variables
              inArg = false
              readingArgVal = false
              argName = ''
              argValue = ''
            }
          } else if (currentChar === '<' && twoArraysEqual(charList.slice(i - tagLengths.arg + 1, i + 1), primaryTags.arg)) { // We found another argument tag inside of an argument tag
            argValue += currentChar
            nested++
          } else { // Get include argument value
            argValue += currentChar
          }
        } else if (currentChar === '>') { // Start reading arg value
          readingArgVal = true
        } else { // Get include argument name
          argName += currentChar
        }
      } else if (currentChar === '<') { // Found a tag
        if (twoArraysEqual(charList.slice(i - tagLengths.arg + 1, i + 1), primaryTags.arg)) { // Check if we hit a teddy <arg> tag
          inArg = true
          i -= 4 // increment to start reading arg name right away
        } else if (validEndingTag(charList, i) && twoArraysEqual(charList.slice(i - tagLengths.cinclude + 1, i + 1), primaryTags.cinclude)) { // Found </include>
          if (nested > 0) {
            nested--
          } else {
            const endOfClosingTag = charList.lastIndexOf('>', i)
            endInclude = endOfClosingTag - 1
            break
          }
        } else if (twoArraysEqual(charList.slice(i - tagLengths.include + 1, i + 1), primaryTags.include)) {
          nested++
        } else { // Triggers on any tag that is not supposed to be in here
          if (charList[i - 1] !== '/') { // make sure this does not trigger on closing tags
            invalidArg = true
          }
        }
      }
    }

    // Actions that do not require parsing includeTemplate
    if (includeTemplate.length === src.length - 5) { // Could not find src file
      return charList.slice(0, endInclude + 1)
    } else if (noParseFlag) { // noparse in <include>, returns {~includeTemplate~}
      return insertValue(charList, [...`}~${includeTemplate.join('')}~{`], charList.length, endInclude + 1)
    } else if (invalidArg) { // <include> uses invalid use of <arg>
      return charList.slice(0, endInclude + 1)
    } else {
      // Add all include arguments to the model copy (only in this scanTemplate call)
      for (const key in includeArgs) {
        if (includeArgs[key] === model[key]) { // Make sure we aren't stuck in a loop,
          passes = teddy.params.maxPasses
          inLoop = true
          break
        }
        modifiedModel[key] = includeArgs[key]
      }

      if (!inLoop) {
        includeTemplate = scanTemplate(includeTemplate, modifiedModel, true).split('').reverse().join('')
      }

      // Return parsed include src along with the rest of the template
      return insertValue(charList, includeTemplate, charList.length, endInclude + 1)
    }
  }

  // Parse <tag if-something>
  function parseOneLineIf (charList, model) {
    let readingName = false
    let readingLiteral = false
    let readingConditions = false
    let startIndex
    let endIndex
    let conditionText = ''
    let conditionVarName = ''
    let conditionLiteral = ''
    const condition = {
      varName: null,
      varLiteral: null,
      true: '',
      false: ''
    }
    let i
    const l = charList.length
    let currentChar
    let currentQuote

    // Go through our template to parse the oneline-if
    for (i = l - 3; i >= 0; i--) {
      currentChar = charList[i]

      // Get teddy var name
      if (readingName) {
        // Done with name and onto true/false values next
        if (currentChar === ' ' || currentChar === '\n') {
          readingConditions = true
          readingName = false
          condition.varName = conditionVarName.slice(3)
        } else if (currentChar === '=') { // done with name and onto literal value to compare against
          readingLiteral = true
          readingName = false
          condition.varName = conditionVarName.slice(3)
        } else { // Get teddy var name
          conditionVarName += currentChar
        }
      } else if (readingLiteral) { // Get expected literal value if it exists
        // We are done reading expected literal value
        if ((currentChar === ' ' || currentChar === '\n') && (conditionLiteral[conditionLiteral.length - 1] === '"' || conditionLiteral[conditionLiteral.length - 1] === "'" || conditionLiteral[conditionLiteral.length - 1] === '}')) {
          readingConditions = true
          readingLiteral = false

          // Expected literal value is a teddy variable
          if (conditionLiteral[1] === '{') {
            condition.varLiteral = getTeddyVal(conditionLiteral.slice(1, -1), model)
          } else { // else is a value wrapped in quotations
            condition.varLiteral = conditionLiteral.slice(1, -1)
          }
        } else { // Get expected literal value
          conditionLiteral += currentChar
        }
      } else if (readingConditions) { // Get True/False conditions in the oneline-if
        if ((currentChar === ' ' || currentChar === '\n') && (charList[i + 1] === currentQuote || charList[i + 1] === ' ' || charList[i + 1] === '\n')) {
          if (conditionText.slice(0, 4) === 'true') {
            condition.true = conditionText.slice(6, -1)
          } else if (conditionText.slice(0, 5) === 'false') {
            condition.false = conditionText.slice(7, -1)
          }

          // check if we need to stop parsing oneline-if
          if (condition.true && condition.false) {
            endIndex = i + 1
            break
          } else if (charList[i - 1] !== 'f' && charList[i - 1] !== 't' && charList[i - 1] !== ' ' && charList[i - 1] !== '\n') {
            endIndex = i + 1
            break
          }

          // Reset to get other condition
          conditionText = ''
        } else if (currentChar === '>' || (currentChar === '/' && charList[i - 1] === '>')) { // Get second condition
          if (conditionText.slice(0, 4) === 'true') {
            condition.true = conditionText.slice(6, -1)
          } else if (conditionText.slice(0, 5) === 'false') {
            condition.false = conditionText.slice(7, -1)
          }
          endIndex = i + 1
          break
        } else {
          if (conditionText.length < 7 && (conditionText === 'true=' || conditionText === 'false=')) { // Get type of quote used in condition
            currentQuote = currentChar
          }
          conditionText += currentChar
        }
      } else if ((currentChar === ' ' || currentChar === '\n') && twoArraysEqual(charList.slice(i - 3, i), primaryTags.olif)) { // Possible beginning for oneline-if
        readingName = true
        startIndex = i
      }
    }

    // Get a value from teddy var name (if it exists)
    const varVal = getTeddyVal(condition.varName, model)

    // Evaluate condition to true or false
    if (condition.varLiteral !== null) { // There is a value to compare against
      if (varVal === condition.varLiteral) {
        return insertValue(charList, condition.true.split('').reverse().join(''), startIndex, endIndex)
      } else {
        return insertValue(charList, condition.false.split('').reverse().join(''), startIndex, endIndex)
      }
    } else { // There is no value to compare against
      if (varVal && varVal[0] === '{' && varVal[varVal.length - 1] === '}') {
        return insertValue(charList, condition.false.split('').reverse().join(''), startIndex, endIndex)
      } else {
        return insertValue(charList, condition.true.split('').reverse().join(''), startIndex, endIndex)
      }
    }
  }

  // Get inner content of <noteddy> tag without parsing teddy contents
  function parseNoTeddy (charList) {
    const l = charList.length
    let i

    for (i = l - 1; i >= 0; i--) {
      if (validEndingTag(charList, i) && twoArraysEqual(charList.slice(i - tagLengths.cnoteddy + 1, i + 1), primaryTags.cnoteddy)) { // Return contents of <noteddy>
        const endOfClosingTag = charList.lastIndexOf('>', i)
        return [...charList.slice(0, endOfClosingTag), ...charList.slice(i + 1, l - tagLengths.noteddy)]
      }
    }
  }

  // Makes sure value is readable by returning true, else return false
  function isValue (val) {
    if (typeof val === 'object') { // Value is either a list or object
      if (Object.keys(val).length > 0) { // Object
        return true
      } else { // List or empty object
        return !!val.length
      }
    } else if (typeof val === 'boolean') { // Value is a boolean
      return val
    } else { // Value is a number or string
      return !!val
    }
  }

  // Returns teddy primary tag name
  function findTeddyTag (charList, tags) {
    const keys = Object.keys(tags)
    const kl = keys.length
    const l = charList.length
    let type = 'unknown'
    let currentTag
    let i
    let currentChar

    // Loop through teddy primary tags
    for (i = 0; i < kl; i++) {
      currentTag = tags[keys[i]]
      if (twoArraysEqual(currentTag, charList.slice(-currentTag.length, charList.length))) { // Value found in list of primary tags
        if (keys[i].indexOf('Invalid') > -1) { // Bad value to find, return invalid
          type = keys[i].slice(0, keys[i].indexOf('Invalid'))
        } else { // Found a primary tag
          type = keys[i]
        }
        return type
      }
    }

    // check if it is a one-line if statement
    for (i = l - 3; i >= 0; i--) {
      currentChar = charList[i]
      if (currentChar === '>' || currentChar === '<') { // stop checking if we see an open bracket '<' for a tag
        break
      } else if (currentChar === ' ' || currentChar === '\n') { // possible oneline-if
        if (twoArraysEqual(charList.slice(i - 3, i), primaryTags.olif)) { // definite oneline-if
          return 'one-line-if'
        }
      }
    }

    return type
  }

  // Returns true if two arrays are equal
  function twoArraysEqual (a1, a2) {
    let i
    const l1 = a1.length
    const l2 = a2.length

    // Check if the arrays are the same length
    if (l1 !== l2) return false

    for (i = 0; i < l1; i++) {
      // If a character is a space, also match on all whitespaces
      if (a2[i] === ' ' && a1[i].match(/\s/)) continue
      else if (a1[i] === ' ' && a2[i].match(/\s/)) continue
      // Check if all items exist and are in the same order
      else if (a1[i] !== a2[i]) return false
    }

    return true
  }

  // Returns a list of characters with teddy var names replaced with actual values
  function insertValue (str, val, start, end) {
    // String after value + new value + String before value
    return [...str.slice(0, end), ...val, ...str.slice(start)]
  }

  // Finds correct context for a nested loop
  function findContext (str) {
    for (let i = 0; i < contextModels.length; i++) {
      if (str.indexOf(contextModels[i][0]) > -1) {
        currentContext = contextModels[i] // save required context from list
        contextModels.splice(i, 1) // remove current context from list
        return currentContext[1]
      }
    }
  }

  // Gets contextual value from model
  function getContext (model, str, thru) {
    let currentValue
    let tempStr = ''
    let tempIndex = ''
    let getIndex = false

    for (let i = 0; i < str.length; i++) { // Found index
      if (getIndex) { // Get numerical index to select from
        if (str[i] === ']') {
          currentValue = currentValue[tempIndex]
          getIndex = false
          tempIndex = ''
        } else {
          tempIndex += str[i]
        }
      } else if (str[i] === '[') { // Found index
        if (currentValue) {
          currentValue = currentValue[tempStr] // Fetch value from current spot in nested object
        } else {
          currentValue = model[tempStr] // Fetch value from model
        }
        getIndex = true
        tempStr = ''
      } else if (str[i] === '.') { // Do nothing
      } else { // Get attribute name from model
        tempStr += str[i]
      }
    }

    // Contains contextual value to loop through
    return currentValue[thru]
  }

  // Removes comment from teddy template
  function removeTeddyComment (charList) {
    let nested = 0
    let i
    const l = charList.length

    for (i = l - 2; i > 0; i--) {
      if (charList[i] === '{' && charList[i - 1] === '!') { // Teddy comment within teddy comment
        nested++
      } else if (charList[i] === '!' && charList[i - 1] === '}') { // End of teddy comment
        if (nested > 0) {
          nested--
        } else {
          return charList.slice(0, i - 1) // Return template without comment
        }
      }
    }
  }

  // Replace {variable} in template with value taken from model
  function getValueAndReplace (charList, myModel, escapeOverride, pName) {
    let varName = ''
    let varVal
    let i
    const l = charList.length

    // Find start/end points of curly brackets
    for (i = l - 2; i >= 0; i--) {
      // If we find the ending curly bracket, replace {variable} in template with its value in the model
      if (charList[i] === '}' && charList[i - 1] !== '}') {
        varVal = getTeddyVal(varName, myModel, escapeOverride) // Check if value is in the model

        if (typeof varVal === 'string' && varVal.slice(1, -1) === varName) { // Teddy variable is referencing itself
          break
        }

        if (varVal[0] === '{') { // Get Teddy variable value within teddy variable value
          if (varVal.indexOf(pName) >= 0) { // Infinitely referencing teddy variables
            break
          } else {
            varVal = getValueAndReplace([...varVal].reverse(), myModel, escapeOverride, `{${varName}}`).reverse().join('')
          }
        }
        return insertValue(charList, [...varVal].reverse(), charList.length, i) // Replace and return template
      } else { // Get teddy variable name from template
        varName += charList[i]
      }
    }

    return charList
  }

  // Get a usable value from a teddy var
  function getTeddyVal (name, model, escapeOverride) {
    const l = name.length
    let noParse = false // 'p' flag
    let noSuppress = false // 's' flag
    let tempName = ''
    let tempValue
    let flagSlice
    let i

    // Check teddy var name for any exceptions
    for (i = 0; i < l; i++) {
      if (name[i] === '.') {
        if (tempValue) {
          tempValue = tempValue[tempName]
        } else {
          tempValue = model[tempName]
        }
        tempName = ''
      } else if (name[i] === '{') { // some.{thing}
        tempName = ''
      } else if (name[i] === '}') { // some.{thing}
        if (tempValue) {
          tempValue = tempValue[model[tempName]]
        } else {
          tempValue = model[tempName]
        }
      } else if (name[i] === '|') { // Looks for 'p' or 's' flags
        flagSlice = name.slice(i)
        if (flagSlice.indexOf('p') >= 0) { // catch noparse flag
          noParse = true
        }
        if (flagSlice.indexOf('s') >= 0) { // catch suppress html entities flag
          noSuppress = true
        }

        // Move index to correct spot afterwards
        i += flagSlice.length

        // Reached the end of teddy name string
        if (i === l) {
          if (tempValue) {
            tempValue = tempValue[tempName]
          } else {
            tempValue = model[tempName]
          }
        }
      } else {
        tempName += name[i]

        if (i === l - 1) { // Reached the end of our teddy variablee reference
          if (tempValue) {
            tempValue = tempValue[tempName]
          } else {
            tempValue = model[tempName]
          }
        }
      }
    }

    if (tempValue || tempValue === '') {
      if (noParse && noSuppress) { // something|p|s
        return noParseFlag(tempValue)
      } else if (noSuppress) { // something|s
        return tempValue
      } else if (noParse) { // something|p
        return escapeEntities(noParseFlag(tempValue))
      } else { // something
        if (escapeOverride) {
          return tempValue
        } else {
          return escapeEntities(tempValue)
        }
      }
    } else {
      return `{${name}}`
    }
  }

  // Escapes HTML entities within a teddy value
  function escapeEntities (value) {
    const entityKeys = Object.keys(escapeHtmlEntities)
    const ekl = entityKeys.length
    let escapedEntity = false
    let newValue = ''
    let i
    let j

    if (value === undefined || typeof value === 'boolean' || typeof value === 'object') { // Cannot escape on these values
      return value
    } else if (typeof value === 'number') { // Value is a number, no reason to escape
      return `${value}`
    } else {
      // Loop through value to find HTML entities
      for (i = 0; i < value.length; i++) {
        escapedEntity = false

        // Loop through list of HTML entities to escape
        for (j = 0; j < ekl; j++) {
          if (value[i] === entityKeys[j]) { // Alter value to show escaped HTML entities
            newValue += escapeHtmlEntities[entityKeys[j]]
            escapedEntity = true
            break
          }
        }

        if (!escapedEntity) {
          newValue += value[i]
        }
      }
    }

    // Returns modified value
    return newValue
  }

  // Applies noparse logic to a teddy var value (ex: {varName|p})
  function noParseFlag (value) {
    const teddyVarList = [] // keep track of all teddy vars
    let noTeddyParse = [] // [start, end] indices for brackets of a teddy var
    let newValue = value
    let i
    let j
    const l = value.length

    // Loop through block of teddy content to find all teddy variables to apply noparse logic to
    for (i = 0; i < l; i++) {
      if (value[i] === '{' && noTeddyParse.length < 1) { // Start of teddy variable
        noTeddyParse.push(i)
      } else if (value[i] === '}' && value[i + 1] !== '}') { // End of teddy variable
        noTeddyParse.push(i + 1)
        teddyVarList.push(noTeddyParse)
        noTeddyParse = []
      }
    }

    for (j = teddyVarList.length - 1; j >= 0; j--) {
      // Replace {varName} with {~varName~} to imply noparse internally
      newValue = newValue.slice(0, teddyVarList[j][0]) + '{~' + newValue.slice(teddyVarList[j][0], teddyVarList[j][1]) + '~}' + newValue.slice(teddyVarList[j][1])
    }

    // Returns modified value
    return newValue
  }

  // Handles <noteddy>content</noteddy> using this notation internally {~content~}
  function noParseTeddyVariable (charList, renderedTemplate) {
    let i
    const l = charList.length
    let noparseBlock = ''
    let currentChar

    // Scan until end of <noteddy>
    for (i = l - 1; i >= 0; i--) {
      currentChar = charList[i]
      if (currentChar === '~' && charList[i - 1] === '}') { // Return content
        return [insertValue(charList, '', l, i - 1), `${renderedTemplate}${noparseBlock}~}`]
      } else {
        noparseBlock += currentChar
      }
    }
  }

  // Handles cleaning up all {~content~}
  function cleanNoParseContent (rt) {
    return rt.replace(/({~|~})/g, '')
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

  // Validate a closing html tag (ex: </loop>)
  function validEndingTag (charList, startIndex) {
    let hitSpace = false
    let i

    // check for </
    if (charList[startIndex] === '<' && charList[startIndex - 1] !== '/') {
      return false
    }

    // check that the next char is alphabetical
    if (!charList[startIndex - 2].match(/[A-Za-z]/)) {
      return false
    }

    for (i = startIndex - 2; i >= 0; i--) {
      if (charList[i] === '>') {
        // Found end of tag successfully
        return true
      } else if (charList[i].match(/\s/)) {
        // Found whitespace
        hitSpace = true
      } else if (hitSpace && !charList[i].match(/\s/)) {
        // a space has been hit and a character that wasn't whitespace was found. Invalid syntax for a closing tag.
        return false
      }
    }

    // Hit end of charList without seeing a closing '>'. Invalid syntax
    return false
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
  }
})(this)
