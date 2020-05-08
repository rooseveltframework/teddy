const { primaryTags, tagLengths, escapeHtmlEntities } = require('./constants')

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

  if (tempValue || tempValue === '' || tempValue === false) {
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

  // Wrap entire value with "{~ ~}" and return modified value
  return `{~${newValue}~}`
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
  // Remove the content between the start and end
  str.splice(end, start - end)

  const chunkLength = 5000
  const numChunks = Math.ceil(val.length / chunkLength)

  // add the val string in chunks at a time
  for (let i = 0; i < numChunks; i++) {
    const chunk = val.slice(i * chunkLength, i * chunkLength + chunkLength)

    str.splice(end + (i * chunkLength), 0, ...chunk)
  }
  return str
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

      if (varVal[0] === '{' && varVal[1] !== '~') { // Get Teddy variable value within teddy variable value
        if (varVal.indexOf(pName) >= 0) { // Infinitely referencing teddy variables
          break
        } else {
          varVal = getValueAndReplace([...varVal].reverse(), myModel, escapeOverride, `{${varName}}`).reverse().join('')
        }
      }
      return insertValue(charList, [...varVal.toString()].reverse(), charList.length, i) // Replace and return template
    } else { // Get teddy variable name from template
      varName += charList[i]
    }
  }

  return charList
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

// Handles cleaning up all {~content~}
function cleanNoParseContent (rt) {
  return rt.replace(/({~|~})/g, '')
}

module.exports = {
  escapeEntities,
  getTeddyVal,
  noParseFlag,
  noParseTeddyVariable,
  findTeddyTag,
  getValueAndReplace,
  isValue,
  parseNoTeddy,
  validEndingTag,
  removeTeddyComment,
  insertValue,
  twoArraysEqual,
  cleanNoParseContent
}
