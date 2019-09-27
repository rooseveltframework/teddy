var fs = require('fs')
var path = require('path')
var utils = require('./utils')

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
    if: ['<', 'i', 'f', ' '],
    loop: ['<', 'l', 'o', 'o', 'p', ' '],
    unless: ['<', 'u', 'n', 'l', 'e', 's', 's', ' '],
    includeInvalid: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', '>'],
    ifInvalid: ['<', 'i', 'f', '>'],
    loopInvalid: ['<', 'l', 'o', 'o', 'p', '>'],
    unlessInvalid: ['<', 'u', 'n', 'l', 'e', 's', 's', '>'],
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
  let removeAgain = false
  var replaceOperation

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

  var templateArray = [...template]
  var renderedTemplate = ''

  while (templateArray[0]) {
    if (!endParse) {
      switch (templateArray[0]) {
        case '{': // Detects teddy curly bracket (comment or variable)
          removeAgain = false
          if (templateArray[1] === '!') {
            templateArray = removeTeddyComment(templateArray)
          } else if (templateArray[1] === '|') { // Other logic

          }
          break
        case '<': // Teddy/HTML tag
          removeAgain = false
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
            }
          }
          break
      }
      
      if (templateArray[0].search(/^[0-9a-zA-Z]+$/) === 0) {
        removeAgain = false
      }

      if (removeAgain || ((templateArray[0] === '\n' || templateArray[0] === ' ') && (templateArray[1] === '\n' || templateArray[1] === ' ' || templateArray[1] === '<' || (templateArray[1] === '{' && templateArray[2] === '!')))) {
        removeAgain = true
      } else {
        renderedTemplate += templateArray[0]
        removeAgain = false
      }
      templateArray.shift()
    } else {
      renderedTemplate = templateArray.join('')
      endParse = false
      break
    }
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

// Parse <if> <unless> <elseif> <elseunless> <else>
function parseConditional (statement, type, model) {
  var currentClosingTag = TEDDY_TAGS.primary['c' + type] // </if> </unless>
  var currentOpenTag = TEDDY_TAGS.primary[type] // <if> <unless> <elseif> <elseunless>
  var closingElseTag = TEDDY_TAGS.secondary.celse // </else>

  // Primary variables
  var condition =  {
    type: type,
    text: '',
  }
  var varList = []
  var conditionList = []
  var bocList = []
  var eocList = []
  var nested = 0
  var teddyVarName = ''
  var teddyVarExpected = ''
  var conditionText = ''
  var readingConditional = true // start parsing by reading first <if> statement
  var readMode = false          // start parsing equality condition (ex: <if something='here'>)

  // Look for begin/end of conditionals
  for (let i = 0; i < statement.length; i++) {
    if (readingConditional) {
      for (let j = i + currentOpenTag.length; j < statement.length; j++) {
        if (statement[j] === ' ' || statement[j] === ':') {
          if (teddyVarName === 'or' || teddyVarName === 'and' || teddyVarName === 'xor' || teddyVarName === 'not') {
            condition.operator = teddyVarName
          } else {
            varList.push({
              name: teddyVarName
            })
          }
          teddyVarName = ''
        }
        else if (statement[j] === '>') { 
          // Push teddy var to list of teddy vars
          varList.push({
            name: teddyVarName,
            expected: (teddyVarExpected === '') ? undefined : teddyVarExpected.slice(2, teddyVarExpected.length-1)
          })

          // push to list of all conditionals
          condition.text = conditionText
          condition.variables = varList
          conditionList.push(condition)

          // Reset important lists
          varList = []
          conditionText = ''
          teddyVarName = ''
          teddyVarExpected = ''
          condition = {
            type: type,
            text: ''
          }
          readMode = false
          readingConditional = false
          
          bocList.push([j+1])
          currentOpenTag = TEDDY_TAGS.secondary['else' + type]
          i = j
          break
        }
        else {
          // begin reading literal value
          if (statement[j] === '=' && (statement[j+1] === '\'' || statement[j+1] === '"')) {
            readMode = true
          } 
          // stop reading literal value
          else if ((statement[j] === '\'' || statement[j] === '"') && statement[j+1] === ' ') {
            readMode = false
          }

          // read teddy var names and values
          if (readMode) {
            teddyVarExpected += statement[j]
          } else {
            teddyVarName += statement[j]
          }
        }
        conditionText += statement[j]
      }
    }
    // found tag
    else if (statement[i] === '<') {
      // nested <if> or <unless>
      if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.if.length), TEDDY_TAGS.primary.if) || twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.primary.unless.length), TEDDY_TAGS.primary.unless)) {
        nested++
      }
      // Closing <if> tag
      else if (twoArraysEqual(statement.slice(i, i + currentClosingTag.length), currentClosingTag)) {
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
      else if (twoArraysEqual(statement.slice(i, i + closingElseTag.length), closingElseTag)) {
        eocList.push([i, i + closingElseTag.length]) // important indices
        break
      }
      // Opening <elseif> or <elseunless> tag
      else if (twoArraysEqual(statement.slice(i, i + currentOpenTag.length), currentOpenTag)) {
        readingConditional = true
        i--
      } 
      // Opening <else> tag
      else if (twoArraysEqual(statement.slice(i, i + TEDDY_TAGS.secondary.else.length), TEDDY_TAGS.secondary.else)) {
        bocList.push([i + TEDDY_TAGS.secondary.else.length]) // important indices
      }
    }
  }

  // Evaluate conditionals
  for (let i = 0; i < conditionList.length; i++) {
    teddyValue = model[conditionList[i].variables[0].name]
    teddyExpected = conditionList[i].variables[0].expected
    switch (conditionList[i].operator) {
      case 'or':
        if (model[conditionList[i].variables[0].name] || model[conditionList[i].variables[1].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        } else if (conditionList[i].type === 'unless' && (!model[conditionList[i].variables[0].name] || !model[conditionList[i].variables[1].name])) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        }
        break
      case 'and':
        if (model[conditionList[i].variables[0].name] && model[conditionList[i].variables[1].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        } else if (conditionList[i].type === 'unless' && !model[conditionList[i].variables[0].name] && !model[conditionList[i].variables[1].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        }
        break
      case 'xor': // (WIP for unless)
        if (model[conditionList[i].variables[0].name] && model[conditionList[i].variables[0].name]) {
        } else if (model[conditionList[i].variables[0].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        } else if (model[conditionList[i].variables[1].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        }
        break
      case 'not':
        if (!model[conditionList[i].variables[0].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        } else if (conditionList[i].type === 'unless' && model[conditionList[i].variables[0].name]) {
          return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
        }
        break
      default: // (WIP for unless)
        if (conditionList[i].variables[0].expected) {
          if (model[conditionList[i].variables[0].name] === conditionList[i].variables[0].expected) {
            return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
          }
        } else {
          if (conditionList[i].type === 'if' && model[conditionList[i].variables[0].name]) {
            if (eocList.length === 1) {
              return [...statement.slice(bocList[0][0], eocList[0][0]), ...statement.slice(eocList[0][0]+TEDDY_TAGS.primary['c' + type].length)]
            } else {
              return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
            }
          } else if (conditionList[i].type === 'unless' && !model[conditionList[i].variables[0].name]) {
            if (eocList.length === 1) {
              return [...statement.slice(bocList[0][0], eocList[0][0]), ...statement.slice(eocList[0][0]+TEDDY_TAGS.primary['c' + type].length)]
            } else {
              return [...statement.slice(bocList[i][0], eocList[i][0]), ...statement.slice(eocList[eocList.length-1][1])]
            }
          }
        }
    }
  }

  return [...statement.slice(bocList[bocList.length-1][0], eocList[eocList.length-1][0]), ...statement.slice(eocList[eocList.length-1][1])]
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
              slicedStatement = insertValue(slicedStatement, teddyString, sov, j)
              // Recalibrate iterator based on length of inserted model value (if necessary)
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
      modifiedStatement += slicedStatement.join('')

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

  if (modifiedStatement.length > 49999 && endOfStatement.length === 1 && !containsTag && !containsComment) {
    endParse = true
  }

  // Return template with loop parsed
  return [...modifiedStatement, ...endOfStatement]
}

// Parse <include>
// function parseInclude (statement, model) {
//   let getSrc = false
//   let srcName = ''
//   for (let i = TEDDY_TAGS.primary.include.length; i < statement.length; i++) {
//     if (statement[i] === '>') {
//     }
//     srcName += statement[i]
//   }
// }

// Returns teddy primary tag name
function detectTeddyPrimaryTag (charList, tags) {
  let type = 'unknown'
  let keys = Object.keys(tags)
  let currentTag

  for (let i = 0; i < keys.length; i++) {
    currentTag = tags[keys[i]]
    if (twoArraysEqual(currentTag, charList.slice(0, currentTag.length))) {
      if (keys[i].indexOf('Invalid') > -1) {
        type = keys[i].slice(0, keys[i].indexOf('Invalid'))
      } else {
        type = keys[i]
      }
      break
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
  return [...str.slice(0, start), ...val, ...str.slice(end + 1)]
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