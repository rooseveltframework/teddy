const { primaryTags, tagLengths } = require('./constants')
const { getTeddyVal, validEndingTag, twoArraysEqual, insertValue } = require('./utils')
const { scanTemplate } = require('./scanTemplate')
const { params } = require('./index')

// Parse <include src='myTemplate.html'>
function parseInclude (charList, model, passes, fs, endParse, currentContext, contextModels) {
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

  const { compile } = require('./index')

  // Parse <include> src
  includeTemplate = compile(src, fs).split('').reverse()

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
    } else {
      const nextTag = charList.lastIndexOf('<', i - 1)
      if (nextTag !== -1) {
        i = nextTag + 1
      } else {
        break
      }
    }
  }

  // Actions that do not require parsing includeTemplate
  if (includeTemplate.length === src.length - 5) { // Could not find src file
    return { template: charList.slice(0, endInclude + 1), passes }
  } else if (noParseFlag) { // noparse in <include>, returns {~includeTemplate~}
    return { template: insertValue(charList, [...`}~${includeTemplate.join('')}~{`], charList.length, endInclude + 1), passes }
  } else if (invalidArg) { // <include> uses invalid use of <arg>
    return { template: charList.slice(0, endInclude + 1), passes }
  } else {
    // Add all include arguments to the model copy (only in this scanTemplate call)
    for (const key in includeArgs) {
      if (includeArgs[key] === model[key]) { // Make sure we aren't stuck in a loop,
        passes = params.maxPasses
        inLoop = true
        break
      }
      modifiedModel[key] = includeArgs[key]
    }

    if (!inLoop) {
      const result = scanTemplate(includeTemplate, modifiedModel, true, passes, fs, endParse, currentContext, contextModels)
      includeTemplate = result.template.split('').reverse().join('')
      passes = result.passes
      endParse = result.endParse
      currentContext = result.currentContext
      contextModels = result.contextModels
    }

    // Return parsed include src along with the rest of the template
    return { template: insertValue(charList, includeTemplate, charList.length, endInclude + 1), passes, endParse, currentContext, contextModels }
  }
}

module.exports = { parseInclude }
