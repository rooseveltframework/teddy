var fs = require('fs')
var path = require('path')

var teddy // @namespace

// private utility vars
var consoleWarnings // used to overload console.warn for the server-side error gui
var consoleErrors // used to overload console.error for the server-side error gui
// var fs // server-side filesystem module
// var path // server-side utility for manipulating file paths
var contextModels = [] // stores local models for later consumption by template logic tags
var matchRecursive // see below
var jsonStringifyCache
var templates = []
var endParse = false

// List of all relevant teddy tags
const TEDDY_TAGS = {
  primary: {
    include: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', ' '],
    arg: ['<', 'a', 'r', 'g', ' '],
    if: ['<', 'i', 'f', ' '],
    loop: ['<', 'l', 'o', 'o', 'p', ' '],
    unless: ['<', 'u', 'n', 'l', 'e', 's', 's', ' '],
    argInvalid: ['<', 'a', 'r', 'g', '>'],
    includeInvalid: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', '>'],
    ifInvalid: ['<', 'i', 'f', '>'],
    loopInvalid: ['<', 'l', 'o', 'o', 'p', '>'],
    unlessInvalid: ['<', 'u', 'n', 'l', 'e', 's', 's', '>'],
    carg: ['<', '/', 'a', 'r', 'g', '>'],
    cinclude: ['<', '/', 'i', 'n', 'c', 'l', 'u', 'd', 'e', '>'],
    cif: ['<', '/', 'i', 'f', '>'],
    cloop: ['<', '/', 'l', 'o', 'o', 'p', '>'],
    cunless: ['<', '/', 'u', 'n', 'l', 'e', 's', 's', '>']
  },
  secondary: {
    elseif: ['<', 'e', 'l', 's', 'e', 'i', 'f', ' '],
    else: ['<', 'e', 'l', 's', 'e', '>'],
    elseunless: ['<', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', ' '],
    celseif: ['<', '/', 'e', 'l', 's', 'e', 'i', 'f', '>'],
    celse: ['<', '/', 'e', 'l', 's', 'e', '>'],
    celseunless: ['<', '/', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', '>']
  }
}

function render (template, model, callback) {
  model = Object.assign({}, model) // make a copy of the model

  // ensure template is a string
  if (typeof template !== 'string') {
    if (teddy.params.verbosity > 1) {
      teddy.console.warn('teddy.render attempted to render a template which is not a string.')
    }
    return ''
  }

  let consoleErrors = ''
  let renderedTemplate

  // overload console logs
  consoleWarnings = ''
  consoleErrors = ''

  // express.js support
  // if (model.settings && model.settings.views) {
  //   teddy.params.templateRoot = path.resolve(model.settings.views)
  // }

  // remove templateRoot from template name if necessary
  // if (template.slice(teddy.params.templateRoot.length) === teddy.params.templateRoot) {
  //   template = template.replace(teddy.params.templateRoot, '')
  // }

  // append extension if not present
  if (template.slice(-5) !== '.html') {
    template += '.html'
  }
  
  template = compile(template) // read file

  // Parse and return template
  renderedTemplate = scanTemplate([...template], model)

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

// Read Teddy template file
function compile (template) {
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
    if (templates[template]) {
      template = templates[template]
      register = true
    }
  }

  if (register) {
    templates[name] = template
    return template
  } else {
    return template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
  }
}

// Scan template file
function scanTemplate(templateArray, model) {
  var renderedTemplate = ''

  while (templateArray[0]) {
    if (!endParse) {
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
            let primaryTag = detectTeddyPrimaryTag(templateArray, TEDDY_TAGS.primary)
            switch (primaryTag) {
              case 'if':
              case 'unless':
                templateArray = parseConditional(templateArray, primaryTag, model)
                break
              case 'include':
                templateArray = parseInclude(templateArray, model)
                break
              case 'loop':
                templateArray = parseLoop(templateArray, model)
                break
              case 'one-line-if':
                templateArray = parseOneLineIf(templateArray, model)
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


// Parse <if> <unless> <elseif> <elseunless> <else>
function parseConditional (statement, type, model) {
  var currentClosingTag = TEDDY_TAGS.primary['c' + type] // </if> </unless>
  var currentOpenTag = TEDDY_TAGS.primary[type] // <if> <unless> <elseif> <elseunless>
  var closingElseTag = TEDDY_TAGS.secondary.celse // </else>

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
        currentOpenTag = TEDDY_TAGS.secondary['else' + type]
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
      if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.if.length), TEDDY_TAGS.primary.if) || twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.unless.length), TEDDY_TAGS.primary.unless)) {
        nested++
      }
      // Closing <if> tag
      else if (twoArraysEqual(statement.slice(i, i + currentClosingTag.length), currentClosingTag) || (twoArraysEqual(statement.slice(i, i + closingElseTag.length), closingElseTag) && nested > 0)) {
        if (nested > 0) {
          nested--
        }
        else if (eocList.length < 1) {
          eocList.push([i]) // important indices
          currentClosingTag = TEDDY_TAGS.secondary['celse' + type]
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
      else if (twoArraysEqual(statement.slice(i, i + currentOpenTag.length), currentOpenTag)) {
        readingConditional = true
        i += currentOpenTag.length -1
      } 
      // Opening <else> tag
      else if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.secondary.else.length), TEDDY_TAGS.secondary.else) && nested < 1) {
        bocList.push([i + TEDDY_TAGS.secondary.else.length]) // important indices
      }
    }
  }

  // Evaluate conditionals
  for (let i = 0; i < conditionList.length; i++) {
    if (evaluateCondition(conditionList[i], model)) {
      if (eocList.length === 1) {
        return [...statement.slice(bocList[0][0], eocList[0][0]), ...statement.slice(eocList[0][0]+TEDDY_TAGS.primary['c' + type].length)]
      } else {
        return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
      }
    }
  }

  if (eocList.length === 1) {
    return [...statement.slice(eocList[0][0]+TEDDY_TAGS.primary['c' + type].length)]
  } else {
    return [...statement.slice(bocList[bocList.length-1][0], eocList[eocList.length-1][0]), ...statement.slice(eocList[eocList.length-1][1])]
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
  for (let i = TEDDY_TAGS.primary.loop.length; i < statement.length; i++) {
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
      if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.loop.length), TEDDY_TAGS.primary.loop)) {
        nested++
        isNested = true
      } else if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.cloop.length), TEDDY_TAGS.primary.cloop)) {
        if (nested > 0) {
          nested--
        } else {
          eol = i
          break
        }
      } else if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.if.length), TEDDY_TAGS.primary.if)) {
        containsTag = true
      } else if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.unless.length), TEDDY_TAGS.primary.unless)) {
        containsTag = true
      } else if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.include.length), TEDDY_TAGS.primary.include)) {
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
  endOfStatement = statement.slice(eol+TEDDY_TAGS.primary.cloop.length)
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
    return [...statement.slice(eol + TEDDY_TAGS.primary.cloop.length)]
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

  // 
  let includeArgs = []
  let includeArg = {
    name: '',
    value: '',
    start: 0,
    end: 0
  }

  // Get HTML source from include tag
  for (let i = TEDDY_TAGS.primary.include.length; i < statement.length; i++) {
    if (statement[i] === '>') {
      startInclude = i + 1
      break
    }
    srcName += statement[i]
  }

  // Clean src name so we can read it
  if (srcName.indexOf('src=') >= 0) {
    srcName = srcName.slice(5, srcName.length - 1)

    if (srcName.slice(-5) !== '.html') {
      srcName += '.html'
    }
  }

  includeTemplate = [...fs.readFileSync('html/' + srcName, 'utf8')]

  // Read contents of <include> tag
  for (let i = startInclude; i < statement.length; i++) {
    if (inArg) {
      // Get include argument value
      if (includeArg.start > 0) {
        if (statement[i] === '<' && twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.carg.length), TEDDY_TAGS.primary.carg)) {
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
    else if (statement[i] === '<' && twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.arg.length), TEDDY_TAGS.primary.arg)) {
      inArg = true
      i += 4
    }
    else if (statement[i] === '<' && statement[i + 1] === '/' && twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.cinclude.length), TEDDY_TAGS.primary.cinclude)) {
      endInclude = i + TEDDY_TAGS.primary.cinclude.length
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
      if (statement[i] === ' ' && (statement[i-1] === '"' || statement[i-1] === "'")) {
        readingConditions = true
        readingLiteral = false
        condition.varLiteral = condition.varLiteral.slice(1, -1)
      } else {
        condition.varLiteral += statement[i]
      }
    } else if (readingConditions) {
      // Get first condition
      if (statement[i] === ' ') {
        if (conditionText[0] === 't') {
          condition.true = conditionText.slice(6, -1)
        } else {
          condition.false = conditionText.slice(7, -1)
        }
        conditionText = ''
      }
      // Get second condition
      else if (statement[i] === '>') {
        if (conditionText[0] === 't') {
          condition.true = conditionText.slice(6, -1)
        } else {
          condition.false = conditionText.slice(7, -1)
          console.log('hello')
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
        return insertValue(myTemplate, myModel[varName], 0, i+1)
      } else {
        return myTemplate
      }
    } else {
      varName += myTemplate[i]
    }
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
  

// handles absolute value teddy statements <if {|true|}> 
function resolveAbsTeddyValue (myTemplate) {
  let realVal = ''
  let readyToSplit = false

  for (let i = 2; i < myTemplate.length; i++) {
    if (myTemplate[i] === '|' && myTemplate[i+1] === '}') {
      if (realVal === 'true') {
        readyToSplit = true
      } else {
        readyToSplit = false
      }
    } else {
      realVal += myTemplate[i]
    }
  }
}

module.exports = render