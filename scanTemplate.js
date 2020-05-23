const { removeTeddyComment, noParseTeddyVariable, getValueAndReplace, validEndingTag, findTeddyTag, twoArraysEqual, parseNoTeddy } = require('./utils')
const { primaryTags, tagLengths } = require('./constants')
const { teddyConsole, params } = require('./index')

module.exports = { scanTemplate }

// Scan template file and return a usable HTML document
function scanTemplate (charList, model, escapeOverride, passes, fs, endParse, currentContext, contextModels) {
  var maxPasses = params.maxPasses
  var maxPassesError = 'Render aborted due to max number of passes (' + maxPasses + ') exceeded; there is a possible infinite loop in your template logic.'
  var renderedTemplate = ''

  while (charList[0]) {
    if (!endParse) {
      // Return an error if in infinite loop
      if (passes >= maxPasses) {
        if (params.verbosity) {
          teddyConsole.error(maxPassesError)
        }
        return { template: maxPassesError, passes }
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

          // continue through the parsing switch if the "beginning" of the charList is a teddy noparse "{~ ~}". Otherwise break
          if (charList[charList.length - 1] === '{' && charList[charList.length - 2] === '~') {
            continue
          } else {
            break
          }
        case '<': // Teddy/HTML tag
          if (charList[charList.length - 2] === '/') { // Closing template tag
          } else {
            // Find out if the tag we hit is a teddy tag
            const primaryTag = findTeddyTag(charList, primaryTags)
            switch (primaryTag) {
              case 'if':
              case 'unless': {
                const { parseConditional } = require('./conditionals')
                charList = parseConditional(charList, primaryTag, model)
                continue
              }
              case 'include': {
                const { parseInclude } = require('./includes')
                const result = parseInclude(charList, model, passes, fs, endParse, currentContext, contextModels)
                endParse = result.endParse
                charList = result.template
                currentContext = result.currentContext
                contextModels = result.contextModels
                passes = result.passes
                passes++
                continue
              }
              case 'loop': {
                const { parseLoop } = require('./looping')
                const result = parseLoop(charList, model, passes, endParse, fs, contextModels, currentContext)
                charList = result.template
                endParse = result.endParse
                currentContext = result.currentContext
                contextModels = result.contextModels
                passes = result.passes
                continue
              }
              case 'one-line-if': {
                const { parseOneLineIf } = require('./conditionals')
                charList = parseOneLineIf(charList, model)

                // Evaluate again when multiple oneline-ifs
                while (findTeddyTag(charList, primaryTags) === 'one-line-if') {
                  charList = parseOneLineIf(charList, model)
                }
                break
              }
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
  return { template: renderedTemplate, passes, endParse, currentContext, contextModels }
}
