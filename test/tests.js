import { execSync } from 'child_process'
import fs from 'fs'

// every fixture in test/templates, by the name a render would ask for it by
function testTemplateNames (dir, base = dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = dir + '/' + entry.name
    if (entry.isDirectory()) testTemplateNames(full, base, found)
    else if (entry.name.endsWith('.html')) found.push(full.slice(base.length + 1, -5))
  }
  return found
}

// these tests are shared by both mocha and playwright
// to skip test groups or individual tests, add `skip: true` to the group or test object
// to test an individual group or test, add `only: true` to the group or test object
// to run a test only in mocha or only in playwright, use `runMocha` or `runPlaywright` instead of `run`
// if multiple results are acceptable, make `expected` an array of strings rather than a string
// to see console output from the client-side tests, go to test/loaders/playwright.js and uncomment the debug code

export default [
  {
    describe: 'Conditionals',
    tests: [
      {
        message: 'should evaluate <if something> as true (conditionals/if.html)',
        template: 'conditionals/if',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        // the arms of a chain are siblings in the document, so what sits between them belongs to the page and is written whichever arm applies. the compiler folds that content into every branch, and content it cannot fold keeps the chain in its other form, so both are worth a test
        message: 'should write markup that sits between the arms of a chain when the opening arm applies (conditionals/ifContentBetweenArms.html)',
        template: 'conditionals/ifContentBetweenArms',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is present</p><p>This sits between the arms and belongs to the page</p>'
      },
      {
        message: 'should write markup that sits between the arms of a chain when a later arm applies (conditionals/unlessContentBetweenArms.html)',
        template: 'conditionals/unlessContentBetweenArms',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>This sits between the arms and belongs to the page</p><p>The variable \'something\' is present</p>'
      },
      {
        message: 'should resolve a {variable} that sits between the arms of a chain (conditionals/ifVariableBetweenArms.html)',
        template: 'conditionals/ifVariableBetweenArms',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is present</p><p>Between the arms: Some content</p>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition (conditionals/ifElse.html)',
        template: 'conditionals/ifElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <if something="Some content"> as true (conditionals/ifValue.html)',
        template: 'conditionals/ifValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable "something" is set to "Some content"</p>'
      },
      {
        message: 'should evaluate <if something="{something}"> as true (conditionals/ifVariable.html)',
        template: 'conditionals/ifVariable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable "something" is set to "Some content"</p>'
      },
      {
        message: 'should evaluate <if emptyArray> as false (conditionals/ifEmptyArray.html)',
        template: 'conditionals/ifEmptyArray',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'emptyArray\' is considered falsey</p>'
      },
      {
        message: 'should evaluate <if something=\'no\'> as false and trigger <else> condition (conditionals/ifElseValue.html)',
        template: 'conditionals/ifElseValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is not set to \'no\'</p>'
      },
      {
        message: 'should evaluate <unless doesntexist> as true (conditionals/unless.html)',
        template: 'conditionals/unless',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <unless something> as false and trigger <else> condition (conditionals/unlessElse.html)',
        template: 'conditionals/unlessElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate conditionals that examine array lengths correctly (conditionals/ifArrayLengthZero.html)',
        template: 'conditionals/ifArrayLengthZero',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>1</p><p>0</p><p>false</p><p>0</p><p>3</p><p>1ispresent</p><p>0ispresent</p><p>emptyArraylengthis0</p><p>populatedArraylengthis3</p>'
      },
      {
        message: 'should evaluate nested <unless> tag in the if (conditionals/unlessNestedIf.html)',
        template: 'conditionals/unlessNestedIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is not present</p> <p>The variable \'anotherdoesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate nested <unless> tag in the else (conditionals/unlessNestedElse.html)',
        template: 'conditionals/unlessNestedElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is present</p> <p>The variable \'anotherdoesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <unless something> as false and trigger <else> condition with comment in between (conditionals/unlessWithComment.html)',
        template: 'conditionals/unlessWithComment',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate nested <unless> tag in the if with a comment in between (conditionals/unlessNestedIfWithComment.html)',
        template: 'conditionals/unlessNestedIfWithComment',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is not present</p> <p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate <unless nullVar> as true (conditionals/unlessNull.html)',
        template: 'conditionals/unlessNull',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'nullVar\' is falsey</p>'
      },
      {
        message: 'should evaluate <unless something=\'Some content\'> as false and trigger <else> condition (conditionals/unlessValue.html)',
        template: 'conditionals/unlessValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is set to \'Some content\'</p>'
      },
      {
        message: 'should evaluate <unless something=\'no\'> as false and trigger <else> condition (conditionals/unlessElseValue.html)',
        template: 'conditionals/unlessElseValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is not set to \'no\'</p>'
      },
      {
        message: 'should evaluate <unless something and notDefined or somethingElse> as false (conditionals/unlessAndOr.html)',
        template: 'conditionals/unlessAndOr',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>should render</p>'
      },
      {
        message: 'should evaluate entire conditional and correctly show HTML comments (conditionals/commentConditional.html)',
        template: 'conditionals/commentConditional',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><!-- COMMENT 1 --><p>The variable \'something\' is present</p><!-- COMMENT 2 --></div>'
      },
      {
        message: 'should evaluate <if something=\'no\'> as false and <elseif somethingElse> as true (conditionals/ifElseIf.html)',
        template: 'conditionals/ifElseIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'somethingElse\' is present</p>'
      },
      {
        message: 'should evaluate <unless something> as false and <elseunless doesntexist> as true (conditionals/unlessElseUnless.html)',
        template: 'conditionals/unlessElseUnless',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should eval <if something=\'no\'> as false and <elseunless something=\'maybe\'> as true (conditionals/ifElseUnless.html)',
        template: 'conditionals/ifElseUnless',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is not set to \'maybe\'</p>'
      },
      {
        message: 'should eval <unless something> as false and <elseif somethingElse> as true (conditionals/unlessElseIf.html)',
        template: 'conditionals/unlessElseIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'somethingElse\' is present</p>'
      },
      {
        message: 'should evaluate <if something and notDefined> as false (conditionals/and.html)',
        template: 'conditionals/and',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>and: false</p>'
      },
      {
        message: 'should evaluate `and` correctly when not using explicit values (conditionals/andImplicit.html)',
        template: 'conditionals/andImplicit',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>should render</p><p>and: false</p><p>and: false</p><p>and: false</p>'
      },
      {
        message: 'should evaluate `and` correctly using explicit values (conditionals/andExplicit.html)',
        template: 'conditionals/andExplicit',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>should render</p><p>should render</p><p>should render</p><p>and: false</p><p>and: false</p><p>and: false</p><p>and: false</p><p>and: false</p>'
      },
      {
        message: 'should evaluate `and` truth table (conditionals/andTruthTable.html)',
        template: 'conditionals/andTruthTable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>and: true true</p>'
      },
      {
        message: 'should evaluate `or` truth table correctly (conditionals/orTruthTable.html)',
        template: 'conditionals/orTruthTable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>or: true true</p><p>or: true false</p><p>or: true false</p><p>or: false true</p><p>or: false false</p><p>or: false true</p><p>or: true false</p><p>or: true true</p><p>or: false false</p><p>or: false false</p><p>or: false false</p>'
      },
      {
        message: 'should evaluate <if something=\'Some content\' or something=\'Nope\'> as true (conditionals/orSameVar.html)',
        template: 'conditionals/orSameVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>or: true</p>'
      },
      {
        message: 'should evaluate <if something xor somethingElse> as false (conditionals/xor.html)',
        template: 'conditionals/xor',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>xor: false</p>'
      },
      {
        message: 'should evaluate xor correctly when not using explicit values (conditionals/xorImplicit.html)',
        template: 'conditionals/xorImplicit',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>xor: false</p><p>should render</p><p>should render</p>'
      },
      {
        message: 'should evaluate xor correctly using explicit values (conditionals/xorExplicit.html)',
        template: 'conditionals/xorExplicit',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>xor: false</p><p>xor: false</p><p>xor: false</p><p>should render</p><p>should render</p>'
      },
      {
        message: 'should evaluate <if something and notDefined or somethingElse> as true (conditionals/andOr.html)',
        template: 'conditionals/andOr',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>and + or: true</p>'
      },
      {
        message: 'should evaluate <if not:something> as false and <if not:noExist> as true (conditionals/not.html)',
        template: 'conditionals/not',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>not: false</p><p>not: true</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true (conditionals/oneLine.html)',
        template: 'conditionals/oneLine',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true (conditionals/oneLineBooleanLogic.html)',
        template: 'conditionals/oneLineBooleanLogic',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-not-present">One line if.</p><p class="something-is-present">One line if.</p><p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-somethingFalse" as false (conditionals/oneLineIfBooleanValue.html)',
        template: 'conditionals/oneLineIfBooleanValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p>'
      },
      {
        message: 'should evaluate one line ifs in loops examining the object member\'s value correctly (conditionals/oneLineInLoop.html)',
        template: 'conditionals/oneLineInLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-present">guy</p><p class="something-is-present">girl</p><p class="something-is-present">landscape</p><p class="something-is-not-present">guy</p><p class="something-is-present">girl</p><p class="something-is-not-present">landscape</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true when attributes are split across multiple lines (conditionals/oneLineNewLine.html)',
        template: 'conditionals/oneLineNewLine',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true in self-closing element (conditionals/oneLineSelfClosing.html)',
        template: 'conditionals/oneLineSelfClosing',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<input class="something-is-present">'
      },
      {
        message: 'should evaluate one line if "if-something" as true when result includes slash (/) characters (conditionals/oneLineWithSlash.html)',
        template: 'conditionals/oneLineWithSlash',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<a href="/something">One line if.</a>'
      },
      {
        message: 'should evaluate one line if "if-something" as true with no false condition supplied (conditionals/oneLineTrueOnly.html)',
        template: 'conditionals/oneLineTrueOnly',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as false even with no false condition supplied (conditionals/oneLineNoFalse.html)',
        template: 'conditionals/oneLineNoFalse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<h2>{content.subTitle}</h2>'
      },
      {
        message: 'should evaluate one line if "if-something=\'Some content\'" as true (conditionals/oneLineValue.html)',
        template: 'conditionals/oneLineValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-value">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something.something={something}" as false and remove attributes (conditionals/oneLineValueVars.html)',
        template: 'conditionals/oneLineValueVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<option value="Some content">Some content</option>'
      },
      {
        message: 'should evaluate one line if "if-something.something={something}" as false and remove attributes (conditionals/oneLineValueVarsNoQuotes.html)',
        template: 'conditionals/oneLineValueVarsNoQuotes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<option value="Some content">Some content</option>'
      },
      {
        message: 'should evaluate <option> elements with the middle one selected (conditionals/oneLineValueVarsLooped.html)',
        template: 'conditionals/oneLineValueVarsLooped',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<option value="1">1</option><option value="2" selected="">2</option><option value="3">3</option>', '<option value="1">1</option><option value="2" selected>2</option><option value="3">3</option>']
      },
      {
        message: 'should evaluate <option> elements with the middle one selected (conditionals/conditionalValueVarsLooped.html)',
        template: 'conditionals/conditionalValueVarsLooped',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<option value="1">1</option><option value="2" selected="">2</option><option value="3">3</option>', '<option value="1">1</option><option value="2" selected>2</option><option value="3">3</option>']
      },
      {
        message: 'should evaluate one line if "if-something=\'Some content\'" as true and still add the id attribute regardless of the if statement outcome (conditionals/oneLineValueWithAdditionalAttributesNotImpactedByIf.html)',
        template: 'conditionals/oneLineValueWithAdditionalAttributesNotImpactedByIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<p id="someId" class="something-is-present">One line if.</p><p id="someId">One line if.</p><p id="someId" disabled="">One line if.</p><option value="3" selected="">One line if.</option><option value="3" selected="">One line if.</option>', '<p id="someId" class="something-is-present">One line if.</p><p id="someId">One line if.</p><p id="someId" disabled>One line if.</p><option value="3" selected>One line if.</option><option value="3" selected>One line if.</option>']
      },
      {
        message: 'should evaluate one line if "if-something=\'\'" as false (conditionals/oneLineEmpty.html)',
        template: 'conditionals/oneLineEmpty',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-value">One line if.</p>'
      },
      {
        message: 'should evaluate every one line if in a sequence of them (conditionals/oneLineMulti.html)',
        template: 'conditionals/oneLineMulti',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        // the middle conditional in that template is `if-something=''`, which asks whether something is the empty string
        // an empty value cannot be told apart from no value at all, so it reads as a plain truthiness check, and since it supplies only a false outcome it contributes nothing here
        // the two spellings differ only in how each parser writes an attribute that has no value
        expected: ['<p class="something-is-present" data-should-render>One line if.</p>', '<p class="something-is-present" data-should-render="">One line if.</p>']
      },
      {
        message: 'should apply the outcome of each one line if in a sequence (conditionals/oneLineSequence.html)',
        template: 'conditionals/oneLineSequence',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<p class="first" data-second="yes">One line if.</p>']
      },
      {
        message: 'should treat a one line if that begins another condition before giving an outcome as one condition',
        run: async (teddy, template, model, assert, expected) => {
          // there is nothing joining the two conditions and no outcome was given for the first, so they read as a single condition rather than as a sequence; teddy warns about it when its verbosity allows
          assert(teddy.render('<p if-something if-nonexistent true=\'class="both"\' false=\'class="notboth"\'>x</p>', model), expected)
        },
        expected: '<p class="notboth">x</p>'
      },
      {
        message: 'should evaluate one line if "if-something" with a dynamic value (conditionals/oneLineDynamicVariable.html)',
        template: 'conditionals/oneLineDynamicVariable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="some-class">Some content</p>'
      },
      {
        // a condition's value may name a {variable} anywhere in it rather than only at its head, and either way the value is not known until there is a model to read it from
        message: 'should evaluate <if something=\'Some {contentWord}\'> as true, with the variable in the middle of the value (conditionals/conditionalValueVarInMiddle.html)',
        template: 'conditionals/conditionalValueVarInMiddle',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>true</p>'
      },
      {
        message: 'should evaluate one line if "if-something" whose value names a {variable} in the middle (conditionals/oneLineValueVarInMiddle.html)',
        template: 'conditionals/oneLineValueVarInMiddle',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="matched">Some content</p>'
      },
      {
        message: 'should evaluate <if something> as true and the nested <if not:somethingElse> as false, triggering the nested <else> condition (conditionals/nestedConditional.html)',
        template: 'conditionals/nestedConditional',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' and \'somethingElse\' are both present</p>'
      },
      {
        message: 'should render nothing if condition isn\'t met (conditionals/ifNotPresent.html)',
        template: 'conditionals/ifNotPresent',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div></div>'
      },
      {
        message: 'should evaluate one line if as false and apply no class (conditionals/oneLineFalse.html)',
        template: 'conditionals/oneLineFalse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p>'
      },
      {
        message: 'should evaluate one line if as false and apply a class (conditionals/oneLineOnlyFalse.html)',
        template: 'conditionals/oneLineOnlyFalse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="no-exist"></p>'
      },
      {
        message: 'should evaluate if statement that contains an element with a regex pattern (conditionals/ifEscapeRegex.html)',
        template: 'conditionals/ifEscapeRegex',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">'
      },
      {
        message: 'should evaluate if statement that queries the same variable more than once (conditionals/duplicateVarInline.html)',
        template: 'conditionals/duplicateVarInline',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>True</p>'
      },
      {
        message: 'should evaluate if statement with multiple instances of the same operator inline (conditionals/duplicateOperatorInline.html)',
        template: 'conditionals/duplicateOperatorInline',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>True</p>'
      },
      {
        message: 'should evaluate <if noExist> containing regex pattern as false and trigger <else> condition (conditionals/ifElseRegex.html)',
        template: 'conditionals/ifElseRegex',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>False</p>'
      },
      {
        message: 'should evaluate if statement where elseif condition is a three character named object (conditionals/ifNestedProperties.html)',
        template: 'conditionals/ifNestedProperties',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Should render</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true with quote types reversed (conditionals/oneLineReverseQuotes.html)',
        template: 'conditionals/oneLineReverseQuotes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-true">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true with quote types reversed and a variable result (conditionals/oneLineReverseQuotesVar.html)',
        template: 'conditionals/oneLineReverseQuotesVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="Some content">One line if.</p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement (conditionals/ifOutsideIf.html)',
        template: 'conditionals/ifOutsideIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p> gif-something-jpg-png </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement with a variable present (conditionals/varIfOutsideIf.html)',
        template: 'conditionals/varIfOutsideIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p> gif-Some content-jpg-png </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when combined with a normal if statement (conditionals/nestedIfOutsideIf.html)',
        template: 'conditionals/nestedIfOutsideIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p> gif-jpg-png If that should not be parsed, How art thou? </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when combined with a one line if statement (conditionals/oneLineIfOutsideIf.html)',
        template: 'conditionals/oneLineIfOutsideIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p> gif-jpg-png <span class="something-is-present"> hello </span> </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when \'if-\' is part of an attribute\'s value (conditionals/oneLineIfInsideAttribute.html)',
        template: 'conditionals/oneLineIfInsideAttribute',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p id="gif-jpg-png">hello</p> <p class="gif-jpg-png">hello</p><p filter="gif-jpg-png">hello</p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when combined with a one line if statement, reversed (conditionals/oneLineIfOutsideIfReverse.html)',
        template: 'conditionals/oneLineIfOutsideIfReverse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-present">  gif-jpg-png </p>'
      },
      {
        message: 'should evaluate 5000 one line ifs in under 10000ms (conditionals/oneLinePerformance.html)',
        template: 'conditionals/oneLinePerformance',
        run: async (teddy, template, model, assert, expected) => {
          const start = new Date().getTime()
          teddy.render(template, model)
          const end = new Date().getTime()
          const time = end - start

          return time < 10000
        },
        expected: true
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition containing very few characters (conditionals/ifElseLowChars.html)',
        template: 'conditionals/ifElseLowChars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>B</p>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition with preceding HTML comment (conditionals/ifCommentElse.html)',
        template: 'conditionals/ifCommentElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><!-- HTML comment --><p>The variable \'doesntexist\' is not present</p></div>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition with multiple preceding HTML comments (conditionals/ifMultipleCommentsElse.html)',
        template: 'conditionals/ifMultipleCommentsElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><!-- HTML comment --><!-- MOAR HTML comments --><p>The variable \'doesntexist\' is not present</p></div>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition with embedded HTML comments in conditional statements (conditionals/ifCommentsEmbedded.html)',
        template: 'conditionals/ifCommentsEmbedded',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><!-- HTML comment --><!-- MOAR HTML comments --><p>The variable \'doesntexist\' is not present</p></div>'
      },
      {
        message: 'should evaluate the <unless> condition as true and not render the other conditions (conditionals/ifWithSiblingIfWithNestedIfElse.html)',
        template: 'conditionals/ifWithSiblingIfWithNestedIfElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Should render.</p>'
      },
      {
        message: 'should print the letters behind both <if> statements nested in the <loop> (conditionals/ifLoopDoubleIf.html)',
        template: 'conditionals/ifLoopDoubleIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>a</p><p>b</p><p>a</p><p>b</p>'
      },
      {
        message: 'should correctly print the JSON string as unmodified text (conditionals/ifJSONStringPrintJSONString.html)',
        template: 'conditionals/ifJSONStringPrintJSONString',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<pre>{"content":{"appTitle":"Some App","pageTitle":"{content.appTitle}"},"currentYear":1858,"mainDomain":"localhost:43711","NODE_ENV":"development"}</pre>'
      }
    ]
  },
  {
    describe: 'Includes',
    tests: [
      {
        message: 'should <include> a template (includes/include.html)',
        template: 'includes/include',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should <include> all templates (includes/includeMultipleTemplates.html)',
        template: 'includes/includeMultipleTemplates',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>test test</p> <p>test test</p> <p>test test</p>'
      },
      {
        message: 'should <include> a template whose name is populated by a {variable} (includes/dynamicInclude.html)',
        template: 'includes/dynamicInclude',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should populate <include> <arg> in the child template; the class should render (includes/includeArgCheckedByOneLineIfWrapper.html)',
        template: 'includes/includeArgCheckedByOneLineIfWrapper',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="populated">Is it populated? populated</p>'
      },
      {
        message: 'should populate case insensitive <include> <arg> in the child template; the class should render (includes/includeArgCheckedByOneLineIfWrapperCaseInsensitive.html)',
        template: 'includes/includeArgCheckedByOneLineIfWrapperCaseInsensitive',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="populated">Is it populated? populated</p>'
      },
      {
        message: "should <include> a template from inside a <loop> and let the partial's teddy tags read the loop's val (includes/includeInLoop.html)",
        template: 'includes/includeInLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<ul><li class="active"><span>first is active</span><em>a</em><em>b</em></li><li class="inactive"><span>second is inactive</span><em>c</em></li></ul>'
      },
      {
        message: "should <include> a template from inside a <loop> with an <arg> whose value comes from the loop's val (includes/includeInLoopWithArg.html)",
        template: 'includes/includeInLoopWithArg',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<ul><li><b>first</b>: on</li><li><b>second</b>: off</li></ul>'
      },
      {
        message: 'should <include> a template with arguments (includes/includeWithArguments.html)',
        template: 'includes/includeWithArguments',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>override</p>'
      },
      {
        message: 'should <include> a template with a nested include (includes/nestedInclude.html)',
        template: 'includes/nestedInclude',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><p>Some content</p></div>'
      },
      {
        message: 'should <include> a template with a nested include passing a text argument (includes/nestedIncludeWithArg.html)',
        template: 'includes/nestedIncludeWithArg',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><p>nested</p></div>'
      },
      {
        message: 'should <include> a template with loop arguments (includes/nestedLoop.html)',
        template: 'includes/nestedLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>c</p>'
      },
      {
        message: 'should ignore and skip rendering orphaned argument (includes/orphanedArgument.html)',
        template: 'includes/orphanedArgument',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div></div>'
      },
      {
        message: 'should <include> a template that contains loops and variables with an argument (includes/includeLoopsAndVars.html)',
        template: 'includes/includeLoopsAndVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>c</p><p>world</p><p>guy</p>'
      },
      {
        message: 'should <include> a template that contains numerical {variables} (includes/numericVarInArg.html)',
        template: 'includes/numericVarInArg',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>STRING!</p>'
      },
      {
        message: 'should escape the contents of a script when included in a template (includes/inlineScriptTag.html)',
        template: 'includes/inlineScriptTag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Hello!</p><script>console.log(\'Hello world\'); for (var i = 0; i < 2; i++) { console.log(\'Test\') } </script>'
      },
      {
        message: 'should evaluate {variable} outside of include as original model value (includes/argRedefineModelVar.html)',
        template: 'includes/argRedefineModelVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<style>p { height: 10px; }</style> <p>Some content</p>'
      },
      {
        message: 'should prevent recursion abuse (includes/argVariableWithinArg.html)',
        template: 'includes/argVariableWithinArg',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should <include> a template and render pageContent inside of <if> (includes/includeIfContent.html)',
        template: 'includes/includeIfContent',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>hello</p>'
      },
      {
        message: 'should <include> a template and render pageContent <arg> contents and correctly parse <if>, <loop>, and <if> tags (includes/includeComplexContent.html)',
        template: 'includes/includeComplexContent',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<section class="content"><article class="thing"><section class="blah">other_prop_one</section></article><article class="thing"><section class="blah">other_prop_two</section></article></section>'
      },
      {
        message: 'should <include> a template and escape regex pattern in argument (includes/includeEscapeRegex.html)',
        template: 'includes/includeEscapeRegex',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">'
      },
      {
        message: 'should ignore includes with invalid markup (includes/invalidIncludeMarkup.html)',
        template: 'includes/invalidIncludeMarkup',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div>Template "noExist.html" not found!<p>Some content</p></div>'
      },
      {
        // the template includes another whose argument includes the first one back again, so the loop runs through an <arg> rather than being a direct self include
        message: 'should refuse to compile a template that includes itself, and name the templates leading round the loop (includes/includeInfiniteLoop.html)',
        template: 'includes/includeInfiniteLoop',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setVerbosity(0)
          try {
            teddy.render(template, model)
            return 'it rendered instead of refusing'
          } catch (e) {
            return e.message.includes('includes itself') && e.message.includes('includes/includeInfiniteLoop.html') ? 'refused and named the loop' : e.message
          }
        },
        expected: 'refused and named the loop'
      },
      {
        message: 'should evaluate a nested reverse quotes oneliner with an arg passed to it (includes/nestedOneliner.html)',
        template: 'includes/nestedOneliner',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="Some content">One line if.</p>'
      },
      {
        message: 'should populate <include> <arg> in the child template (includes/includeArgCheckedByOneLineIfWrapper.html)',
        template: 'includes/includeArgCheckedByOneLineIfWrapper',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="populated">Is it populated? populated</p>'
      },
      {
        message: 'should <include> a template with a one-line if statement that renders correctly (includes/includeOneLineOnlyFalse.html)',
        template: 'includes/includeOneLineOnlyFalse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p>'
      }
    ]
  },
  {
    describe: 'Looping',
    tests: [
      {
        message: 'should loop through {letters} correctly (looping/loopVal.html)',
        template: 'looping/loopVal',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>c</p>'
      },
      {
        message: 'should loop through {letters} correctly in a select element (looping/selectOptions.html)',
        template: 'looping/selectOptions',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<select><option value="a">a</option><option value="b" selected="selected">b</option><option value="c">c</option></select>'
      },
      {
        message: 'should loop through {letters} correctly in a select element (looping/selectOptionsAttribOnSelect.html)',
        template: 'looping/selectOptionsAttribOnSelect',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<select><option value="a">a</option><option value="b" selected="selected">b</option><option value="c">c</option></select><select><option value="a">a</option><option value="b" selected="selected">b</option><option value="c">c</option></select>'
      },
      {
        message: 'should loop through {set} correctly (looping/loopValSet.html)',
        template: 'looping/loopValSet',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>c</p>'
      },
      {
        message: 'should loop through {names} correctly (looping/loopKeyVal.html)',
        template: 'looping/loopKeyVal',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>jack</p> <p>guy</p><p>jill</p> <p>girl</p><p>hill</p> <p>landscape</p>'
      },
      {
        message: 'should loop through {namesVar} correctly (looping/loopKeyValVars.html)',
        template: 'looping/loopKeyValVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>jack</p> <p>guy</p><p>jill</p> <p>girl</p><p>hill</p> <p>landscape</p>'
      },
      {
        message: 'should loop through {arrays} correctly (looping/loopArrayOfArrays.html)',
        template: 'looping/loopArrayOfArrays',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>0</p><p>a</p><p>b</p><p>c</p><p>1</p><p>d</p><p>e</p><p>f</p><p>2</p><p>g</p><p>h</p><p>i</p>'
      },
      {
        // an iteration whose body needs no teddy parsing skips being loaded into a dom of its own, so this checks that the markup those iterations produce is still tidied up the way it always was
        message: 'should write malformed markup coming from the model in a loop out verbatim (looping/loopWithRawMarkup.html)',
        template: 'looping/loopWithRawMarkup',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><em>fine</em></div><div><p>unclosed</div><div><b><i>crossed</b></i></div>'
      },
      {
        message: 'should loop through {objects} correctly (looping/loopArrayOfObjects.html)',
        template: 'looping/loopArrayOfObjects',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>0</p> <p>1</p> <p>2</p> <p>3</p><p>1</p> <p>4</p> <p>5</p> <p>6</p><p>2</p> <p>7</p> <p>8</p> <p>9</p>'
      },
      {
        message: 'should loop through a {nested.object} correctly (looping/nestedObjectLoop.html)',
        template: 'looping/nestedObjectLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a: 4</p><p>b: 5</p><p>c: 6</p>'
      },
      {
        message: 'should parse loop through nested object correctly (looping/nestedObjectLoopLookup.html)',
        template: 'looping/nestedObjectLoopLookup',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<p>1</p><input type="text" checked=""><p>2</p><input type="text"><p>3</p><input type="text" checked="">', '<p>1</p><input type="text" checked><p>2</p><input type="text"><p>3</p><input type="text" checked>']
      },
      {
        message: 'should parse nested loops correctly (looping/nestedLoopsObjectWithArrayOfObjects.html)',
        template: 'looping/nestedLoopsObjectWithArrayOfObjects',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>value1</p><p>value2</p><p>value3</p><p>value4</p>'
      },
      {
        message: 'should render {variables} via second loop (looping/varNameViaVarInLoop.html)',
        template: 'looping/varNameViaVarInLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>guy</p><p>girl</p><p>landscape</p>'
      },
      {
        message: 'should render {variables} defined as {varname.{othervar}} under slightly different conditions (looping/varNameViaVarInLoopWithIndependentVars.html)',
        template: 'looping/varNameViaVarInLoopWithIndependentVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>guy</p><p>girl</p><p>landscape</p>'
      },
      {
        message: 'should render {variable.{otherVar}} in loop that repeats twice doubled (looping/varNameViaVarInLoopWithIndependentVarsDoubled.html)',
        template: 'looping/varNameViaVarInLoopWithIndependentVarsDoubled',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>guy</p><p>girl</p><p>landscape</p><p>guy</p><p>girl</p><p>landscape</p>'
      },
      {
        message: 'should render {variable.{otherVar}} in nested loop variant 1 (looping/varNameViaVarInLoopWithIndependentVarsViaArray.html)',
        template: 'looping/varNameViaVarInLoopWithIndependentVarsViaArray',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>guy</p><p>girl</p><p>landscape</p>'
      },
      {
        message: 'should render {variable.{otherVar}} in nested loop variant 2 (looping/varNameViaVarInLoopWithIndependentVarsViaArrayTwice.html)',
        template: 'looping/varNameViaVarInLoopWithIndependentVarsViaArrayTwice',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>guy</p><p>girl</p><p>landscape</p><p>man</p><p>woman</p><p>scenary</p>'
      },
      {
        // a through whose middle segment is a {variable} from the enclosing loop is only known once there is a model to read it from, so the loop must resolve the variable before it looks up the path
        message: 'should render the body of a nested loop whose through names a {variable} from the enclosing loop in the middle of its path (looping/loopThroughWithVarInPath.html)',
        template: 'looping/loopThroughWithVarInPath',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p id="first">First</p><span>one</span><span>two</span><p id="second">Second</p><span>three</span>'
      },
      {
        message: 'should not render the loop (looping/commentedLoopInLoop.html)',
        template: 'looping/commentedLoopInLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p>'
      },
      {
        message: 'should parse nested loops correctly (looping/nestedLoops.html)',
        template: 'looping/nestedLoops',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>1</p> <ul> <li>0: one</li><li>1: two</li><li>2: three</li> </ul><p>2</p> <ul> <li>0: four</li><li>1: five</li><li>2: six</li> </ul><p>3</p> <ul> <li>0: seven</li><li>1: eight</li><li>2: nine</li> </ul>'
      },
      {
        message: 'should parse complex nested nested loops correctly (looping/nestedNestedLoops.html)',
        template: 'looping/nestedNestedLoops',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>1</p><ul><li>1</li><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><li>2</li><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><li>3</li><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul></ul><p>2</p><ul><li>1</li><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><li>2</li><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><li>3</li><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul></ul><p>3</p><ul><li>1</li><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><li>2</li><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><li>3</li><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul></ul>'
      },
      {
        message: 'should loop through nested arrays correctly (looping/nestedArrays.html)',
        template: 'looping/nestedArrays',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p><p>eight</p><p>nine</p>'
      },
      {
        message: 'should loop through nested objects correctly (looping/nestedObjects.html)',
        template: 'looping/nestedObjects',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Thing With Name 1</p><p>Thing With Name 1: Subthing With Name 1</p><p>Thing With Name 1: Subthing With Name 2</p><p>Thing With Name 1: Subthing With Name 3</p><p>Thing With Name 2</p><p>Thing With Name 2: Subthing With Name 4</p><p>Thing With Name 2: Subthing With Name 5</p><p>Thing With Name 2: Subthing With Name 6</p><p>Thing With Name 3</p><p>Thing With Name 3: Subthing With Name 7</p><p>Thing With Name 3: Subthing With Name 8</p><p>Thing With Name 3: Subthing With Name 9</p>'
      },
      {
        message: 'should loop through a quad-nested structure correctly (looping/quadNested.html)',
        template: 'looping/quadNested',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ''
      },
      {
        message: 'should loop through an array of 5000 elements caching the first pass with a <cache> element so the second pass is faster (looping/largeDataSet.html)',
        template: 'looping/largeDataSet',
        run: async (teddy, template, model, assert, expected) => {
          const start = new Date().getTime()
          teddy.render(template, model)
          const end = new Date().getTime()
          const time = end - start
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse: ', time)
          const start2 = new Date().getTime()
          teddy.render(template, model)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse:     ', time2)
          const lessThan = time2 < time || time2 > time || time2 === time // this is necessary because CI CPU cycles vary so there's no way to guarantee the result
          return lessThan
        },
        expected: true
      },
      {
        message: 'should ignore loop with invalid through attribute (looping/undefinedObjectLoop.html)',
        template: 'looping/undefinedObjectLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div></div>'
      },
      {
        message: 'should ignore loop with no contents (looping/emptyMarkupLoop.html)',
        template: 'looping/emptyMarkupLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div></div>'
      },
      {
        message: 'should loop without nested markup (looping/noMarkupLoop.html)',
        template: 'looping/noMarkupLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div>abc</div>'
      },
      {
        message: 'should loop through {letters} correctly with numeric val (looping/numericalVal.html)',
        template: 'looping/numericalVal',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>c</p>'
      },
      {
        message: 'should loop through {letters} correctly with camelCase val (looping/camelCaseLoopVal.html)',
        template: 'looping/camelCaseLoopVal',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>b</p><p>c</p>'
      },
      {
        message: 'should loop through {letters} keys correctly with no val attribute (looping/loopNoVal.html)',
        template: 'looping/loopNoVal',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>0</p><p>1</p><p>2</p>'
      },
      {
        message: 'should ignore loops with missing attributes (looping/loopInvalidAttributes.html)',
        template: 'looping/loopInvalidAttributes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div></div>'
      },
      {
        message: 'should ignore undefined members of objects and arrays (looping/loopUndefinedMember.html)',
        template: 'looping/loopUndefinedMember',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>{letter}</p><p>c</p><p>{item.a}</p><p>{item.b}</p><p>{item.c}</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>'
      },
      {
        message: 'should loop through {letters} correctly and evaluate other teddy tags (looping/loopIncludesIfUnless.html)',
        template: 'looping/loopIncludesIfUnless',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>Some content</p><p>Hello</p><p>b</p><p>Some content</p><p>Hello</p><p>c</p><p>Some content</p><p>Hello</p>'
      },
      {
        message: 'should render deeply nested vars with teddy code (looping/nestedObjectWithTeddyContent.html)',
        template: 'looping/nestedObjectWithTeddyContent',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>1</p><p>Something Exists</p><p>2</p><p>Something Exists</p>'
      },
      {
        message: 'should render deeply nested vars with teddy code and respect noparse flag (looping/nestedObjectWithTeddyContentNoParse.html)',
        template: 'looping/nestedObjectWithTeddyContentNoParse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>1</p><p><if something>Something Exists</if></p><p>2</p><p><if something>Something Exists</if></p>'
      },
      {
        message: 'should not crash if attempting to set a <loop> val that matches the name of something else in the model (looping/loopValNameCollision.html)',
        template: 'looping/loopValNameCollision',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>2</p><p>5</p><p>8</p>'
      },
      {
        message: 'should print an empty string for array member set to an empty string (looping/loopValEmptyString.html)',
        template: 'looping/loopValEmptyString',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>one</p><p>two</p><p></p><p>three</p>'
      }
    ]
  },
  {
    describe: 'Misc',
    tests: [
      {
        message: 'should compile a template and return a function which when given data will render HTML',
        template: '<p>{hello}</p>',
        run: async (teddy, template, model, assert, expected) => {
          const templateFunction = teddy.compile(template)
          return templateFunction({ hello: 'world' })
        },
        expected: '<p>world</p>'
      },
      {
        message: 'should not escape HTML entities present in {variables} which are properly {flagged|p|s} (misc/barPandSTest.html)',
        template: 'misc/barPandSTest',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<h1>double bars</h1> {something}'
      },
      {
        message: 'should not escape HTML entities present in {variables} which are properly {flagged|s|p} (misc/barSandPTest.html)',
        template: 'misc/barSandPTest',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<h1>double bars</h1> {something}'
      },
      {
        message: 'should escape HTML entities present in <escape> tags (misc/escapeTag.html)',
        template: 'misc/escapeTag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div>&lt;p&gt;hello&lt;/p&gt;</div>'
      },
      {
        message: 'should escape HTML entities present in <!--# escape --> comments (misc/escapeComment.html)',
        template: 'misc/escapeComment',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><code>&lt;p&gt;</code><code>&lt;script&gt;</code></div>'
      },
      {
        message: 'should escape escapes in escapes properly (misc/escapesInEscapes.html)',
        template: 'misc/escapesInEscapes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><p><code>&lt;escape&gt;</code>or<code>&lt;escape&gt;&lt;p&gt;hello1&lt;/p&gt;&lt;/escape&gt;</code>or<code>&lt;!--#&lt;p&gt;hello2&lt;/p&gt;--&gt;</code>or<code>&lt;escape&gt;&lt;p&gt;hello3&lt;/p&gt;&lt;/escape&gt;</code></p></div>'
      },
      {
        message: 'should render <pre> tags correctly (misc/preTag.html)',
        template: 'misc/preTag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<div><pre><if something>{something}</if></pre><pre>Some content</pre><pre class="attr"><if something>{something}</if></pre></div>', '<div><pre><if something="">{something}</if></pre><pre>Some content</pre><pre class="attr"><if something="">{something}</if></pre></div>']
      },
      {
        message: 'should prevent a sample template from infinite looping (misc/infiniteParseLoopTest.html)',
        template: 'misc/infiniteParseLoopTest',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '{ const x = { key: \'val\' } || \'\' }'
      },
      {
        message: 'should render multiple {variables} (misc/multipleVariables.html)',
        template: 'misc/multipleVariables',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p> <h5>More content</h5>'
      },
      {
        message: 'should render {variables} (misc/variable.html)',
        template: 'misc/variable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should properly render templates with duplicate IDs (misc/duplicateIDs.html)',
        template: 'misc/duplicateIDs',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p id="blah">no blah</p><p id="blah">no blah</p>'
      },
      {
        message: 'should check checkboxes or radio butons using special teddy attribute to avoid a one-line if (misc/checkboxRadioCheckedAttrib.html)',
        template: 'misc/checkboxRadioCheckedAttrib',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><input type="checkbox" name="letters" value="a"><input type="checkbox" name="letters" value="b" checked="checked"><input type="checkbox" name="letters" value="c"></div><div><input type="radio" name="letters" value="a"><input type="radio" name="letters" value="b" checked="checked"><input type="radio" name="letters" value="c"></div><div><input type="checkbox" name="letters" value="a"><input type="checkbox" name="letters" value="b" checked="checked"><input type="checkbox" name="letters" value="c" checked="checked"></div>'
      },
      {
        message: 'should render {variables} as blank when x is true (misc/undefinedVar.html)',
        template: 'misc/undefinedVar',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setEmptyVarBehavior('hide')
          const result = teddy.render(template, model)
          teddy.setEmptyVarBehavior('display')
          return result
        },
        expected: '<p></p><p></p>'
      },
      {
        message: 'should render template literal ${variables} (misc/variableTemplateLiteral.html)', // eslint-disable-line
        template: 'misc/variableTemplateLiteral',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should render template literal ${variables} as text if the variable is not populated (misc/variableVarWithTemplateLiteralContents.html)', // eslint-disable-line
        template: 'misc/variableVarWithTemplateLiteralContents',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p><p>${nonexistentVar}</p>' // eslint-disable-line
      },
      {
        message: 'should render nested {variables} (misc/nestedVars.html)',
        template: 'misc/nestedVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Variable with a variable inside: And another: Some content</p>'
      },
      {
        message: 'should not render nested {variables|p} (misc/nestedVarsParseFlag.html)',
        template: 'misc/nestedVarsParseFlag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Variable with a variable inside: {subVar}</p>'
      },
      {
        message: 'should properly escape HTML entities present in {variables} (misc/varEscaping.html)',
        template: 'misc/varEscaping',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>&lt;span&gt;raw html&lt;/span&gt;</p>'
      },
      {
        message: 'should not escape HTML entities present in {variables} which are properly {flagged|s} (misc/varNoEscaping.html)',
        template: 'misc/varNoEscaping',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><span>raw html</span></div>'
      },
      {
        message: 'should force hide missing variables and treat them as empty strings {missing|h} (misc/varForceEmptyHide.html)',
        template: 'misc/varForceEmptyHide',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p>'
      },
      {
        message: 'should force display missing variables and display the variable {missing|d} but remove |d (misc/varForceEmptyDisplay.html)',
        template: 'misc/varForceEmptyDisplay',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>{missing}</p>'
      },
      {
        message: 'should render <inline> tags (misc/inlineTag.html)',
        template: 'misc/inlineTag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><style>body{font-family:sans-serif;}</style><script>console.log("hello")</script></div>'
      },
      {
        message: 'should not parse any code in <noteddy> tags (misc/varNoParsing.html)',
        template: 'misc/varNoParsing',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>{escapeTest}</p>'
      },
      {
        message: 'should not parse any code in <noparse> tags (misc/varNoParsing2.html)',
        template: 'misc/varNoParsing2',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>hello</p><p>${escapeTest}</p><p class="${escapeTest}">hello</p>' // eslint-disable-line
      },
      {
        message: 'should remove {! server side comments !} (misc/serverSideComments.html)',
        template: 'misc/serverSideComments',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>test test</p>'
      },
      {
        message: 'should remove {! server side comments !} in an inline template',
        template: 'misc/serverSideComments',
        run: async (teddy, template, model, assert, expected) => teddy.render('{! comments !}<p>Should remove {! the !} comments.</p>', model),
        expected: '<p>Should remove comments.</p>'
      },
      {
        message: 'should remove {! {! nested !} server side comments !} (misc/serverSideCommentsNested.html)',
        template: 'misc/serverSideCommentsNested',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Any comments? </p>'
      },
      {
        message: 'should not break when referencing objects that don\'t exist (misc/objectDoesNotExist.html)',
        template: 'misc/objectDoesNotExist',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ' <p>{doesntExist.someKey}</p> <p class="false"></p>'
      },
      {
        message: 'should render plain HTML with no teddy tags with no changes (misc/plainHTML.html)',
        template: 'misc/plainHTML',
        run: async (teddy, template, model, assert, expected) => {
          const teddyTemplate = teddy.render(template, model)

          assert(teddyTemplate, '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="format-detection" content="telephone=no"><title>Plain HTML</title><link rel="stylesheet" href="/css/styles.css"></head><body><main><p>This template contains no teddy tags. Just HTML.</p></main><script type="text/javascript" src="/js/main.js"></script></body></html>')
        },
        expected: ''
      },
      {
        message: 'should access property of {variable} object with {variable} (misc/variableObjectProperty.html)',
        template: 'misc/variableObjectProperty',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>guy</p>'
      },
      {
        message: 'should escape curly braces from regex pattern (misc/regexEscaping.html)',
        template: 'misc/regexEscaping',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">'
      },
      {
        message: 'should render emojis correctly (misc/emojis.html)',
        template: 'misc/emojis',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>🎉🥳🎈🎊</p>'
      },
      {
        message: 'should render two class attributes correctly (misc/twoClasses.html)',
        template: 'misc/twoClasses',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="one" class-teddyduplicate1="two">2</p>'
      },
      {
        // a whole template cache is keyed on a model value, and that value becomes the name of an entry. a name is always a string, so a key whose value is not one has to be read back as the string it was stored under or the entry is never found again
        message: 'should find a whole template cache entry again when the key it is stored under is not a string',
        runMocha: async (teddy, template, model, assert, expected) => {
          const markup = '<p>{n}</p>'
          const answers = []
          for (const keyVal of ['a1', 42, 0, '']) {
            teddy.clearTemplates()
            teddy.setCache({ template: markup, key: 'id' })
            const first = teddy.render(markup, { id: keyVal, n: 'first' })
            const second = teddy.render(markup, { id: keyVal, n: 'second' })
            answers.push(second === first ? 'cached' : 'rendered again')
            teddy.clearCache({ template: markup })
          }
          assert(answers.join(', '), 'cached, cached, cached, cached')
        },
        expected: 'cached, cached, cached, cached'
      },
      {
        message: 'should still re-render a whole template cache entry once it is older than its max age',
        runMocha: async (teddy, template, model, assert, expected) => {
          const markup = '<p>{n}</p>'
          teddy.clearTemplates()
          teddy.setCache({ template: markup, key: 'id', maxAge: 60000 })
          const first = teddy.render(markup, { id: 7, n: 'first' })
          const fresh = teddy.render(markup, { id: 7, n: 'second' })
          // reach in and age the entry past its welcome, rather than waiting a minute for it
          teddy.templateCaches[markup].id.entries['7'].created -= 120000
          const stale = teddy.render(markup, { id: 7, n: 'third' })
          teddy.clearCache({ template: markup })
          assert([fresh === first ? 'served the cache' : 'rendered again', stale === first ? 'served the cache' : 'rendered again'].join(', '), 'served the cache, rendered again')
        },
        expected: 'served the cache, rendered again'
      },
      {
        message: 'should cache the contents of the cache element but not anything outside of it (misc/cacheElement.html)',
        template: 'misc/cacheElement',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          // these will be cached
          const render1 = teddy.render(template, { user: 'Joe', city: 'NY', value: 30 })
          assert(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          const render2 = teddy.render(template, { user: 'Bob', city: 'SF', value: 60 })
          assert(render2, '<p>Dynamic: Welcome Bob!</p><p>Cached: High temperature today in SF is 60.</p>')
          assert(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
          await timeout(100)

          const render3 = teddy.render(template, { user: 'Moe', city: 'LA', value: 80 })
          assert(render3, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in LA is 80.</p>')
          assert(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
          await timeout(100)

          // will display from cache
          const render4 = teddy.render(template, { user: 'Sue', city: 'NY', value: 300 }) // new temperature value should not print because old value is cached
          assert(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          const render5 = teddy.render(template, { user: 'Jay', city: 'SF', value: 600 }) // new temperature value should not print because old value is cached
          assert(render5, '<p>Dynamic: Welcome Jay!</p><p>Cached: High temperature today in SF is 60.</p>')
          assert(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
          await timeout(100)

          const render6 = teddy.render(template, { user: 'Mae', city: 'LA', value: 800 }) // new temperature value should not print because old value is cached
          assert(render6, '<p>Dynamic: Welcome Mae!</p><p>Cached: High temperature today in LA is 80.</p>')
          assert(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
          await timeout(100)

          // should drop NY and replace it with NOLA due to max caches being 3 and NY being the least recently accessed
          const render7 = teddy.render(template, { name: 'weather', user: 'Liz', city: 'NOLA', value: 90 })
          assert(render7, '<p>Dynamic: Welcome Liz!</p><p>Cached: High temperature today in NOLA is 90.</p>')
          assert(teddy.caches.weather.entries.NOLA.markup, '<p>Cached: High temperature today in NOLA is 90.</p>')
          const missingNY = !teddy.caches.weather.entries.NY
          assert(missingNY)

          // see if deleting SF from the city cache works
          teddy.clearCache('weather', 'SF')
          const missingSF = !teddy.caches.weather.entries.SF
          assert(missingSF)

          // see if deleting entire city cache works
          teddy.clearCache('weather')
          const missingAll = !teddy.caches.weather
          assert(missingAll)
        },
        expected: ''
      },
      {
        message: 'should cache the contents of the cache element but not anything outside of it (misc/cacheElementMaxAge.html)',
        template: 'misc/cacheElementMaxAge',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          // these will be cached
          const render1 = teddy.render(template, { user: 'Joe', city: 'NY', value: 30 })
          assert(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          // will display from cache
          const render4 = teddy.render(template, { user: 'Sue', city: 'NY', value: 300 }) // new temperature value should not print because old value is cached
          assert(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(1100)

          // will not be cached
          const render5 = teddy.render(template, { user: 'Moe', city: 'NY', value: 60 })
          assert(render5, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in NY is 60.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 60.</p>')
        },
        expected: ''
      },
      {
        message: 'should render cache element correctly with dynamic attributes (misc/cacheElementDynamicAttrs.html)',
        template: 'misc/cacheElementDynamicAttrs',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          teddy.clearCache('weather')

          // these will be cached
          const render1 = teddy.render(template, { name: 'weather', key: 'city', user: 'Joe', city: 'NY', value: 30 })
          assert(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          const render2 = teddy.render(template, { name: 'weather', key: 'city', user: 'Bob', city: 'SF', value: 60 })
          assert(render2, '<p>Dynamic: Welcome Bob!</p><p>Cached: High temperature today in SF is 60.</p>')
          assert(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
          await timeout(100)

          const render3 = teddy.render(template, { name: 'weather', key: 'city', user: 'Moe', city: 'LA', value: 80 })
          assert(render3, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in LA is 80.</p>')
          assert(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
          await timeout(100)

          // will display from cache
          const render4 = teddy.render(template, { name: 'weather', key: 'city', user: 'Sue', city: 'NY', value: 300 }) // new temperature value should not print because old value is cached
          assert(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          const render5 = teddy.render(template, { name: 'weather', key: 'city', user: 'Jay', city: 'SF', value: 600 }) // new temperature value should not print because old value is cached
          assert(render5, '<p>Dynamic: Welcome Jay!</p><p>Cached: High temperature today in SF is 60.</p>')
          assert(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
          await timeout(100)

          const render6 = teddy.render(template, { name: 'weather', key: 'city', user: 'Mae', city: 'LA', value: 800 }) // new temperature value should not print because old value is cached
          assert(render6, '<p>Dynamic: Welcome Mae!</p><p>Cached: High temperature today in LA is 80.</p>')
          assert(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
          await timeout(100)

          // should drop NY and replace it with NOLA due to max caches being 3 and NY being the least recently accessed
          const render7 = teddy.render(template, { name: 'weather', key: 'city', user: 'Liz', city: 'NOLA', value: 90 })
          assert(render7, '<p>Dynamic: Welcome Liz!</p><p>Cached: High temperature today in NOLA is 90.</p>')
          assert(teddy.caches.weather.entries.NOLA.markup, '<p>Cached: High temperature today in NOLA is 90.</p>')
          const missingNY = !teddy.caches.weather.entries.NY
          assert(missingNY, true)

          // see if deleting SF from the city cache works
          teddy.clearCache('weather', 'SF')
          const missingSF = !teddy.caches.weather.entries.SF
          assert(missingSF)

          // see if deleting entire city cache works
          teddy.clearCache('weather')
          const missingAll = !teddy.caches.weather
          assert(missingAll)
        },
        expected: ''
      },
      {
        message: 'should render cache element correctly with dynamic attributes (misc/cacheElementDynamicAttrsNested.html)',
        template: 'misc/cacheElementDynamicAttrsNested',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          teddy.clearCache('weather')

          // these will be cached
          const render1 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Joe', city: { acronym: 'NY' }, value: 30 })
          assert(render1, '<p>Dynamic: Welcome Joe!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          const render2 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Bob', city: { acronym: 'SF' }, value: 60 })
          assert(render2, '<p>Dynamic: Welcome Bob!</p><p>Cached: High temperature today in SF is 60.</p>')
          assert(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
          await timeout(100)

          const render3 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Moe', city: { acronym: 'LA' }, value: 80 })
          assert(render3, '<p>Dynamic: Welcome Moe!</p><p>Cached: High temperature today in LA is 80.</p>')
          assert(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
          await timeout(100)

          // will display from cache
          const render4 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Sue', city: { acronym: 'NY' }, value: 300 }) // new temperature value should not print because old value is cached
          assert(render4, '<p>Dynamic: Welcome Sue!</p><p>Cached: High temperature today in NY is 30.</p>')
          assert(teddy.caches.weather.entries.NY.markup, '<p>Cached: High temperature today in NY is 30.</p>')
          await timeout(100)

          const render5 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Jay', city: { acronym: 'SF' }, value: 600 }) // new temperature value should not print because old value is cached
          assert(render5, '<p>Dynamic: Welcome Jay!</p><p>Cached: High temperature today in SF is 60.</p>')
          assert(teddy.caches.weather.entries.SF.markup, '<p>Cached: High temperature today in SF is 60.</p>')
          await timeout(100)

          const render6 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Mae', city: { acronym: 'LA' }, value: 800 }) // new temperature value should not print because old value is cached
          assert(render6, '<p>Dynamic: Welcome Mae!</p><p>Cached: High temperature today in LA is 80.</p>')
          assert(teddy.caches.weather.entries.LA.markup, '<p>Cached: High temperature today in LA is 80.</p>')
          await timeout(100)

          // should drop NY and replace it with NOLA due to max caches being 3 and NY being the least recently accessed
          const render7 = teddy.render(template, { name: 'weather', key: 'city.acronym', user: 'Liz', city: { acronym: 'NOLA' }, value: 90 })
          assert(render7, '<p>Dynamic: Welcome Liz!</p><p>Cached: High temperature today in NOLA is 90.</p>')
          assert(teddy.caches.weather.entries.NOLA.markup, '<p>Cached: High temperature today in NOLA is 90.</p>')
          const missingNY = !teddy.caches.weather.entries.NY
          assert(missingNY)

          // see if deleting SF from the city cache works
          teddy.clearCache('weather', 'SF')
          const missingSF = !teddy.caches.weather.entries.SF
          assert(missingSF)

          // see if deleting entire city cache works
          teddy.clearCache('weather')
          const missingAll = !teddy.caches.weather
          assert(missingAll)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          // whether a render came from the cache is judged by what it contains rather than by how long it took: the data is edited between renders, so a render still showing the old data was served from the cache and one showing the edit was not
          //
          // the data set is copied first, so editing it cannot reach the model the rest of the suite shares, and it is copied at full size, so the timings below still describe a realistic render
          const rows = model.largeDataSet.map(row => ({ ...row }))
          const localModel = Object.assign({}, model, { largeDataSet: rows })

          teddy.setCache({
            template,
            key: null,
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          const first = teddy.render(template, localModel)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse: ', time1)

          rows[0].one = 'firstEdit'
          const start2 = new Date().getTime()
          const cached = teddy.render(template, localModel)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse:     ', time2)

          await timeout(1100)
          rows[0].one = 'secondEdit'
          const start3 = new Date().getTime()
          const afterExpiry = teddy.render(template, localModel)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse after clearing cache: ', time3)

          const servedFromCache = cached === first && !cached.includes('firstEdit')
          const renderedAgainOnceExpired = afterExpiry.includes('secondEdit')
          assert(servedFromCache && renderedAgainOnceExpired)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache is explicitly cleared (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          // whether a render came from the cache is judged by what it contains rather than by how long it took: the data is edited between renders, so a render still showing the old data was served from the cache and one showing the edit was not
          //
          // the data set is copied first, so editing it cannot reach the model the rest of the suite shares, and it is copied at full size, so the timings below still describe a realistic render
          const rows = model.largeDataSet.map(row => ({ ...row }))
          const localModel = Object.assign({}, model, { largeDataSet: rows })

          teddy.setCache({
            template,
            key: null,
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          const first = teddy.render(template, localModel)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse: ', time1)

          rows[0].one = 'firstEdit'
          const start2 = new Date().getTime()
          const cached = teddy.render(template, localModel)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse:     ', time2)
          teddy.clearCache({
            template,
            key: null
          })

          rows[0].one = 'secondEdit'
          const start3 = new Date().getTime()
          const afterClearing = teddy.render(template, localModel)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse after clearing cache: ', time3)

          const servedFromCache = cached === first && !cached.includes('firstEdit')
          const renderedAgainOnceCleared = afterClearing.includes('secondEdit')
          assert(servedFromCache && renderedAgainOnceCleared)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires via keyed values (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          // whether a render came from the cache is judged by what it contains rather than by how long it took: the data is edited between renders, so a render still showing the old data was served from the cache and one showing the edit was not
          //
          // the data set is copied first, so editing it cannot reach the model the rest of the suite shares, and it is copied at full size, so the timings below still describe a realistic render
          const rows = model.largeDataSet.map(row => ({ ...row }))
          const modelNY = Object.assign({ city: 'NY' }, model, { largeDataSet: rows })
          const modelSF = Object.assign({ city: 'SF' }, model, { largeDataSet: rows })
          teddy.setCache({
            template,
            key: 'city',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          const firstNY = teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (NY): ', time1)

          rows[0].one = 'firstEdit'
          const start3 = new Date().getTime()
          const cachedNY = teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          const firstSF = teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (SF): ', time2)

          await timeout(1100)
          rows[0].one = 'secondEdit'
          const start4 = new Date().getTime()
          const afterCacheWentAway = teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)

          const servedFromCache = cachedNY === firstNY && !cachedNY.includes('firstEdit')
          const eachKeyCachedApart = firstSF.includes('firstEdit') // a different value at the key, so nothing cached for it yet
          const renderedAgainOnceGone = afterCacheWentAway.includes('secondEdit')
          assert(servedFromCache && eachKeyCachedApart && renderedAgainOnceGone)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires via keyed values when the cache is explicitly cleared (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          // whether a render came from the cache is judged by what it contains rather than by how long it took: the data is edited between renders, so a render still showing the old data was served from the cache and one showing the edit was not
          //
          // the data set is copied first, so editing it cannot reach the model the rest of the suite shares, and it is copied at full size, so the timings below still describe a realistic render
          const rows = model.largeDataSet.map(row => ({ ...row }))
          const modelNY = Object.assign({ city: 'NY' }, model, { largeDataSet: rows })
          const modelSF = Object.assign({ city: 'SF' }, model, { largeDataSet: rows })
          teddy.setCache({
            template,
            key: 'city',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          const firstNY = teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (NY): ', time1)

          rows[0].one = 'firstEdit'
          const start3 = new Date().getTime()
          const cachedNY = teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          const firstSF = teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (SF): ', time2)

          teddy.clearCache({
            template,
            key: 'city'
          })

          rows[0].one = 'secondEdit'
          const start4 = new Date().getTime()
          const afterCacheWentAway = teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)

          const servedFromCache = cachedNY === firstNY && !cachedNY.includes('firstEdit')
          const eachKeyCachedApart = firstSF.includes('firstEdit') // a different value at the key, so nothing cached for it yet
          const renderedAgainOnceGone = afterCacheWentAway.includes('secondEdit')
          assert(servedFromCache && eachKeyCachedApart && renderedAgainOnceGone)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires via keyed values with nesting (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          // whether a render came from the cache is judged by what it contains rather than by how long it took: the data is edited between renders, so a render still showing the old data was served from the cache and one showing the edit was not
          //
          // the data set is copied first, so editing it cannot reach the model the rest of the suite shares, and it is copied at full size, so the timings below still describe a realistic render
          const rows = model.largeDataSet.map(row => ({ ...row }))
          const modelNY = Object.assign({ city: { acronym: 'NY' } }, model, { largeDataSet: rows })
          const modelSF = Object.assign({ city: { acronym: 'SF' } }, model, { largeDataSet: rows })
          teddy.setCache({
            template,
            key: 'city.acronym',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          const firstNY = teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (NY): ', time1)

          rows[0].one = 'firstEdit'
          const start3 = new Date().getTime()
          const cachedNY = teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          const firstSF = teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (SF): ', time2)

          await timeout(1100)
          rows[0].one = 'secondEdit'
          const start4 = new Date().getTime()
          const afterCacheWentAway = teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)

          const servedFromCache = cachedNY === firstNY && !cachedNY.includes('firstEdit')
          const eachKeyCachedApart = firstSF.includes('firstEdit') // a different value at the key, so nothing cached for it yet
          const renderedAgainOnceGone = afterCacheWentAway.includes('secondEdit')
          assert(servedFromCache && eachKeyCachedApart && renderedAgainOnceGone)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires via keyed values with nesting when the cache is explicitly cleared (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          // whether a render came from the cache is judged by what it contains rather than by how long it took: the data is edited between renders, so a render still showing the old data was served from the cache and one showing the edit was not
          //
          // the data set is copied first, so editing it cannot reach the model the rest of the suite shares, and it is copied at full size, so the timings below still describe a realistic render
          const rows = model.largeDataSet.map(row => ({ ...row }))
          const modelNY = Object.assign({ city: { acronym: 'NY' } }, model, { largeDataSet: rows })
          const modelSF = Object.assign({ city: { acronym: 'SF' } }, model, { largeDataSet: rows })
          teddy.setCache({
            template,
            key: 'city.acronym',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          const firstNY = teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (NY): ', time1)

          rows[0].one = 'firstEdit'
          const start3 = new Date().getTime()
          const cachedNY = teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          const firstSF = teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (SF): ', time2)

          teddy.clearCache({
            template,
            key: 'city.acronym'
          })

          rows[0].one = 'secondEdit'
          const start4 = new Date().getTime()
          const afterCacheWentAway = teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)

          const servedFromCache = cachedNY === firstNY && !cachedNY.includes('firstEdit')
          const eachKeyCachedApart = firstSF.includes('firstEdit') // a different value at the key, so nothing cached for it yet
          const renderedAgainOnceGone = afterCacheWentAway.includes('secondEdit')
          assert(servedFromCache && eachKeyCachedApart && renderedAgainOnceGone)
        },
        expected: ''
      },
      {
        message: 'should drop caches which have expired due to maximum being reached (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          function timeout (ms) {
            return new Promise(resolve => setTimeout(resolve, ms))
          }

          const modelNY = Object.assign({ city: { acronym: 'NY' } }, model)
          const modelSF = Object.assign({ city: { acronym: 'SF' } }, model)
          const modelLA = Object.assign({ city: { acronym: 'LA' } }, model)
          let present
          teddy.setCache({
            template,
            key: 'city.acronym',
            maxAge: 1000,
            maxCaches: 2
          })
          const start1 = new Date().getTime()
          teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (NY): ', time1)
          present = typeof teddy.templateCaches[template]['city.acronym'].entries.NY === 'object'
          assert(present)
          await timeout(100)

          const start2 = new Date().getTime()
          teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (SF): ', time2)
          present = typeof teddy.templateCaches[template]['city.acronym'].entries.SF === 'object'
          assert(present)
          await timeout(100)

          const start3 = new Date().getTime()
          teddy.render(template, modelLA)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          if (typeof process === 'object' && process.env.TEDDY_TEST_TIMINGS) console.log('    → Non-cached time to parse (LA): ', time3)
          present = typeof teddy.templateCaches[template]['city.acronym'].entries.LA === 'object'
          assert(present)

          present = typeof teddy.templateCaches[template]['city.acronym'].entries.NY !== 'object'
          assert(present)
        },
        expected: ''
      },
      {
        message: 'should avoid rendering templates that are not strings',
        template: 5,
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ''
      },
      {
        message: 'should render a template with missing or invalid model (misc/emptyModelMarkup.html)',
        template: 'misc/emptyModelMarkup',
        run: async (teddy, template, model, assert, expected) => teddy.render(template, 1),
        expected: '<div><p>Hello</p></div>'
      },
      {
        message: 'should not render {variables} that don\'t exist in the model (misc/varNotInModel.html)',
        template: 'misc/varNotInModel',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '{noExist}'
      },
      {
        message: 'should set each verbosity level',
        template: '',
        run: async (teddy, template, model, assert, expected) => {
          let verbosity = ''
          teddy.setVerbosity()
          verbosity += teddy.params.verbosity + ', '
          teddy.setVerbosity('none')
          verbosity += teddy.params.verbosity + ', '
          teddy.setVerbosity(0)
          verbosity += teddy.params.verbosity + ', '
          teddy.setVerbosity('verbose')
          verbosity += teddy.params.verbosity + ', '
          teddy.setVerbosity(2)
          verbosity += teddy.params.verbosity + ', '
          teddy.setVerbosity('DEBUG')
          verbosity += teddy.params.verbosity + ', '
          teddy.setVerbosity(3)
          verbosity += teddy.params.verbosity

          assert(verbosity, '1, 0, 0, 2, 2, 3, 3')
          verbosity = ''
          if (typeof process === 'object') {
            if (process.env.NODE_ENV === 'test') {
              teddy.setVerbosity(0)
            } else if (process.env.NODE_ENV === 'cover') {
              teddy.setVerbosity(3)
            }
          } else {
            teddy.setVerbosity(0)
          }
        },
        expected: ''
      },
      {
        message: 'should render undefined variables as text (misc/undefinedVar.html)',
        template: 'misc/undefinedVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>{undefinedVar}</p><p>{definedParent.undefinedMember}</p>'
      },
      {
        // the model has foo pointing at bar and bar back at foo. what matters is that the render finishes and writes the unresolvable variable out as it stands; teddy used to answer '{foo}' or '{bar}' depending on how many passes had run before it gave up on the loop
        message: 'should prevent infinitely referencing variables (misc/varRefVar.html)',
        template: 'misc/varRefVar',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setVerbosity(0)
          return teddy.render(template, model)
        },
        expected: ['{foo}', '{bar}']
      },
      {
        message: 'should render empty strings as is for variables that are empty strings (misc/emptyStringVariable.html)',
        template: 'misc/emptyStringVariable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p><p></p>'
      },
      {
        message: 'should render template with extraneous whitespace properly (misc/extraneousWhitespace.html)',
        template: 'misc/extraneousWhitespace',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>a</p><p>Something exists</p><p>b</p><p>Something exists</p><p>c</p><p>Something exists</p>'
      },
      {
        message: 'should render {variables} that resolve to true or false boolean literals as strings (misc/printBooleanLiteral.html)',
        template: 'misc/printBooleanLiteral',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>true</p><p>{somethingFalse}</p>'
      },
      {
        message: 'should render {zero} as 0 (misc/zero.html)',
        template: 'misc/zero',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>0</p>'
      },
      {
        message: 'should render {key-with-dashes} as true (misc/keyWithDashes.html)',
        template: 'misc/keyWithDashes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>true</p>'
      },
      {
        message: 'should render model value with quotes correctly without double-encoding the HTML entity (misc/varQuoteVal.html)',
        template: 'misc/varQuoteVal',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>&#34;hithere!&#34;</p>'
      },
      {
        message: 'should render html with a bad tag correctly (misc/badTag.html)',
        template: 'misc/badTag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>hello<br>world1</p><p>helloworld2</p>'
      },
      {
        message: 'should not render Teddy code in server-side comments in loops (misc/serverSideCommentsWithTeddyCode.html)',
        template: 'misc/serverSideCommentsWithTeddyCode',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><p>test</p><div>&lt;p&gt;hello&lt;/p&gt;</div><p>test</p><p>test</p><div>&lt;p&gt;hello&lt;/p&gt;</div><p>test</p><p>test</p><div>&lt;p&gt;hello&lt;/p&gt;</div><p>test</p></div>'
      },
      {
        message: 'should render img tags correctly (misc/imgSrc.html)',
        template: 'misc/imgSrc',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<img src="something.jpg"><img src="hello.jpg">'
      },
      {
        message: 'should parse embedded script tag correctly (misc/scriptWithEmptyObject.html)',
        template: 'misc/scriptWithEmptyObject',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<script>const something = {}</script>'
      },
      {
        message: 'should parse a script tag with a JSON string correctly (misc/scriptWithJson.html)',
        template: 'misc/scriptWithJson',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setVerbosity(0)
          return teddy.render(template, model)
        },
        expected: '<script>const thing = {"jhgfd":"{\\"id\\":1,\\"lkjhgfd\\":\\"sadfghj\\"}","lkjhgfds":"[]","asdfghj":"[{\\"kjhgfds\\":\\"asdfghj\\",\\"lkjhgfds\\":\\"asdfghjkl\\",\\"lkjhgfdsa\\":\\"asdfghjk\\",\\",ivtrew\\":\\"wesdfghj/l;kjhgrfds/ewrtyu\\",\\"hgbfvdsq\\":{\\"wertyukil\\":true},\\".,kjmhgfds\\":\\"/qwertyuikl/kjhgfds/k,jhgrefdsaz.css\\",\\"sdfhgjkl\\":\\"/,kjmhngefdsz/esrtyu/sdxfcgbhunjm-BorGorph.hfjsdknl\\"}]"}</script>'
      },
      {
        message: 'should render special characters correctly when piped through a teddy noparse flagged variable (misc/specialChars.html)',
        template: 'misc/specialChars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>special .$&@. chars</p>'
      },
      {
        message: 'should render empty strings as is for |p or |s variables that are empty strings (misc/emptyStringVariableFlags.html)',
        template: 'misc/emptyStringVariableFlags',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>'
      }
      // ,{
      //   message: '',
      //   template: '',
      //   run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
      //   expected: ''
      // }
    ]

  },
  {
    describe: 'Template caching',
    tests: [
      {
        message: 'should read a template again after it changes, rather than caching it, by default',
        runMocha: async (teddy, template, model, assert, expected) => {
          const file = 'test/templates/misc/cacheProbe.html'
          fs.writeFileSync(file, '<p>before</p>')
          teddy.clearTemplates()
          teddy.render(file, {})
          fs.writeFileSync(file, '<p>after</p>')
          const second = teddy.render(file, {})
          fs.rmSync(file)
          assert(second.includes('after'), true)
        },
        expected: ''
      },
      {
        message: 'should keep a template it already read when the cache option is on',
        runMocha: async (teddy, template, model, assert, expected) => {
          const file = 'test/templates/misc/cacheProbeOn.html'
          fs.writeFileSync(file, '<p>before</p>')
          teddy.clearTemplates()
          teddy.render(file, { cache: true })
          fs.writeFileSync(file, '<p>after</p>')
          const second = teddy.render(file, { cache: true })
          fs.rmSync(file)
          teddy.setCacheTemplates(false) // not setDefaultParams, which would also reset the template root the other tests rely on
          assert(second.includes('before'), true)
        },
        expected: ''
      },
      {
        message: "should take caching from express's view cache setting when no cache option is given",
        runMocha: async (teddy, template, model, assert, expected) => {
          const file = 'test/templates/misc/cacheProbeExpress.html'
          fs.writeFileSync(file, '<p>before</p>')
          teddy.clearTemplates()
          teddy.render(file, { settings: { 'view cache': true } })
          fs.writeFileSync(file, '<p>after</p>')
          const cached = teddy.render(file, { settings: { 'view cache': true } })

          teddy.clearTemplates()
          teddy.render(file, { settings: { 'view cache': false } })
          fs.writeFileSync(file, '<p>later still</p>')
          const fresh = teddy.render(file, { settings: { 'view cache': false } })

          fs.rmSync(file)
          teddy.setCacheTemplates(false) // not setDefaultParams, which would also reset the template root the other tests rely on
          assert(cached.includes('before') && fresh.includes('later still'), true)
        },
        expected: ''
      },
      {
        message: 'should let an explicit cache option override the view cache setting',
        runMocha: async (teddy, template, model, assert, expected) => {
          const file = 'test/templates/misc/cacheProbeOverride.html'
          fs.writeFileSync(file, '<p>before</p>')
          teddy.clearTemplates()
          teddy.render(file, { cache: false, settings: { 'view cache': true } })
          fs.writeFileSync(file, '<p>after</p>')
          const second = teddy.render(file, { cache: false, settings: { 'view cache': true } })
          fs.rmSync(file)
          teddy.setCacheTemplates(false) // not setDefaultParams, which would also reset the template root the other tests rely on
          assert(second.includes('after'), true)
        },
        expected: ''
      },
      {
        message: 'should read an included template again after it changes',
        runMocha: async (teddy, template, model, assert, expected) => {
          const partial = 'test/templates/misc/cachePartial.html'
          const page = 'test/templates/misc/cachePage.html'
          fs.writeFileSync(partial, '<span>before</span>')
          fs.writeFileSync(page, '<div><include src="misc/cachePartial"></include></div>')
          teddy.clearTemplates()
          teddy.render(page, {})
          fs.writeFileSync(partial, '<span>after</span>')
          const second = teddy.render(page, {})
          fs.rmSync(partial)
          fs.rmSync(page)
          assert(second.includes('after'), true)
        },
        expected: ''
      },
      {
        message: 'should prefer a template registered with setTemplate over a file of the same name',
        runMocha: async (teddy, template, model, assert, expected) => {
          const file = 'test/templates/misc/cacheRegistered.html'
          fs.writeFileSync(file, '<p>from the filesystem</p>')
          teddy.clearTemplates()
          teddy.setTemplate('misc/cacheRegistered', '<p>from setTemplate</p>')
          const rendered = teddy.render('misc/cacheRegistered', {})
          fs.rmSync(file)
          teddy.clearTemplates()
          assert(rendered.includes('from setTemplate'), true)
        },
        expected: ''
      }
    ]
  },
  {
    describe: 'Public API',
    tests: [
      {
        message: 'should render an include whose src cannot be found as nothing when includeNotFoundBehavior is hide',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setIncludeNotFoundBehavior('hide')
          const result = teddy.render('<div><include src="thisTemplateIsHidden"></include></div>', {})
          teddy.setIncludeNotFoundBehavior('display') // put it back, since the other include tests expect the message
          assert(result, expected)
        },
        expected: '<div></div>'
      },
      {
        // each of these two renders a template of its own rather than the same one twice, because what an include that cannot be found writes is settled when the template is compiled: a template already compiled under one setting is not recompiled because the setting changed
        message: 'should display an error for an include that cannot be found when includeNotFoundBehavior is display',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setIncludeNotFoundBehavior('display')
          assert(teddy.render('<div><include src="thisTemplateIsShown"></include></div>', {}), expected)
        },
        expected: '<div>Template "thisTemplateIsShown" not found!</div>'
      },
      {
        message: 'should list a template registered with setTemplate in getTemplates',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('getTemplatesProbe', '<p>probe</p>')
          const registered = teddy.getTemplates()
          assert(registered.getTemplatesProbe === '<p>probe</p>' ? 'listed' : `not listed: ${Object.keys(registered).length} template(s) registered`, expected)
        },
        expected: 'listed'
      }
    ]
  },
  {
    describe: 'Bundler tests',
    tests: [
      {
        message: 'should be able require teddy.cjs',
        runMocha: async (teddy, template, model, assert, expected) => {
          if (fs.existsSync('test/client.cjs')) fs.rmSync('test/client.cjs')

          fs.writeFileSync('test/client.cjs', 'const teddy = require("../dist/teddy.cjs")\nconsole.log(teddy)')
          const output = execSync('node ./test/client.cjs', { encoding: 'utf-8' }).toString()

          assert(output.includes('emptyVarBehavior:'))

          fs.rmSync('test/client.cjs')
        },
        expected: ''
      },
      {
        message: 'should be able to import teddy.mjs',
        runMocha: async (teddy, template, model, assert, expected) => {
          if (fs.existsSync('test/client.js')) fs.rmSync('test/client.js')

          fs.writeFileSync('test/client.js', 'import teddy from "../dist/teddy.mjs"\nconsole.log(teddy)')
          const output = execSync('node ./test/client.js', { encoding: 'utf-8' }).toString()

          assert(output.includes('emptyVarBehavior:'))

          fs.rmSync('test/client.js')
        },
        expected: ''
      },
      {
        message: 'should be able require teddy.client.cjs',
        runMocha: async (teddy, template, model, assert, expected) => {
          if (fs.existsSync('test/client.cjs')) fs.rmSync('test/client.cjs')

          fs.writeFileSync('test/client.cjs', 'const teddy = require("../dist/teddy.client.cjs")\nconsole.log(teddy)')
          const output = execSync('node ./test/client.cjs', { encoding: 'utf-8' }).toString()

          assert(output.includes('emptyVarBehavior:'))

          fs.rmSync('test/client.cjs')
        },
        expected: ''
      },
      {
        message: 'should be able to import teddy.client.mjs',
        runMocha: async (teddy, template, model, assert, expected) => {
          if (fs.existsSync('test/client.js')) fs.rmSync('test/client.js')

          fs.writeFileSync('test/client.js', 'import teddy from "../dist/teddy.client.mjs"\nconsole.log(teddy)')
          const output = execSync('node ./test/client.js', { encoding: 'utf-8' }).toString()

          assert(output.includes('emptyVarBehavior:'))

          fs.rmSync('test/client.js')
        },
        expected: ''
      },
      {
        message: 'should be able to import teddy.min.mjs',
        runMocha: async (teddy, template, model, assert, expected) => {
          if (fs.existsSync('test/client.js')) fs.rmSync('test/client.js')

          fs.writeFileSync('test/client.js', 'import teddy from "../dist/teddy.min.mjs"\nconsole.log(teddy)')
          const output = execSync('node ./test/client.js', { encoding: 'utf-8' }).toString()

          assert(output.includes('emptyVarBehavior:'))

          fs.rmSync('test/client.js')
        },
        expected: ''
      }
    ]
  },
  {
    describe: 'Compiler',
    tests: [
      {
        message: 'should compile a model value that is itself a template, such as an i18n string with a placeholder in it',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{greeting}</p>', { greeting: 'Hello {name}', name: 'Ada' }), expected),
        expected: '<p>Hello Ada</p>'
      },
      {
        message: 'should compile a model value holding teddy markup supplied through a |s variable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>{snippet|s}</div>', { snippet: '<if x>yes</if><else>no</else>' }), expected),
        expected: '<div>no</div>'
      },
      {
        message: 'should compile a model value holding a teddy loop supplied through a |s variable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>{snippet|s}</div>', { letters: ['a', 'b'], snippet: "<loop through='letters' val='letter'>[{letter}]</loop>" }), expected),
        expected: '<div>[a][b]</div>'
      },
      {
        message: 'should leave out markup from the model that does not open and close its own tags',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>A{half|s}B</div>', { half: '<if something>' }), expected),
        expected: '<div>AB</div>'
      },
      {
        message: 'should resolve a variable whose name is built from another variable and which also carries a flag (issue: the value used to be written twice)',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{a{b}|s}</p>', { b: 'X', aX: '<em>hi</em>' }), expected),
        expected: '<p><em>hi</em></p>'
      },
      {
        message: 'should resolve a variable whose name is built from another variable to nothing when the name it spells is not in the model',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{a{b}}</p>', { b: 'X' }), expected),
        expected: '<p>{aX}</p>'
      },
      {
        message: 'should render a one line if carrying more than four conditions on one element',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render("<p if-a true='data-a=\"1\"' if-b true='data-b=\"1\"' if-c true='data-c=\"1\"' if-d true='data-d=\"1\"' if-e true='data-e=\"1\"'>hi</p>", { a: true, b: false, c: true, d: false, e: true }), expected),
        expected: '<p data-a="1" data-c="1" data-e="1">hi</p>'
      },
      {
        message: 'should apply a checked-value whose value comes from the model',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render("<div checked-value='{pick}'><input type='checkbox' value='a'><input type='checkbox' value='b'></div>", { pick: 'b' }), expected),
        expected: '<div><input type="checkbox" value="a"><input type="checkbox" value="b" checked="checked"></div>'
      },
      {
        message: 'should apply a selected-value to options generated by a loop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render("<select selected-value='b'><loop through='letters' val='letter'><option value='{letter}'>{letter}</option></loop></select>", { letters: ['a', 'b'] }), expected),
        expected: '<select><option value="a">a</option><option value="b" selected="selected">b</option></select>'
      },
      {
        message: 'should compile a template that contains the control character the compiler uses to mark its own placeholders',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>a' + String.fromCharCode(1) + '{x}' + String.fromCharCode(1) + 'b</p>', { x: 'X' }), expected),
        expected: '<p>a' + String.fromCharCode(1) + 'X' + String.fromCharCode(1) + 'b</p>'
      },
      {
        message: 'should render an <inline> element that names neither css nor js as nothing',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div><inline></inline></div>', {}), expected),
        expected: '<div></div>'
      },
      {
        message: 'should render an <include> whose src is a variable and which is passed an argument',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerDynamicPartial', '<p>{label}</p>')
          return assert(teddy.render("<include src='{which}'><arg label>from an arg</arg></include>", { which: 'compilerDynamicPartial' }), expected)
        },
        expected: '<p>from an arg</p>'
      },
      {
        message: 'should write out a value that refers back to itself rather than resolving forever, and say which values led round the loop',
        runMocha: async (teddy, template, model, assert, expected) => {
          const said = []
          const error = console.error
          console.error = message => said.push(message)
          teddy.setVerbosity(1)
          let rendered
          try {
            rendered = teddy.render('<p>{foo}</p>', { foo: '{bar}', bar: '{foo}' })
          } finally {
            console.error = error
            teddy.setVerbosity(0)
          }
          assert(rendered === '<p>{bar}</p>' && said.length === 1 && said[0].includes('refers back to itself') && said[0].includes('"{bar}" -> "{foo}" -> "{bar}"'))
        },
        expected: true
      },
      {
        message: 'should say so when a template closes a tag it never opened',
        runMocha: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          console.warn = message => said.push(message)
          teddy.setVerbosity(1)
          try {
            teddy.clearTemplates()
            teddy.render('<div>hello</div></div>', {})
          } finally {
            console.warn = warn
            teddy.setVerbosity(0)
          }
          assert(said.some(message => message.includes('closes a <div> it never opened')))
        },
        expected: true
      },
      {
        message: 'should say so when a variable is given markup that does not open and close its own tags',
        runMocha: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          console.warn = message => said.push(message)
          teddy.setVerbosity(1)
          try {
            teddy.render('<div>{half|s}</div>', { half: '<if something>' })
          } finally {
            console.warn = warn
            teddy.setVerbosity(0)
          }
          assert(said.some(message => message.includes('not complete on its own')))
        },
        expected: true
      },
      {
        message: 'should say so when an outcome attribute has no if- condition to go with it',
        runMocha: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          console.warn = message => said.push(message)
          teddy.setVerbosity(1)
          let rendered
          try {
            teddy.clearTemplates()
            rendered = teddy.render('<p true=\'class="orphan"\'>hi</p>', {})
          } finally {
            console.warn = warn
            teddy.setVerbosity(0)
          }
          assert(rendered === '<p>hi</p>' && said.some(message => message.includes('with no if- condition')))
        },
        expected: true
      },
      {
        message: 'should say so when an <arg> has no <include> around it',
        runMocha: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          console.warn = message => said.push(message)
          teddy.setVerbosity(1)
          let rendered
          try {
            teddy.clearTemplates()
            rendered = teddy.render('<div><arg orphan>gone</arg></div>', {})
          } finally {
            console.warn = warn
            teddy.setVerbosity(0)
          }
          assert(rendered === '<div></div>' && said.some(message => message.includes('has no <include> around it')))
        },
        expected: true
      },
      {
        // this is how a layout works: the page is handed to it as an argument and written out with |s. the rendered page holds teddy's own markers for the blocks it lifted out of parsing, and those markers must not be mistaken for blocks of their own on the way through
        message: 'should keep a non-parsed block intact when the markup holding it is passed on through another variable',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerLayout', '<body>{pageContent|s}</body>')
          return assert(teddy.render("<include src='compilerLayout'><arg pageContent><pre><code>{notAVariable}</code></pre></arg></include>", {}), expected)
        },
        expected: '<body><pre><code>{notAVariable}</code></pre></body>'
      },
      {
        message: 'should keep a <noteddy> block intact when the markup holding it is passed on through another variable',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerLayout2', '<body>{pageContent|s}</body>')
          return assert(teddy.render("<include src='compilerLayout2'><arg pageContent><p><noteddy>{notAVariable}</noteddy></p></arg></include>", {}), expected)
        },
        expected: '<body><p>{notAVariable}</p></body>'
      },
      {
        message: 'should say so when a selected-value cannot reach the elements it would mark',
        runMocha: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          console.warn = message => said.push(message)
          teddy.setVerbosity(1)
          try {
            teddy.clearTemplates()
            teddy.setTemplate('compilerOptionsPartial', '<option value="b">b</option>')
            teddy.render("<select selected-value='b'><include src='{which}'></include></select>", { which: 'compilerOptionsPartial' })
          } finally {
            console.warn = warn
            teddy.setVerbosity(0)
          }
          assert(said.some(message => message.includes('could not be applied')))
        },
        expected: true
      },
      {
        // a template the emitter cannot write javascript for still renders, by walking the node tree, and renders the same markup. that makes a mistake in the emitter invisible to every other test here and to compareBuilds.js as well: the output stays right and only the speed goes. this is the one thing that notices
        //
        // it has no runPlaywright counterpart on purpose: browser builds do not carry the emitter at all, so there is nothing there to fall back from
        message: 'should emit javascript for every template in the test suite rather than falling back to walking it',
        runMocha: async (teddy, template, model, assert, expected) => {
          const refused = []
          const warn = console.warn
          console.warn = message => {
            if (typeof message === 'string' && message.includes('could not emit javascript')) refused.push(message)
          }
          teddy.setVerbosity(2)
          try {
            for (const name of testTemplateNames('test/templates')) {
              try {
                teddy.render(name, model)
              } catch (err) {
                // a template that is meant to throw is not what this is asking about
              }
            }
          } finally {
            console.warn = warn
            teddy.setVerbosity(0)
          }
          assert(refused.length ? refused.join(' | ') : 'none', 'none')
        },
        expected: 'none'
      }
    ]
  }
]
