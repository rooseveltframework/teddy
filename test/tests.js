import { execSync } from 'child_process'
import fs from 'fs'

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
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition (conditionals/ifElse.html)',
        template: 'conditionals/ifElse',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <if something=\'Some content\'> as true (conditionals/ifValue.html)',
        template: 'conditionals/ifValue',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>The variable \'something\' is set to \'Some content\'</p>'
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
        message: 'should reduce multiple one line if statements down to only the first one (conditionals/oneLineMulti.html)',
        template: 'conditionals/oneLineMulti',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="something-is-present">One line if.</p>',
        skip: true // TODO: this test is wrong. the behavior differs in cheerio vs vanilla. both behaviors are arguably wrong. in cheerio it removes the second one line if. in vanilla it removes the first one. the correct behavior would be to parse both
      },
      {
        message: 'should evaluate one line if "if-something" with a dynamic value (conditionals/oneLineDynamicVariable.html)',
        template: 'conditionals/oneLineDynamicVariable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p class="some-class">Some content</p>'
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
        expected: '<div><p>Some content</p></div>'
      },
      {
        message: 'should escape from infinite loop of includes via setMaxPasses (includes/includeInfiniteLoop.html)',
        template: 'includes/includeInfiniteLoop',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setVerbosity(3)
          teddy.setMaxPasses(100)

          try {
            teddy.render(template, model)
          } catch (e) {
            return e.message
          }
        },
        expected: 'teddy could not finish rendering the template because the max number of passes over the template (100) was exceeded; there may be an infinite loop in your template logic.'
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
        message: 'should loop through {arrays} correctly (looping/loopArrayOfArrays.html)',
        template: 'looping/loopArrayOfArrays',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>0</p><p>a</p><p>b</p><p>c</p><p>1</p><p>d</p><p>e</p><p>f</p><p>2</p><p>g</p><p>h</p><p>i</p>'
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
          console.log('    → Non-cached time to parse: ', time)
          const start2 = new Date().getTime()
          teddy.render(template, model)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Cached time to parse:     ', time2)
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
        expected: '<p></p>',
        skip: true
      },
      {
        message: 'should force display missing variables and display the variable {missing|d} but remove |d (misc/varForceEmptyDisplay.html)',
        template: 'misc/varForceEmptyDisplay',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>{missing}</p>',
        skip: true
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
        message: 'should render {variables} within style element (misc/styleVariables.html)',
        template: 'misc/styleVariables',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<style>p{height:10px;}</style>'
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

          teddy.setCache({
            template,
            key: null,
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          teddy.render(template, model)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          console.log('    → Non-cached time to parse: ', time1)

          const start2 = new Date().getTime()
          teddy.render(template, model)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Cached time to parse:     ', time2)

          await timeout(1100)
          const start3 = new Date().getTime()
          teddy.render(template, model)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Non-cached time to parse after clearing cache: ', time3)
          const fasterSlower = time2 < 100 && time3 > 100
          assert(fasterSlower)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache is explicitly cleared (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setCache({
            template,
            key: null,
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          teddy.render(template, model)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          console.log('    → Non-cached time to parse: ', time1)

          const start2 = new Date().getTime()
          teddy.render(template, model)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Cached time to parse:     ', time2)
          teddy.clearCache({
            template,
            key: null
          })

          const start3 = new Date().getTime()
          teddy.render(template, model)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Non-cached time to parse after clearing cache: ', time3)
          const fasterSlower = time2 < 100 && time3 > 100
          assert(fasterSlower)
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

          const modelNY = Object.assign({ city: 'NY' }, model)
          const modelSF = Object.assign({ city: 'SF' }, model)
          teddy.setCache({
            template,
            key: 'city',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          console.log('    → Non-cached time to parse (NY): ', time1)

          const start3 = new Date().getTime()
          teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Non-cached time to parse (SF): ', time2)

          await timeout(1100)
          const start4 = new Date().getTime()
          teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)
          const fasterSlower = time3 < 100 && time4 > 100
          assert(fasterSlower)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires via keyed values when the cache is explicitly cleared (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          const modelNY = Object.assign({ city: 'NY' }, model)
          const modelSF = Object.assign({ city: 'SF' }, model)
          teddy.setCache({
            template,
            key: 'city',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          console.log('    → Non-cached time to parse (NY): ', time1)

          const start3 = new Date().getTime()
          teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Non-cached time to parse (SF): ', time2)
          teddy.clearCache({
            template,
            key: 'city'
          })

          const start4 = new Date().getTime()
          teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)
          const fasterSlower = time3 < 100 && time4 > 100
          assert(fasterSlower)
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

          const modelNY = Object.assign({ city: { acronym: 'NY' } }, model)
          const modelSF = Object.assign({ city: { acronym: 'SF' } }, model)
          teddy.setCache({
            template,
            key: 'city.acronym',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          console.log('    → Non-cached time to parse (NY): ', time1)

          const start3 = new Date().getTime()
          teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Non-cached time to parse (SF): ', time2)

          await timeout(1100)
          const start4 = new Date().getTime()
          teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)
          const fasterSlower = time3 < 100 && time4 > 100
          assert(fasterSlower)
        },
        expected: ''
      },
      {
        message: 'should render template, then render cached template, then render the template again when the cache expires via keyed values with nesting when the cache is explicitly cleared (misc/cacheWholeTemplate.html)',
        template: 'misc/cacheWholeTemplate',
        run: async (teddy, template, model, assert, expected) => {
          const modelNY = Object.assign({ city: { acronym: 'NY' } }, model)
          const modelSF = Object.assign({ city: { acronym: 'SF' } }, model)
          teddy.setCache({
            template,
            key: 'city.acronym',
            maxAge: 1000
          })
          const start1 = new Date().getTime()
          teddy.render(template, modelNY)
          const end1 = new Date().getTime()
          const time1 = end1 - start1
          console.log('    → Non-cached time to parse (NY): ', time1)

          const start3 = new Date().getTime()
          teddy.render(template, modelNY)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Cached time to parse (NY):     ', time3)

          const start2 = new Date().getTime()
          teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Non-cached time to parse (SF): ', time2)
          teddy.clearCache({
            template,
            key: 'city.acronym'
          })

          const start4 = new Date().getTime()
          teddy.render(template, modelSF)
          const end4 = new Date().getTime()
          const time4 = end4 - start4
          console.log('    → Non-cached time to parse after clearing cache (SF): ', time4)
          const fasterSlower = time3 < 100 && time4 > 100
          assert(fasterSlower)
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
          console.log('    → Non-cached time to parse (NY): ', time1)
          present = typeof teddy.templateCaches[template]['city.acronym'].entries.NY === 'object'
          assert(present)
          await timeout(100)

          const start2 = new Date().getTime()
          teddy.render(template, modelSF)
          const end2 = new Date().getTime()
          const time2 = end2 - start2
          console.log('    → Non-cached time to parse (SF): ', time2)
          present = typeof teddy.templateCaches[template]['city.acronym'].entries.SF === 'object'
          assert(present)
          await timeout(100)

          const start3 = new Date().getTime()
          teddy.render(template, modelLA)
          const end3 = new Date().getTime()
          const time3 = end3 - start3
          console.log('    → Non-cached time to parse (LA): ', time3)
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
        message: 'should prevent infinitely referencing variables (misc/varRefVar.html)',
        template: 'misc/varRefVar',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setVerbosity(0)
          return teddy.render(template, model)
        },
        expected: '{foo}'
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
        expected: '<div><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p></div>'
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
  }
]
