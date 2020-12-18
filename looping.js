const { twoArraysEqual, validEndingTag, getTeddyVal, insertValue } = require('./utils')
const { tagLengths, primaryTags } = require('./constants')
const { scanTemplate } = require('./scanTemplate')

// Parse looping teddy tags (i.e <loop through='list' val='item'>)
function parseLoop (charList, model, passes, endParse, fs, contextModels, currentContext) {
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
  let inComment = false // boolean to determine whether loop in assessing a teddy comment
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
    } else if (currentChar === '>' && (teddyName.length > 6 && typeof sol === 'undefined')) { // End of opening <loop>
      if (teddyName.slice(0, 3) === 'key') { // params.key
        params.key = teddyName.slice(5, teddyName.length - 1)
      } else if (teddyName.slice(0, 3) === 'val') { // params.val
        params.val = teddyName.slice(5, teddyName.length - 1)
      }
      sol = i // Save index location of '>' of <loop> tag
      teddyName = ''
    } else if (currentChar === '<') { // Found either an HTML tag or teddy tag
      if (twoArraysEqual(charList.slice(i - tagLengths.loop + 1, i + 1), primaryTags.loop) && !inComment) { // Found a nested <loop>
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
        const nextTag = charList.lastIndexOf('>', i - 1)
        i = nextTag + 1
      } else if (twoArraysEqual(charList.slice(i - tagLengths.unless + 1, i + 1), primaryTags.unless)) { // Found <unless>
        containsTag = true
        const nextTag = charList.lastIndexOf('>', i - 1)
        i = nextTag + 1
      } else if (twoArraysEqual(charList.slice(i - tagLengths.include + 1, i + 1), primaryTags.include)) { // Found <include>
        containsTag = true
        const nextTag = charList.lastIndexOf('>', i - 1)
        i = nextTag + 1
      } else if (charList.slice(i - 23, i).join('').includes('-fi ')) { // Found one line if
        containsTag = true
      }
    } else if (currentChar === '{' && charList[i - 1] === '!') { // Found start of teddy server side comment
      inComment = true
    } else if (currentChar === '!' && charList[i - 1] === '}') { // Found end of teddy server side comment
      inComment = false
    } else { // Get all <loop> attributes and their declared values
      if (currentChar.match(/\s/)) continue // skip whitespace
      if (!sol && Object.keys(params).length < 3 && (!Object.keys(params).includes('val') || !Object.keys(params).includes('key'))) { // Make sure we end up with params.through, params.val (optional), params.key (optional)
        teddyName += currentChar
      }
    }
  }

  const endOfClosingTag = charList.lastIndexOf('>', eol)
  const endOfStatement = charList.slice(0, endOfClosingTag) // Rest of the template array after the <loop>
  slicedTemplate = charList.slice(eol + 1, sol) // Contents of <loop>

  // Get object values/keys
  if (params.through) {
    periodIndex = params.through.indexOf('.')

    // <loop through='list' key='index' val='value'>
    if (periodIndex < 0) { // Loop through value is not an object
      if (model[params.through]) { // Loop through non-object value requires context
        through = model[params.through]
      } else { // Loop through non-object value does not require context
        const contextResult = findContext(params.through, { contextModels, currentContext })
        context = contextResult.context
        contextModels = contextResult.contextModels
        currentContext = contextResult.currentContext
        through = getContext(model, context, params.through)
      }
    } else { // Loop through value is an object
      if (model[params.through.slice(0, periodIndex)] === undefined) { // Loop through object value requires context
        const contextResult = findContext(params.through, { contextModels, currentContext })
        context = contextResult.context
        contextModels = contextResult.contextModels
        currentContext = contextResult.currentContext
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
              if (teddyString === '') {
                teddyString = ' ' // Temporary workaround; we don't want it to print the variable name
              }
              // TODO: handle when typeof vals[i] is an object or an array
              // if the val is an object or an array, it needs to be possible to loop through it
              // https://github.com/rooseveltframework/teddy/issues/404
              // if (typeof vals[i] === 'string') {
              // // teddyString = `${vals[i]}`
              // if (teddyString === '') {
              // // teddyString = ' ' // Temporary workaround; we don't want it to print the variable name
              // } else {
              // // handle it here
              // }
            } else if (teddyName === params.key) { // {var} name read is a key
              teddyString = `${keyVals[i]}`
            } else if (teddyName.indexOf('.') >= 0 && (teddyName.slice(0, teddyName.indexOf('.')) === params.val)) { // {var.next} name read is a val that is an object
              teddyString = getTeddyVal(teddyName.slice(teddyName.indexOf('.') + 1), vals[i]).toString()

              // If getTeddyVal did not resolve to anything in the model, continue on
              if (teddyString.slice(1, teddyString.length - 1) === teddyName.slice(teddyName.indexOf('.') + 1)) {
                teddyString = ''
              }
            }
            // Replace teddy variable name with actual value
            if (teddyString !== '' && teddyString !== 'undefined') {
              if (teddyString === ' ') {
                teddyString = '' // Undoing temporary workaround set above
              }
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
        const result = scanTemplate(slicedTemplate, modifiedModel, false, passes, fs, false, currentContext, contextModels)
        slicedTemplate = result.template.split('').reverse().join('')
        passes = result.passes

        modifiedStatement = slicedTemplate + modifiedStatement
        parsedTags = true
      } else {
        modifiedStatement = slicedTemplate.join('') + modifiedStatement
      }

      // Reset template back to a copy
      slicedTemplate = charList.slice(eol + 1, sol)

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
    return { template: [...charList.slice(0, endOfClosingTag)], passes, endParse, currentContext, contextModels }
  }

  // In cases of very large datasets, we use the global endParse var to save time (since it will go character by character)
  if (modifiedStatement.length > 49999 && endOfStatement.length <= 1 && (parsedTags || (!containsTag && !containsComment))) {
    endParse = true
  }

  // Return template with loop parsed
  return { template: [...endOfStatement, ...modifiedStatement], endParse, passes, currentContext, contextModels }
}

// Finds correct context for a nested loop
function findContext (str, { contextModels, currentContext }) {
  for (let i = 0; i < contextModels.length; i++) {
    if (str.indexOf(contextModels[i][0]) > -1) {
      currentContext = contextModels[i] // save required context from list
      contextModels.splice(i, 1) // remove current context from list
      return { context: currentContext[1], currentContext, contextModels }
    }
  }
  return { currentContext, contextModels }
}

// Gets contextual value from model
function getContext (model, str, thru) {
  let currentValue
  let tempStr = ''
  let tempIndex = ''
  let getIndex = false

  if (str) { // Looking for context
    for (let i = 0; i < str.length; i++) { // Found index
      if (getIndex) { // Get numerical index to select from
        if (str[i] === ']') {
          if (currentValue[tempIndex]) { // We can get value from the index
            currentValue = currentValue[tempIndex]
          } else { // Need to convert object values into list to get current value from index
            currentValue = Object.values(currentValue)[tempIndex]
          }
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
  } else { // Return undefined in case there is no context (should ignore loop with invalid through attribute)
    return undefined
  }

  // Contains contextual value to loop through
  if (currentValue[thru]) {
    return currentValue[thru]
  } else { // Contextual value came from an array of arrays
    return currentValue
  }
}

module.exports = { parseLoop }
