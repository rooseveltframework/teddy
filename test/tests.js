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

// these tests are shared by both runners: node's own test runner, and playwright
//
// to skip test groups or individual tests, add `skip: true` to the group or test object
//
// to test an individual group or test, add `only: true` to the group or test object
//
// to run a test only in node or only in a browser, use `runNode` or `runPlaywright` instead of `run`
//
// if multiple results are acceptable, make `expected` an array of strings rather than a string
//
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
        //
        // an empty value cannot be told apart from no value at all, so it reads as a plain truthiness check, and since it supplies only a false outcome it contributes nothing here
        //
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
        message: 'should evaluate <if> and <elseif> conditions whose names contain a {variable} (conditionals/conditionalVarInName.html)',
        template: 'conditionals/conditionalVarInName',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>jack: guy</p><p>jill: girl</p><p>hill: landscape</p>'
      },
      {
        message: 'should evaluate <if> and one line if conditions whose names contain a template literal ${variable} (conditionals/conditionalTemplateLiteralVarInName.html)', // eslint-disable-line
        template: 'conditionals/conditionalTemplateLiteralVarInName',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>jack: guy</p><p class="other" title="girl">jill</p><p class="other">hill</p>'
      },
      {
        message: 'should evaluate one line if whose condition name contains a {variable} (conditionals/oneLineVarInName.html)',
        template: 'conditionals/oneLineVarInName',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<span class="unmatched">guy</span><span class="matched">girl</span><span class="unmatched">landscape</span>'
      },
      {
        message: 'should evaluate <elseif> and <elseunless> conditions whose values contain a {variable} (conditionals/elseIfValueVar.html)',
        template: 'conditionals/elseIfValueVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>elseif</p><p>elseunless</p>'
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
        message: 'should resolve a {variable} in the name of an <arg> passed to an <include> whose src is written out (includes/includeArgNameVar.html)',
        template: 'includes/includeArgNameVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>from an arg</p>'
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
        message: 'should resolve {variables} in a <loop>\'s key and val, including in a loop nested inside it that walks the outer val (looping/loopKeyValFromVars.html)',
        template: 'looping/loopKeyValFromVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>one</p><span>a=1</span><span>b=2</span><span>c=3</span><p>two</p><span>a=4</span><span>b=5</span><span>c=6</span><p>three</p><span>a=7</span><span>b=8</span><span>c=9</span>'
      },
      {
        message: 'should resolve a {variable} in a <loop>\'s val and read it from a one line if inside the loop (looping/loopValFromVarWithOneLineIf.html)',
        template: 'looping/loopValFromVarWithOneLineIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<b>1</b><b class="four">4</b><b>7</b>'
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
        message: 'should loop through an array of 5000 elements (looping/largeDataSet.html)',
        template: 'looping/largeDataSet',
        run: async (teddy, template, model, assert, expected) => {
          const rendered = teddy.render(template, model)
          const last = model.largeDataSet.length - 1
          assert(rendered.replace(/\s/g, '').endsWith(`<p>${last}</p><p>${model.largeDataSet[last].one}</p><p>${model.largeDataSet[last].two}</p><p>${model.largeDataSet[last].three}</p>`), true)
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
        message: 'should keep the dollar of a template literal ${variable} whose name is built from another variable when it does not resolve (misc/computedVarTemplateLiteralMissing.html)', // eslint-disable-line
        template: 'misc/computedVarTemplateLiteralMissing',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>${names.jackx}</p>' // eslint-disable-line
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
        // a value from the model is still parsed for {variables} of its own, but it doesn't get to unescape anything: a {variable|s} inside it is written escaped, as the value around it is
        message: 'should write a {variable|s} that sits inside an escaped variable\'s value escaped (misc/rawFlagInsideEscapedVar.html)',
        template: 'misc/rawFlagInsideEscapedVar',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Before &lt;span&gt;raw html&lt;/span&gt; after</p>'
      },
      {
        // a variable counts as raw when a |s turns up anywhere among its last few characters, so taking out only a |s that ends the variable left {x||ss} and {x||sh} raw
        message: 'should write a {variable||ss} or {variable||sh} that sits inside an escaped variable\'s value escaped',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{a}</p><p>{b}</p>', { a: '{evil||ss}', b: '{evil||sh}', evil: '<img src=x onerror=alert(1)>' }), expected),
        expected: '<p>&lt;img src=x onerror=alert(1)&gt;</p><p>&lt;img src=x onerror=alert(1)&gt;</p>'
      },
      {
        message: 'should write a variable whose name is built from another variable and that sits inside an escaped variable\'s value escaped',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{bio}</p>', { bio: '{names.{key}|s}', key: 'about', names: { about: '<img src=x onerror=alert(1)>' } }), expected),
        expected: '<p>&lt;img src=x onerror=alert(1)&gt;</p>'
      },
      {
        message: 'should leave the text of an escaped variable\'s value that is not a {variable} as it is when taking the |s flags out of the {variables} in it',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{bio}</p>', { bio: 'cmd|sort {x {a|s} |s', a: 'A' }), expected),
        expected: '<p>cmd|sort {x {a} |s</p>'
      },
      {
        // the value is the model's to choose, so one made of braces or of pipes and esses, built to make a scan go back over itself, must not hold up the render
        message: 'should take the |s flags out of an escaped variable\'s value in one pass however the value is built',
        run: async (teddy, template, model, assert, expected) => {
          const started = Date.now()
          teddy.render('<p>{a}</p><p>{b}</p>', { a: '{'.repeat(200000) + '|s', b: '{' + '|'.repeat(100000) + 's'.repeat(100000) + '}' })
          return assert(Date.now() - started < 2000, expected)
        },
        expected: true
      },
      {
        message: 'should render a frozen model, leaving the model it was given as it was',
        run: async (teddy, template, model, assert, expected) => {
          const frozen = Object.freeze({ name: 'world', markup: '<b>{name}</b>' })
          const rendered = teddy.render('<p>Hello {name}</p><noteddy>{name}</noteddy><p>{markup|p}</p>', frozen)
          assert(`${rendered} ${Object.keys(frozen).join(',')}`, expected)
        },
        expected: '<p>Hello world</p>{name}<p>&lt;b&gt;{name}&lt;/b&gt;</p> name,markup'
      },
      {
        // the test runners compare renders with their whitespace taken out, so this one looks for the space itself
        message: 'should keep the whitespace between two elements',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p><span>A</span> <span>B</span></p>', {}).includes('</span> <span>'), true),
        expected: 'true'
      },
      {
        // escaped, an &amp; in a value is &amp;amp;, which a browser displays as the &amp; the value holds
        message: 'should escape an entity in a variable\'s value, so it displays as the value has it',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{entityInValue}</p>', { entityInValue: 'Tom &amp; Jerry' }), expected),
        expected: '<p>Tom &amp;amp; Jerry</p>'
      },
      {
        message: 'should apply every one line if on an element in an included template, as in the template including it',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('kethitestOneLineIfs', '<div if-first true="data-first" if-second true="data-second"></div>')
          assert(teddy.render('<loop through="rows" val="row"><include src="kethitestOneLineIfs"></include></loop>', { rows: [1], first: true, second: true }), expected)
        },
        expected: ['<div data-first data-second></div>', '<div data-first="" data-second=""></div>']
      },
      {
        message: 'should select the option whose value matches a selected-value, whatever flags either value is written with',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<select selected-value="{chosen|p}"><loop through="choices" val="choice"><option value="{choice.value|p}">{choice.label|p}</option></loop></select>', { chosen: 'b {x}', choices: [{ value: 'a', label: 'A' }, { value: 'b {x}', label: 'B {x}' }] }), expected),
        expected: '<select><option value="a">A</option><option value="b {x}" selected="selected">B {x}</option></select>'
      },
      {
        message: 'should keep the entities written in a template as they are, inside elements and in attributes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p title="&quot;A&quot; &amp; B">&nbsp;A&mdash;B &#169; &#x2122;</p>', {}), expected),
        expected: ['<p title="&quot;A&quot; &amp; B">&nbsp;A&mdash;B &#169; &#x2122;</p>', '<p title="&quot;A&quot; &amp; B">&nbsp;A—B © ™</p>', '<p title="&#34;A&#34; &amp; B">&nbsp;A&mdash;B &#169; &#x2122;</p>']
      },
      {
        message: 'should escape an entity-like value in a variable, so it displays as the value has it rather than as the character',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{value}</p>', { value: '&nbsp; &#169;' }), expected),
        expected: '<p>&amp;nbsp; &amp;#169;</p>'
      },
      {
        // svg's names have capitals in them, which an html parser keeps for elements inside an <svg>. node writes an empty svg element as self-closing and a browser doesn't, so either is right
        message: 'should keep the case of svg element and attribute names, around teddy tags inside them',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<svg viewBox="0 0 10 10"><defs><linearGradient id="g"></linearGradient></defs><if something><rect width="1"></rect></if></svg>', model), expected),
        expected: ['<svg viewBox="0 0 10 10"><defs><linearGradient id="g"/></defs><rect width="1"></rect></svg>', '<svg viewBox="0 0 10 10"><defs><linearGradient id="g"></linearGradient></defs><rect width="1"></rect></svg>']
      },
      {
        message: 'should escape a {variable|p} while leaving the {variables} in it unparsed (misc/noParseFlagEscapes.html)',
        template: 'misc/noParseFlagEscapes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>&lt;b&gt;{something}&lt;/b&gt;</p>'
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
        message: 'should resolve present variables normally when flagged with |h or |d (misc/varForceEmptyFlagsPresent.html)',
        template: 'misc/varForceEmptyFlagsPresent',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<p>Some content</p><p>Some content</p><p>guy</p><p>guy</p>'
      },
      {
        message: 'should render <inline> tags (misc/inlineTag.html)',
        template: 'misc/inlineTag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<div><style>body{font-family:sans-serif;}</style><script>console.log("hello")</script></div>'
      },
      {
        message: 'should resolve {variables} in an <inline> tag\'s css and js attributes (misc/inlineTagVars.html)',
        template: 'misc/inlineTagVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<style>p{color:red}</style><script>let a = 1</script>'
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
        expected: '<p>special .$&amp;@. chars</p>' // (escaped, since |p only stops the value being parsed)
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
      },
      {
        // a registered template can't go stale behind teddy's back, since setTemplate throws away what was compiled under a name it's given new markup for, so it's kept whether or not caching is on. its markup is changed here without setTemplate, which nothing should do, only to see that the second render comes from what the first one compiled
        message: 'should render a registered template again from what it compiled the first time, even with caching off',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setCacheTemplates(false)
          teddy.setTemplate('misc/registeredCompiledOnce', '<p>first</p>')
          teddy.render('misc/registeredCompiledOnce', {})
          teddy.getTemplates()['misc/registeredCompiledOnce'] = '<p>changed without setTemplate</p>'
          const second = teddy.render('misc/registeredCompiledOnce', {})
          delete teddy.getTemplates()['misc/registeredCompiledOnce']
          assert(second, expected)
        },
        expected: '<p>first</p>'
      },
      {
        message: 'should render a registered template\'s new markup once setTemplate replaces it, when it was rendered by its name without .html',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setCacheTemplates(false)
          teddy.setTemplate('misc/registeredReplaced.html', '<p>first</p>')
          const first = teddy.render('misc/registeredReplaced', {})
          teddy.setTemplate('misc/registeredReplaced.html', '<p>second</p>')
          const second = teddy.render('misc/registeredReplaced', {})
          delete teddy.getTemplates()['misc/registeredReplaced.html']
          assert(`${first} ${second}`, expected)
        },
        expected: '<p>first</p> <p>second</p>'
      }
    ]
  },
  {
    describe: 'Public API',
    tests: [
      {
        message: 'should apply render options to that render alone',
        run: async (teddy, template, model, assert, expected) => {
          const hidden = teddy.render('<p>[{notInTheModel}]</p>', {}, { emptyVarBehavior: 'hide' })
          const shown = teddy.render('<p>[{notInTheModel}]</p>', {})
          assert(`${hidden} ${shown}`, expected)
        },
        expected: '<p>[]</p> <p>[{notInTheModel}]</p>'
      },
      {
        message: 'should call a callback passed in place of options, as express does, or after them',
        run: async (teddy, template, model, assert, expected) => {
          let third = ''
          let fourth = ''
          teddy.render('<p>{hello}</p>', { hello: 'world' }, (err, html) => { if (!err) third = html })
          teddy.render('<p>[{nope}]</p>', {}, { emptyVarBehavior: 'hide' }, (err, html) => { if (!err) fourth = html })
          assert(`${third} ${fourth}`, expected)
        },
        expected: '<p>world</p> <p>[]</p>'
      },
      {
        message: 'should render into a DocumentFragment, handing back the elements with a ref by name, without the attribute',
        runPlaywright: async (teddy, template, model, assert, expected) => {
          const fragment = teddy.renderFragment('<form><p ref="greeting">Hello {name}</p><button ref="ok">OK</button></form>', { name: 'world' })
          const holder = document.createElement('div')
          holder.append(fragment)
          assert(`${fragment.refs.greeting.textContent} ${fragment.refs.ok.tagName} ${holder.innerHTML}`, expected)
        },
        expected: 'Hello world BUTTON <form><p>Hello world</p><button>OK</button></form>'
      },
      {
        message: 'should say renderFragment needs a DOM where there is none',
        runNode: async (teddy, template, model, assert, expected) => {
          let said = ''
          try {
            teddy.renderFragment('<p>hi</p>', {})
          } catch (err) {
            said = err.message.includes('needs a DOM') ? 'threw' : err.message
          }
          assert(said, expected)
        },
        expected: 'threw'
      },
      {
        message: 'should check a template without rendering it or printing anything, returning its warnings, each naming the template',
        run: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          const verbosity = teddy.params.verbosity
          console.warn = message => said.push(message)
          teddy.setVerbosity(1) // (so a warning would be printed, were check printing them)
          let found
          try {
            teddy.setTemplate('checkProbe', '<div><p>fine</p></span></div>')
            found = teddy.check('checkProbe')
          } finally {
            teddy.setVerbosity(verbosity)
            console.warn = warn
            delete teddy.getTemplates().checkProbe
          }
          const clean = teddy.check('<p>{fine}</p>')
          const missing = teddy.check('noTemplateCalledThis')
          assert(`${found.length} ${found[0].startsWith('checkProbe: ') && found[0].includes('never opened')} ${clean.length} ${missing[0]} ${said.length}`, expected)
        },
        expected: '1 true 0 noTemplateCalledThis: there is no template by this name 0'
      },
      {
        message: 'should name the template a warning is about',
        run: async (teddy, template, model, assert, expected) => {
          const said = []
          const warn = console.warn
          const verbosity = teddy.params.verbosity
          console.warn = message => said.push(message)
          teddy.setVerbosity(1)
          try {
            teddy.setTemplate('namedWarningProbe', '<div><p>fine</p></span></div>')
            teddy.render('namedWarningProbe', {})
          } finally {
            teddy.setVerbosity(verbosity)
            console.warn = warn
            delete teddy.getTemplates().namedWarningProbe
          }
          assert(said.some(message => message.startsWith('teddy: namedWarningProbe: ') && message.includes('never opened')), expected)
        },
        expected: true
      },
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        message: 'should not parse a teddy tag inside a <script> written in the template',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>A<script>const a = "<include src=x>"</script>B</div>', {}), expected),
        expected: '<div>A<script>const a = "<include src=x>"</script>B</div>'
      },
      {
        message: 'should not parse a teddy tag inside a <style> written in the template',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div><style>a::after { content: "<if x>" }</style></div>', {}), expected),
        expected: '<div><style>a::after { content: "<if x>" }</style></div>'
      },
      {
        message: 'should not parse a teddy tag inside a <textarea> written in the template',
        run: async (teddy, template, model, assert, expected) => {
          // a browser writes a textarea's text back out with its angle brackets escaped where the server leaves them as they were. both mean the same text, so the brackets are put back before comparing: what matters is that the teddy tag inside was not run and the textarea survived
          const unescapeTextarea = html => html.replace(/(<textarea[^>]*>)([\s\S]*?)(<\/textarea>)/g, (m, open, text, close) => open + text.replace(/&lt;/g, '<').replace(/&gt;/g, '>') + close)
          assert(unescapeTextarea(teddy.render('<div><textarea><unless y></textarea></div>', {})), expected)
        },
        expected: '<div><textarea><unless y></textarea></div>'
      },
      {
        message: 'should read an unquoted attribute value as the value itself',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p class=greeting data-count=2>{x}</p>', { x: 'hi' }), expected),
        expected: '<p class="greeting" data-count="2">hi</p>'
      },
      {
        message: 'should not count a teddy tag inside a <script> in a |s variable as markup that is left open',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>A{snippet|s}B</div>', { snippet: '<script>const a = "<include src=x>"</script>' }), expected),
        expected: '<div>A<script>const a = "<include src=x>"</script>B</div>'
      },
      {
        message: 'should not count a teddy tag inside a <style> in a |s variable as markup that is left open',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>{snippet|s}</div>', { snippet: '<style>a::after { content: "<if x>" }</style>' }), expected),
        expected: '<div><style>a::after { content: "<if x>" }</style></div>'
      },
      {
        message: 'should not count a teddy tag inside a <textarea> in a |s variable as markup that is left open',
        run: async (teddy, template, model, assert, expected) => {
          // a browser writes a textarea's text back out with its angle brackets escaped where the server leaves them as they were. both mean the same text, so the brackets are put back before comparing: what matters is that the teddy tag inside was not run and the textarea survived
          const unescapeTextarea = html => html.replace(/(<textarea[^>]*>)([\s\S]*?)(<\/textarea>)/g, (m, open, text, close) => open + text.replace(/&lt;/g, '<').replace(/&gt;/g, '>') + close)
          assert(unescapeTextarea(teddy.render('<div>{snippet|s}</div>', { snippet: '<textarea><unless y></textarea>' })), expected)
        },
        expected: '<div><textarea><unless y></textarea></div>'
      },
      {
        message: 'should render a <pre> in a |s variable the same way as a <pre> written in the template',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>{snippet|s}</div>', { snippet: '<pre><include src=x></pre>' }), expected),
        expected: '<div><pre><include src="x"></include></pre></div>' // what the same <pre> written in the template renders to
      },
      {
        message: 'should still parse a <pre parse> in a |s variable',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<div>{snippet|s}</div>', { x: true, snippet: '<pre parse><if x>yes</if></pre>' }), expected),
        expected: '<div><pre>yes</pre></div>'
      },
      {
        message: 'should not warn about a closing tag inside a <script> in a template',
        runNode: async (teddy, template, model, assert, expected) => {
          const warnings = []
          const originalWarn = console.warn
          const originalVerbosity = teddy.params.verbosity
          console.warn = message => warnings.push(message)
          teddy.setVerbosity(1)
          try {
            teddy.render('<div><script>document.body.innerHTML = "</p>"</script></div>', {})
          } finally {
            teddy.setVerbosity(originalVerbosity)
            console.warn = originalWarn
          }
          assert(warnings.filter(message => message.includes('never opened')).length ? 'warned' : 'silent', expected)
        },
        expected: 'silent'
      },
      {
        message: 'should resolve a variable whose name is built from another variable and which also carries a flag (issue: the value used to be written twice)',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{a{b}|s}</p>', { b: 'X', aX: '<em>hi</em>' }), expected),
        expected: '<p><em>hi</em></p>'
      },
      {
        message: 'should not take a |s flag from the value a variable whose name is built from another variable was given (GHSA-c7m5-3w9v-5c92)',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{names.{key}}</p>', { key: 'about|s', names: { about: '<img src=x onerror=alert(1)>' } }), expected),
        expected: '<p>{names.about}</p>'
      },
      {
        message: 'should not take |p|s flags from the value a variable whose name is built from another variable was given',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{names.{key}}</p>', { key: 'about|p|s', names: { about: '<img src=x>' } }), expected),
        expected: '<p>{names.about|p}</p>'
      },
      {
        message: 'should not take a |s flag from the value a ${variable} whose name is built from another variable was given', // eslint-disable-line
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>${names.{key}}</p>', { key: 'about|s', names: { about: '<img src=x>' } }), expected), // eslint-disable-line
        expected: '<p>${names.about}</p>' // eslint-disable-line
      },
      {
        // a name that is not in the model is written back as a variable, and a layout taking the page as an argument parses it again, by which time a |s the value put into it would be a flag
        message: 'should not take a |s flag from the value a variable whose name is built from another variable was given when the page is passed on through a layout',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('computedNameLayout', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="computedNameLayout"><arg pageContent><p>{names.{key}}</p></arg></include>', { key: 'about|p|s', names: { about: '<img src=x onerror=alert(1)>' } }), expected)
        },
        expected: '<main><p>&lt;img src=x onerror=alert(1)&gt;</p></main>'
      },
      {
        message: 'should not take a |s flag from the value a variable whose name is built from another variable was given when it spells the flag in a way that is not at the end',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('computedNameLayout2', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="computedNameLayout2"><arg pageContent><p>{names.{key}}</p></arg></include>', { key: 'about||ss', names: { about: '<img src=x onerror=alert(1)>' } }), expected)
        },
        expected: '<main><p>&lt;img src=x onerror=alert(1)&gt;</p></main>'
      },
      {
        // a value closing the variable early would otherwise point the template's own |s at any variable it liked once a layout parsed the page again
        message: 'should not let the value a variable whose name is built from another variable was given close the variable early and take the template\'s |s flag elsewhere',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('computedNameLayout3', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="computedNameLayout3"><arg pageContent><p>{names.{key}|s}</p></arg></include>', { key: 'x}{evil', names: { about: '<b>ok</b>' }, evil: '<img src=x onerror=alert(1)>' }), expected)
        },
        expected: '<main><p>{names.x}&lt;img src=x onerror=alert(1)&gt;</p></main>'
      },
      {
        message: 'should keep the template\'s own |s flag on a variable whose name is built from another variable when the name is not in the model, so a layout can still resolve it',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('computedNameLayout4', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="computedNameLayout4"><arg pageContent><p>{names.{key}|s}</p></arg></include>', { key: 'nope', names: { about: '<b>ok</b>' } }), expected)
        },
        expected: '<main><p>{names.nope|s}</p></main>'
      },
      {
        message: 'should escape the value of a variable whose name is built from another variable and which carries no flag',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<p>{names.{key}}</p>', { key: 'about', names: { about: '<img src=x>' } }), expected),
        expected: '<p>&lt;img src=x&gt;</p>'
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
        message: 'should apply a one line if to options a selected-value from the model marks (misc/selectedValueOneLineIf.html)',
        template: 'misc/selectedValueOneLineIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<select><option value="a">a</option><option value="b" selected="selected">b</option><option value="c" disabled>c</option></select>', '<select><option value="a">a</option><option value="b" selected="selected">b</option><option value="c" disabled="">c</option></select>'] // (a browser writes an attribute with no value as ="")
      },
      {
        message: 'should apply a one line if to inputs a checked-value from the model marks (misc/checkedValueOneLineIf.html)',
        template: 'misc/checkedValueOneLineIf',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: ['<p><input type="radio" name="r" value="a" required><input type="radio" name="r" value="b" checked="checked"></p>', '<p><input type="radio" name="r" value="a" required=""><input type="radio" name="r" value="b" checked="checked"></p>']
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
        message: 'should resolve {variables} in <loop> key and val attributes, <inline> css and js attributes, <include> as/mode/hydrate attributes, and <arg> names',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerDynamicWidget', '<p>{greeting}</p>')
          const rendered = teddy.render(
            '<loop through="items" key="{keyAttr}" val="{valAttr}"><span>{k}:{v}</span></loop><inline css="styles.{theme}"></inline><inline js="scripts.{theme}"></inline><include src="{partial}" as="my-{widget}" mode="{renderMode}" hydrate="{hydrateKey}"><arg {argAttr}>hi</arg></include><if rawText="{rawText|p}"><i>ok</i></if>',
            {
              items: { a: 1 },
              keyAttr: 'k',
              valAttr: 'v',
              theme: 'dark',
              styles: { dark: 'body{color:#fff}' },
              scripts: { dark: 'console.log(1)' },
              partial: 'compilerDynamicWidget',
              widget: 'card',
              renderMode: 'light',
              hydrateKey: 'theme',
              argAttr: 'greeting',
              rawText: 'b {x}'
            }
          )
          return assert(rendered, expected)
        },
        expected: '<span>a:1</span><style>body{color:#fff}</style><script>console.log(1)</script><my-card><p>hi</p><script type="application/json" class="teddy-component-model" slot="teddy-component-model">{"theme":"dark"}</script></my-card><i>ok</i>'
      },
      {
        message: 'should write out a value that refers back to itself rather than resolving forever, and say which values led round the loop',
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
        // a {variable|p} in an attribute leaves teddy's marker for its value inside that attribute, and a variable left unresolved makes the page go through the layout as markup to be parsed again. the marker's own quotes used to end the attribute early, which threw out the whole page
        message: 'should keep a {variable|p} in an attribute when the markup holding it is passed on through another variable alongside an unresolved {variable}',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerLayout3', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="compilerLayout3"><arg pageContent><p title="{missing}">x</p><p title="{t|p}">y</p></arg></include>', { t: 'Saltmere' }), expected)
        },
        expected: '<main><p title="{missing}">x</p><p title="Saltmere">y</p></main>'
      },
      {
        message: 'should keep a {variable|p} in an attribute when the markup holding it is passed on through another variable alongside an unresolved {variable} in text',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerLayout4', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="compilerLayout4"><arg pageContent><p>{missing}</p><p title="{t|p}">y</p></arg></include>', { t: 'Saltmere' }), expected)
        },
        expected: '<main><p>{missing}</p><p title="Saltmere">y</p></main>'
      },
      {
        message: 'should keep a {variable|p} in an attribute when the markup holding it is passed on through another variable alongside a null {variable}',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerLayout5', '<main>{pageContent|s}</main>')
          return assert(teddy.render('<include src="compilerLayout5"><arg pageContent><input value="{n}"><p data-confirm="Delete {t|p}?">y</p></arg></include>', { t: 'Saltmere', n: null }), expected)
        },
        expected: '<main><input value="{n}"><p data-confirm="Delete Saltmere?">y</p></main>'
      },
      {
        // while the page is parsed again, teddy's markers for its held out blocks stand in as text, and a value from the model must not be able to write one of those stand-ins and move a block of trusted markup somewhere else, such as into an attribute it could break out of
        message: 'should not let a value from the model move a held out block when the markup holding it is passed on through another variable',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('compilerLayout6', '<main><h1>{title}</h1>{pageContent|s}</main>')
          return assert(teddy.render('<include src="compilerLayout6"><arg title>{userTitle}</arg><arg pageContent><a title="{bio}">x</a>{missing}<div>{widget|s|p}</div></arg></include>', { bio: '{title}', userTitle: '<0 0', widget: '<b class="w">trusted</b>' }), expected)
        },
        expected: '<main><h1>&amp;lt;0 0</h1><a title="&amp;lt;0 0">x</a>{missing}<div><b class="w">trusted</b></div></main>'
      },
      {
        message: 'should say so when a selected-value cannot reach the elements it would mark',
        runNode: async (teddy, template, model, assert, expected) => {
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
        runNode: async (teddy, template, model, assert, expected) => {
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
  },
  {
    // a template element keeps its children in a document fragment of its own rather than among its child nodes. cheerio does not, so node always read them: in a browser everything inside a <template> went missing, and a teddy tag written inside one was never evaluated
    //
    // these run in both halves, because agreeing is the whole point of them
    describe: 'Template elements',
    tests: [
      {
        message: 'should keep the contents of a template element',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<template id="t"><p>plain</p></template>', model), expected),
        expected: '<template id="t"><p>plain</p></template>'
      },
      {
        message: 'should resolve a {variable} inside a template element',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<template id="t"><p>{something}</p></template>', model), expected),
        expected: '<template id="t"><p>Some content</p></template>'
      },
      {
        message: 'should evaluate a teddy tag inside a template element',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<template id="t"><if something><b>{something}</b></if></template>', model), expected),
        expected: '<template id="t"><b>Some content</b></template>'
      },
      {
        message: 'should evaluate a loop inside a template element',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<template id="t"><loop through=\'letters\' val=\'letter\'><i>{letter}</i></loop></template>', model), expected),
        expected: '<template id="t"><i>a</i><i>b</i><i>c</i></template>'
      },
      {
        message: 'should evaluate an <include> inside a template element',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('templateInclude', '<em>{something}</em>')
          assert(teddy.render('<template id="t"><include src=\'templateInclude\'></include></template>', model), expected)
        },
        expected: '<template id="t"><em>Some content</em></template>'
      },
      {
        // a construct enclosing the template encloses what is inside it, which is only true if the walk up from an element can get out of the fragment its template keeps it in
        message: 'should treat a construct enclosing a template as enclosing what is inside it',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<if something><template id="t"><if something><b>yes</b></if></template></if>', model), expected),
        expected: '<template id="t"><b>yes</b></template>'
      },
      {
        message: 'should leave out a template that a false construct encloses',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<if doesNotExist><template id="t"><p>{something}</p></template></if>', model), expected),
        expected: ''
      },
      {
        message: 'should keep the contents of a template element nested inside another one',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<template id="a"><template id="b"><p>{something}</p></template></template>', model), expected),
        expected: '<template id="a"><template id="b"><p>Some content</p></template></template>'
      },
      {
        // this is the shape teddy writes for a component, so it has to survive being rendered again
        message: 'should keep a declarative shadow root written by hand',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<my-card><template shadowrootmode="open"><p>{something}</p></template></my-card>', model), expected),
        expected: '<my-card><template shadowrootmode="open"><p>Some content</p></template></my-card>'
      }
    ]
  },
  {
    // an <include> given an `as` renders into a declarative shadow root inside the custom element it names, rather than in place of the include. a browser's parser builds that shadow root as it reads the page, so the markup is encapsulated before any javascript runs, and an element that is later upgraded finds its shadow root already populated
    describe: 'Components',
    tests: [
      {
        message: 'should render an <include> as a custom element carrying a declarative shadow root and a fallback copy of it (includes/componentAs.html)',
        template: 'includes/componentAs',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<my-card><template shadowrootmode="open"><p>Some content</p></template><p>Some content</p></my-card>'
      },
      {
        message: 'should resolve {variables} in an <include>\'s as, mode, and hydrate attributes (includes/componentAsVars.html)',
        template: 'includes/componentAsVars',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<my-card><template shadowrootmode="open"><p>Some content</p></template><p>Some content</p></my-card><my-card><template shadowrootmode="open"><p>Some content</p></template><script type="application/json" class="teddy-component-model" slot="teddy-component-model">{"something":"Some content"}</script></my-card>'
      },
      {
        message: 'should render an <include> as a different custom element on each pass of a loop when its as attribute holds a {variable} (includes/componentAsVarsInLoop.html)',
        template: 'includes/componentAsVarsInLoop',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<my-card><p>Some content</p></my-card><my-list><p>Some content</p></my-list>'
      },
      {
        message: 'should pass an argument to an <include> rendering as a custom element (includes/componentAsWithArg.html)',
        template: 'includes/componentAsWithArg',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<my-card><template shadowrootmode="open"><p>passed in</p></template><p>passed in</p></my-card>'
      },
      {
        message: 'should evaluate teddy tags inside a component, in the shadow root where they were written',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentBody', '<div><if something><b>yes</b></if><loop through=\'letters\' val=\'letter\'><i>{letter}</i></loop></div>')
          assert(teddy.render('<include src=\'componentBody\' as=\'my-card\' mode=\'shadow\'></include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><div><b>yes</b><i>a</i><i>b</i><i>c</i></div></template></my-card>'
      },
      {
        message: 'should render a component nested inside another component',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentInner', '<span>{something}</span>')
          teddy.setTemplate('componentOuter', '<div><include src=\'componentInner\' as=\'my-inner\' mode=\'shadow\'></include></div>')
          assert(teddy.render('<include src=\'componentOuter\' as=\'my-outer\' mode=\'shadow\'></include>', model), expected)
        },
        expected: '<my-outer><template shadowrootmode="open"><div><my-inner><template shadowrootmode="open"><span>Some content</span></template></my-inner></div></template></my-outer>'
      },
      {
        message: "should pass an <include>'s attributes and its light dom to the custom element it renders as (includes/componentAsSlot.html)",
        template: 'includes/componentAsSlot',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<my-card data-theme="dark"><template shadowrootmode="open"><p>in the shadow root</p></template><p>in the shadow root</p><p slot="description">in the light dom</p></my-card>'
      },
      {
        // a <slot> in the shadow root projects what the page put inside the element, so an include that cannot pass anything through leaves every slot showing its fallback forever
        message: 'should pass whatever is not an <arg> through to the component as its light dom',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentSlotted', '<div><slot name="description">fallback</slot><p>{something}</p></div>')
          assert(teddy.render('<include src=\'componentSlotted\' as=\'my-card\' mode=\'shadow\'><arg something>shadow</arg><p slot=\'description\'>light</p></include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><div><slot name="description">fallback</slot><p>shadow</p></div></template><p slot="description">light</p></my-card>'
      },
      {
        // a component reading its light dom through a default slot is commonly given text and nothing else, as <my-button>Click me</my-button> is
        message: 'should pass text written inside a component through as its light dom',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentText', '<div><slot></slot></div>')
          assert(teddy.render('<include src=\'componentText\' as=\'my-card\' mode=\'shadow\'>before<b>bold</b>after</include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><div><slot></slot></div></template>before<b>bold</b>after</my-card>'
      },
      {
        message: "should render a component's light dom against the model the include was reached with",
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentLight', '<p>x</p>')
          assert(teddy.render('<include src=\'componentLight\' as=\'my-card\' mode=\'shadow\'><b slot=\'d\'>{something}</b></include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><p>x</p></template><b slot="d">Some content</b></my-card>'
      },
      {
        // attributes are how a custom element is configured: a class watches the ones it named in observedAttributes
        message: 'should put an attribute written on the include onto the element it renders as',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentAttrs', '<p>x</p>')
          assert(teddy.render('<include src=\'componentAttrs\' as=\'my-card\' mode=\'shadow\' data-theme=\'dark\' hidden></include>', model), expected)
        },
        expected: '<my-card data-theme="dark" hidden><template shadowrootmode="open"><p>x</p></template></my-card>'
      },
      {
        message: 'should resolve a {variable} written in an attribute of a component',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentAttrVar', '<p>x</p>')
          assert(teddy.render('<include src=\'componentAttrVar\' as=\'my-card\' mode=\'shadow\' data-thing=\'{something}\'></include>', model), expected)
        },
        expected: '<my-card data-thing="Some content"><template shadowrootmode="open"><p>x</p></template></my-card>'
      },
      {
        message: 'should keep the attributes an include reads for itself off the element it renders as',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentOwnAttrs', '<p>x</p>')
          const rendered = teddy.render('<include src=\'componentOwnAttrs\' as=\'my-card\' hydrate=\'something\' mode=\'shadow\'></include>', model)
          const openTag = rendered.match(/<my-card[^>]*>/)[0]
          assert([/src=/, /\bas=/, /hydrate=/, /\bmode=/].some(pattern => pattern.test(openTag)) ? 'leaked: ' + openTag : 'kept to itself', expected)
        },
        expected: 'kept to itself'
      },
      {
        // an empty slot attribute means the default slot, so teddy's own bookkeeping has to name one that no component defines or it would be projected into a component's default slot
        message: "should keep a hydrating component's model out of the slots its light dom is projected into",
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentPayloadSlot', '<p>x</p>')
          const rendered = teddy.render('<include src=\'componentPayloadSlot\' as=\'my-card\' hydrate=\'something\'></include>', model)
          assert(/class="teddy-component-model" slot="teddy-component-model"/.test(rendered) ? 'named a slot of its own' : rendered, expected)
        },
        expected: 'named a slot of its own'
      },
      {
        message: 'should send a hydrating component the model keys it names (includes/componentAsHydrate.html)',
        template: 'includes/componentAsHydrate',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render(template, model), expected),
        expected: '<my-card><template shadowrootmode="open"><p>Some content</p></template><p>Some content</p><script type="application/json" class="teddy-component-model" slot="teddy-component-model">{"something":"Some content"}</script></my-card>'
      },
      {
        // an argument carries rendered markup, so it could never hand a component a list or an object. naming a model key is what makes those reach the other side intact
        message: 'should send a hydrating component a list and an object whole',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentList', '<ul><loop through=\'kit.tags\' val=\'tag\'><li>{tag}</li></loop></ul>')
          const rendered = teddy.render('<include src=\'componentList\' as=\'my-list\' hydrate=\'kit\'></include>', { kit: { tags: ['a', 'b'] } })
          const payload = rendered.match(/class="teddy-component-model"[^>]*>(.*?)<\/script>/)[1]
          assert(JSON.stringify(JSON.parse(payload)), expected)
        },
        expected: '{"kit":{"tags":["a","b"]}}'
      },
      {
        message: 'should send a hydrating component more than one model key when it names more than one',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentTwo', '<p>{a}{b}</p>')
          const rendered = teddy.render('<include src=\'componentTwo\' as=\'my-two\' hydrate=\'a, b\'></include>', { a: 'one', b: 'two', c: 'unsent' })
          const payload = rendered.match(/class="teddy-component-model"[^>]*>(.*?)<\/script>/)[1]
          assert(JSON.stringify(JSON.parse(payload)), expected)
        },
        expected: '{"a":"one","b":"two"}'
      },
      {
        message: 'should keep an argument holding a script closing sequence from ending the payload early',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentEscape', '<p>{danger}</p>')
          const rendered = teddy.render('<include src=\'componentEscape\' as=\'my-danger\' hydrate=\'danger\'></include>', { danger: 'a</script>b' })
          const payload = rendered.match(/class="teddy-component-model"[^>]*>(.*?)<\/script>/)[1]
          assert(JSON.parse(payload).danger, expected)
        },
        expected: 'a</script>b'
      },
      {
        message: 'should refuse a hydrate that says nothing, or that names a path rather than a key',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentHydrateCheck', '<p>x</p>')
          const answers = []
          for (const attr of ['hydrate', "hydrate='a.b'"]) {
            try {
              teddy.render(`<include src='componentHydrateCheck' as='my-card' ${attr}></include>`, model)
              answers.push('accepted')
            } catch (err) {
              answers.push(/does not say what the component needs|rather than paths into them/.test(err.message) ? 'refused' : err.message)
            }
          }
          assert(answers.join(', '), expected)
        },
        expected: 'refused, refused'
      },
      {
        // an as, mode, or hydrate holding a {variable} cannot be checked until a render resolves it, so it is checked then, with the same rules as one written out
        message: 'should refuse an as, mode, or hydrate that only turns out to be invalid once its {variable} is resolved',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentResolvedCheck', '<p>x</p>')
          const values = { badTag: 'card', tag: 'card', badMode: 'sideways', dotted: 'names.jack' }
          const answers = []
          for (const attrs of ["as='{badTag}'", "as='my-{tag}' mode='{badMode}'", "as='my-{tag}' hydrate='{dotted}'"]) {
            try {
              teddy.render(`<include src='componentResolvedCheck' ${attrs}></include>`, values)
              answers.push('accepted')
            } catch (err) {
              answers.push(/cannot name a custom element|asks for a mode|rather than paths into them/.test(err.message) ? 'refused' : err.message)
            }
          }
          assert(answers.join(', '), expected)
        },
        expected: 'refused, refused, refused'
      },
      {
        // the default is the one arrangement that renders whatever the browser turns out to support: the shadow root where declarative shadow dom is built, the fallback where it is not
        message: 'should write a shadow root and a fallback copy of it by default',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentDefaultMode', '<p>x</p>')
          assert(teddy.render('<include src=\'componentDefaultMode\' as=\'my-card\'></include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><p>x</p></template><p>x</p></my-card>'
      },
      {
        message: 'should write the shadow root alone in shadow mode',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentShadowMode', '<p>x</p>')
          assert(teddy.render('<include src=\'componentShadowMode\' as=\'my-card\' mode=\'shadow\'></include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><p>x</p></template></my-card>'
      },
      {
        message: 'should write the fallback alone, with no shadow root, in light mode',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentLightMode', '<p>x</p>')
          assert(teddy.render('<include src=\'componentLightMode\' as=\'my-card\' mode=\'light\'></include>', model), expected)
        },
        expected: '<my-card><p>x</p></my-card>'
      },
      {
        // none of these can do its job in the light dom: a style would leak to the rest of the page, a slot has no shadow root to project anything into, and a script has already run once as part of the page
        message: 'should leave the style, script and slot elements out of the fallback',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentFallbackStrip', '<div><style>p{color:red}</style><script>x()</script><slot name="d">fallback</slot><p>x</p></div>')
          const fallback = teddy.render('<include src=\'componentFallbackStrip\' as=\'my-card\'></include>', model).split('</template>')[1]
          assert([/<style/, /<script/, /<slot/].some(pattern => pattern.test(fallback)) ? 'left in: ' + fallback : fallback, expected)
        },
        expected: '<div><p>x</p></div></my-card>'
      },
      {
        message: 'should leave the shadow root of a component in both mode as it was written',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentShadowKept', '<div><style>p{color:red}</style><slot name="d">fallback</slot></div>')
          const shadow = teddy.render('<include src=\'componentShadowKept\' as=\'my-card\'></include>', model).split('</template>')[0]
          assert(/<style/.test(shadow) && /<slot/.test(shadow) ? 'kept' : 'stripped: ' + shadow, expected)
        },
        expected: 'kept'
      },
      {
        // a default slot catches every child that names no slot of its own, so the fallback has to name one no component defines or it would be projected back into the component beside the real content
        message: "should hold the fallback out of a component's default slot",
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentDefaultSlot', '<div><slot></slot></div>')
          assert(teddy.render('<include src=\'componentDefaultSlot\' as=\'my-card\'><p>page</p></include>', model), expected)
        },
        expected: '<my-card><template shadowrootmode="open"><div><slot></slot></div></template><div slot="teddy-fallback"><div></div></div><p>page</p></my-card>'
      },
      {
        // a component whose slots are all named leaves the fallback unassigned already, and an unassigned child is not rendered, so there is nothing to hold it out of
        message: 'should leave the fallback unwrapped when every slot the component has is named',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentNamedSlots', '<div><slot name="d"></slot></div>')
          const rendered = teddy.render('<include src=\'componentNamedSlots\' as=\'my-card\'></include>', model)
          assert(rendered.includes('teddy-fallback') ? 'wrapped: ' + rendered : rendered, expected)
        },
        expected: '<my-card><template shadowrootmode="open"><div><slot name="d"></slot></div></template><div></div></my-card>'
      },
      {
        message: 'should refuse a mode a component cannot be written in',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentBadMode', '<p>x</p>')
          const answers = []
          for (const mode of ['open', 'closed', '']) {
            try {
              teddy.render(`<include src='componentBadMode' as='my-card' mode='${mode}'></include>`, model)
              answers.push(`rendered anyway: ${mode}`)
            } catch (err) {
              answers.push(err.message.includes('asks for a mode that is not one of') ? 'refused' : err.message)
            }
          }
          assert(answers.join(', '), expected)
        },
        expected: 'refused, refused, refused'
      },
      {
        message: 'should refuse an `as` that cannot name a custom element',
        run: async (teddy, template, model, assert, expected) => {
          teddy.setTemplate('componentNameCheck', '<p>x</p>')
          const answers = []
          for (const name of ['nohyphen', 'Has-Capitals', '-leading']) {
            try {
              teddy.render(`<include src='componentNameCheck' as='${name}'></include>`, model)
              answers.push('accepted ' + name)
            } catch (err) {
              answers.push(err.message.includes('cannot name a custom element') ? 'refused' : err.message)
            }
          }
          assert(answers.join(', '), expected)
        },
        expected: 'refused, refused, refused'
      }
    ]
  },
  {
    // a custom element's name has to hold a hyphen, so a tag name that stops at a letter or a digit cannot describe one. these run in both halves: node read them correctly all along, and the browser build read <my-card> as a tag called my carrying an attribute called -card
    describe: 'Custom elements',
    tests: [
      {
        message: 'should render a custom element without splitting its name at the hyphen',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<my-card>{something}</my-card>', model), '<my-card>Some content</my-card>'),
        expected: '<my-card>Some content</my-card>'
      },
      {
        message: 'should render a custom element that carries attributes',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<my-card size="large" data-x="1">{something}</my-card>', model), '<my-card size="large" data-x="1">Some content</my-card>'),
        expected: '<my-card size="large" data-x="1">Some content</my-card>'
      },
      {
        message: 'should render custom elements nested inside one another',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<x-outer><x-inner>{something}</x-inner></x-outer>', model), '<x-outer><x-inner>Some content</x-inner></x-outer>'),
        expected: '<x-outer><x-inner>Some content</x-inner></x-outer>'
      },
      {
        message: 'should evaluate teddy tags inside a custom element',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<my-card><if something>yes</if></my-card>', model), '<my-card>yes</my-card>'),
        expected: '<my-card>yes</my-card>'
      },
      {
        message: 'should render a custom element whose name holds more than one hyphen',
        run: async (teddy, template, model, assert, expected) => assert(teddy.render('<a-b-c>{something}</a-b-c>', model), '<a-b-c>Some content</a-b-c>'),
        expected: '<a-b-c>Some content</a-b-c>'
      }
    ]
  },
  {
    // precompiling writes out the javascript teddy would otherwise have built at runtime, so that a browser can be handed the fast render rather than the slow one. it only runs in node, where the emitter is, so these are runNode rather than run
    //
    // test/comparePrecompiled.js does the same across every fixture; these cover the shapes that are easiest to get wrong and the ways precompiling is meant to refuse
    describe: 'Precompiling',
    tests: [
      {
        message: 'should render a precompiled template to the same bytes as compiling it at runtime',
        runNode: async (teddy, template, model, assert, expected) => {
          // one fixture for each shape the encoder has to survive: an arm that holds the branch that holds it back, a body reached from more than one place, the arguments an include binds, the variant lists a selection carries, and the map a dynamic include keeps
          const names = ['conditionals/if', 'looping/nestedLoops', 'includes/includeWithArg', 'looping/selectOptions', 'includes/dynamicInclude', 'misc/variable']
          const answers = []
          for (const name of names) {
            teddy.setTemplateRoot('test/templates')
            teddy.clearTemplates()
            const runtime = teddy.render(name, structuredClone(model))
            const artifact = teddy.precompile(name)
            teddy.clearTemplates()
            teddy.registerPrecompiled((await import('data:text/javascript,' + encodeURIComponent(artifact))).default)
            answers.push(teddy.render(name, structuredClone(model)) === runtime ? 'same' : 'DIFFERENT: ' + name)
          }
          teddy.clearTemplates()
          assert(answers.join(', '), names.map(() => 'same').join(', '))
        },
        expected: 'same, same, same, same, same, same'
      },
      {
        message: 'should write a precompiled template that loads as an es module, as commonjs, or as a plain script',
        runNode: async (teddy, template, model, assert, expected) => {
          const { mkdtempSync, writeFileSync, rmSync } = await import('fs')
          const { tmpdir } = await import('os')
          const { join } = await import('path')
          const { createRequire } = await import('module')
          const name = 'misc/variable'
          teddy.setTemplateRoot('test/templates')
          teddy.clearTemplates()
          const runtime = teddy.render(name, structuredClone(model))
          const scratch = mkdtempSync(join(tmpdir(), 'teddy-formats-'))
          const answers = []
          try {
            // an es module and a plain script are both valid module bodies, so both can be reached by importing them: the module one exports what it wrote, the plain one puts it on a global. commonjs is the one that needs a require, since `module` is not a thing here
            for (const format of ['esm', 'global']) {
              const artifact = teddy.precompile(name, { format })
              const loaded = await import('data:text/javascript,' + encodeURIComponent(artifact))
              teddy.clearTemplates()
              teddy.registerPrecompiled(format === 'esm' ? loaded.default : globalThis.teddyPrecompiled[name])
              answers.push(`${format} ${teddy.render(name, structuredClone(model)) === runtime ? 'same' : 'DIFFERENT'}`)
            }
            const file = join(scratch, 'template.cjs')
            writeFileSync(file, teddy.precompile(name, { format: 'cjs' }))
            teddy.clearTemplates()
            teddy.registerPrecompiled(createRequire(import.meta.url)(file))
            answers.push(`cjs ${teddy.render(name, structuredClone(model)) === runtime ? 'same' : 'DIFFERENT'}`)
          } finally {
            rmSync(scratch, { recursive: true, force: true })
            delete globalThis.teddyPrecompiled
            teddy.clearTemplates()
          }
          assert(answers.join(', '), 'esm same, global same, cjs same')
        },
        expected: 'esm same, global same, cjs same'
      },
      {
        message: 'should refuse to write a precompiled template in a way it does not know how to write',
        runNode: async (teddy, template, model, assert, expected) => {
          teddy.setTemplateRoot('test/templates')
          let answer = 'wrote it anyway'
          try {
            teddy.precompile('misc/variable', { format: 'commonjs' })
          } catch (err) {
            answer = err.message.includes('is not a way teddy can write') ? 'refused' : err.message
          }
          assert(answer, 'refused')
        },
        expected: 'refused'
      },
      {
        message: 'should keep rendering a precompiled template with template caching switched off, there being no source behind it to have gone stale',
        runNode: async (teddy, template, model, assert, expected) => {
          teddy.setTemplateRoot('test/templates')
          teddy.clearTemplates()
          const artifact = teddy.precompile('misc/variable')
          teddy.clearTemplates()
          teddy.setCacheTemplates(false)
          teddy.registerPrecompiled((await import('data:text/javascript,' + encodeURIComponent(artifact))).default)
          const first = teddy.render('misc/variable', structuredClone(model))
          const second = teddy.render('misc/variable', structuredClone(model))
          teddy.setCacheTemplates(true)
          teddy.clearTemplates()
          assert(first === second && first.length > 0 ? 'still precompiled' : 'lost it', 'still precompiled')
        },
        expected: 'still precompiled'
      },
      {
        message: 'should refuse a precompiled template written for a different format',
        runNode: async (teddy, template, model, assert, expected) => {
          let answer = 'accepted it'
          try {
            teddy.registerPrecompiled({ format: 0, name: 'x', data: { root: null, table: [] }, render: () => '' })
          } catch (err) {
            answer = err.message.includes('precompile it again') ? 'refused' : err.message
          }
          assert(answer, 'refused')
        },
        expected: 'refused'
      },
      {
        message: 'should refuse something that is not a precompiled template at all',
        runNode: async (teddy, template, model, assert, expected) => {
          const answers = []
          for (const bad of [null, {}, { format: 1, name: 'x' }]) {
            try {
              teddy.registerPrecompiled(bad)
              answers.push('accepted it')
            } catch (err) {
              answers.push(err.message.includes('needs what teddy.precompile wrote') ? 'refused' : err.message)
            }
          }
          assert(answers.join(', '), 'refused, refused, refused')
        },
        expected: 'refused, refused, refused'
      }
    ]
  }
]
