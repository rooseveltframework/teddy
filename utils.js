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

      if (i === l - 1) { // Reached the end of our teddy variable reference
        if (tempValue) {
          tempValue = tempValue[tempName]
        } else {
          tempValue = model[tempName]
        }
      }
    }
  }

  if (tempValue || tempValue === 0 || tempValue === '' || tempValue === false) {
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
        if (tempValue[0] === '{') {
          if ('{' + tempName + '}' === model[tempValue.replace('{', '').replace('}', '')]) {
            return '{' + tempName + '}' // short-circuit infinitely-referencing variables
          }
          if (getTeddyVal(tempValue, model, false) === '{' + tempValue + '}') {
            return true // it looks like a teddy variable, but it doesn't resolve to one, so just return true
          }
        }
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

  if (typeof value === 'object') { // Cannot escape on this value
    if (!value) {
      return false // it is otherwise falsey
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        return false // empty arrays are falsey
      } else {
        return '[Array]' // print that it is an array with content in it, but do not print the contents
      }
    }
    return '[Object]' // just print that it is an object, do not print the contents
  } else if (value === undefined) { // Cannot escape on this value
    return false // undefined is falsey
  } else if (typeof value === 'boolean' || typeof value === 'number') { // Cannot escape on these values
    return value // if it's already a boolean or a number just return it
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

/* matchRecursive
  * accepts a string to search and a format (start and end tokens separated by "...").
  * returns an array of matches, allowing nested instances of format.
  *
  * examples:
  *   matchRecursive("test",          "(...)")   -> []
  *   matchRecursive("(t(e)s)()t",    "(...)")   -> ["t(e)s", ""]
  *   matchRecursive("t<e>>st",       "<...>")   -> ["e"]
  *   matchRecursive("t<<e>st",       "<...>")   -> ["e"]
  *   matchRecursive("t<<e>>st",      "<...>")   -> ["<e>"]
  *   matchRecursive("<|t<e<|s|>t|>", "<|...|>") -> ["t<e<|s|>t"]
  *
  * (c) 2007 Steven Levithan <stevenlevithan.com>
  * MIT License
  *
  * altered for use within teddy
  */
function matchRecursive () {
  const formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/
  const metaChar = /[-[\]{}()*+?.\\^$|,]/g

  function escape (str) {
    return str.replace(metaChar, '\\$&')
  }

  return function (str, format) {
    const p = formatParts.exec(format)
    const results = []
    const opener = p[1]
    const closer = p[2]
    let matchStartIndex
    let openTokens

    // use an optimized regex when opener and closer are one character each
    const iterator = new RegExp(format.length === 5 ? '[' + escape(opener + closer) + ']' : escape(opener) + '|' + escape(closer), 'g')

    do {
      openTokens = 0
      let match
      while (match = iterator.exec(str)) { // eslint-disable-line
        if (match[0] === opener) {
          if (!openTokens) {
            matchStartIndex = iterator.lastIndex
          }
          openTokens++
        } else if (openTokens) {
          openTokens--
          if (!openTokens) {
            results.push(str.slice(matchStartIndex, match.index))
          }
        }
      }
    }
    while (openTokens && (iterator.lastIndex = matchStartIndex))

    return results
  }
}

function replaceNonRegex (str, find, replace) {
  if (typeof str === 'string') {
    return str.split(find).join(replace)
  } else {
    console.error('teddy: replaceNonRegex passed invalid arguments.')
  }
}

// Applies noparse logic to a teddy var value (ex: {varName|p})
function noParseFlag (value) {
  const vars = matchRecursive(value, '{...}')
  const varsLength = vars.length
  for (let i = 0; i < varsLength; i++) {
    value = replaceNonRegex(value, '{' + vars[i] + '}', '{~' + vars[i] + '~}')
  }
  return `{~${value}~}`
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
    } else if (currentChar === ' ' || currentChar === '\n' || currentChar === '\r') { // possible oneline-if
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
  const l = charList.length - 2 // Loop at start of comment content

  for (i = l; i > 0; i--) {
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
  matchRecursive,
  replaceNonRegex,
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
