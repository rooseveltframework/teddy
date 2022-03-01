const { primaryTags, secondaryTags, tagLengths } = require('./constants')
const { getTeddyVal, twoArraysEqual, validEndingTag, isValue, insertValue } = require('./utils')

function parseConditional (charList, type, model) {
  let i // Template index
  let j // Comment index
  const l = charList.length // Length of template array

  let currentChar // Current character in our template array
  let tagStart = l - 1 // Index of '<' for the beginning of our conditional
  let readingConditional = true // Start parsing contents of <if> <elseif> <unless> <elseunless> tags
  let readMode = false // Start parsing literal equality condition (ex: <if something='here'>)
  let outsideTags = false // Flag telling us we are inbetween condition tags
  let isNested = false // Extra check for whether or not the nested condition also has an <else>
  let sawOpeningElseFirst = false // Tracks if an <else> tag gets opened and prevents the closing tag from being skipped by nesting logic
  let nested = 0 // Keeps track of how many nested conditionals are present
  let teddyVarName = '' // Teddy conditional argument name or operator used (i.e: or, and, xor, not)
  let teddyVarExpected = '' // Literal value for a conditional teddy argument (i.e: <if something='some content'>)
  let condition = {
    type: type // <if> <unless>
  }

  const boc = [] // Array of 2-length lists that contain the relevant indices for an open conditional tag [<, >]
  const eoc = [] // Array of 2-length lists that contain the relevant indices for a closing conditionaltag [<, >]
  const conditions = [] // List of objects containing all operators, variables and type of conditional (if or unless)
  let varList = [] // List of objects containing relevant information about our conditions arguments
  let operators = [] // List of operators used in a single conditional statement
  const commentList = [] // Array of 2-length lists that contain the start/end indices for template comments inbetween conditionals
  let commentIndices = [] // 2-length list containing start/end indices for template comments inbetween conditionals

  const currentOpenTag = primaryTags[type] // <if> <unless> <elseif> <elseunless>

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
      } else if (validEndingTag(charList, i) && (twoArraysEqual(charList.slice(i - tagLengths.cif + 1, i + 1), primaryTags.cif) || twoArraysEqual(charList.slice(i - tagLengths.cunless + 1, i + 1), primaryTags.cunless))) { // Closing <if> tag
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
          sawOpeningElseFirst = true // Forces the </else> to render regardless of nested conditional tags within
        }
      } else if (validEndingTag(charList, i) && twoArraysEqual(charList.slice(i - tagLengths.celse + 1, i + 1), secondaryTags.celse) && nested < 1) { // </else> tag
        if (isNested && !sawOpeningElseFirst) { // skip </else> tag for a nested condition
          isNested = false
        } else { // Push [start, end] indices of </else> to list
          const endOfClosingTag = charList.lastIndexOf('>', i)
          eoc.push([i, endOfClosingTag])
          sawOpeningElseFirst = false
          break
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
      if (currentChar === ' ' || currentChar === '\n' || currentChar === '\r') {
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
      if ((currentChar === ' ' || currentChar === '\n' || currentChar === '\r') && (conditionLiteral[conditionLiteral.length - 1] === '"' || conditionLiteral[conditionLiteral.length - 1] === "'" || conditionLiteral[conditionLiteral.length - 1] === '}')) {
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
      if ((currentChar === ' ' || currentChar === '\n' || currentChar === '\r') && (charList[i + 1] === currentQuote || charList[i + 1] === ' ' || charList[i + 1] === '\n' || charList[i + 1] === '\r')) {
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
    } else if ((currentChar === ' ' || currentChar === '\n' || currentChar === '\r') && twoArraysEqual(charList.slice(i - 3, i), primaryTags.olif)) { // Possible beginning for oneline-if
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
    // Cases for when there isn't a condition.varLiteral value
    // case 1: `false` literal or variable not present in model (resolving to var name within brackets, ex: {notInModel}) -> insert false condition
    // case 2: non-empty string present in model or `true` literal -> insert true condition
    if (varVal === false || (varVal[0] === '{' && varVal[varVal.length - 1] === '}')) {
      return insertValue(charList, condition.false.split('').reverse().join(''), startIndex, endIndex)
    } else {
      return insertValue(charList, condition.true.split('').reverse().join(''), startIndex, endIndex)
    }
  }
}

// Parse logic within our teddy tag and return true or false
function evalCondition (condition) {
  const isIf = (condition.type === 'if') // Determines if the returning value should be negated in the case of an <unless>
  let partialCondition

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
  const operator = condition.operators.shift() // Next operator in conditional tag
  const var1 = condition.variables.shift() // Next teddy argument in conditional tag
  let var2 // Second value to compare against

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

module.exports = {
  parseConditional,
  parseOneLineIf
}
