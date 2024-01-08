export default [
  {
    describe: 'Conditionals',
    tests: [
      {
        message: 'should evaluate <if something> as true (conditionals/if.html)',
        template: 'conditionals/if.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition (conditionals/ifElse.html)',
        template: 'conditionals/ifElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <if something=\'Some content\'> as true (conditionals/ifValue.html)',
        template: 'conditionals/ifValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is set to \'Some content\'</p>'
      },
      {
        message: 'should evaluate <if emptyArray> as false (conditionals/ifEmptyArray.html)',
        template: 'conditionals/ifEmptyArray.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'emptyArray\' is considered falsey</p>'
      },
      {
        message: 'should evaluate <if something=\'no\'> as false and trigger <else> condition (conditionals/ifElseValue.html)',
        template: 'conditionals/ifElseValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is not set to \'no\'</p>'
      },
      {
        message: 'should evaluate <unless doesntexist> as true (conditionals/unless.html)',
        template: 'conditionals/unless.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <unless something> as false and trigger <else> condition (conditionals/unlessElse.html)',
        template: 'conditionals/unlessElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate nested <unless> tag in the if (conditionals/unlessNestedIf.html)',
        template: 'conditionals/unlessNestedIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is not present</p> <p>The variable \'anotherdoesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate nested <unless> tag in the else (conditionals/unlessNestedElse.html)',
        template: 'conditionals/unlessNestedElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is present</p> <p>The variable \'anotherdoesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <unless something> as false and trigger <else> condition with comment in between (conditionals/unlessWithComment.html)',
        template: 'conditionals/unlessWithComment.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate nested <unless> tag in the if with a comment in between (conditionals/unlessNestedIfWithComment.html)',
        template: 'conditionals/unlessNestedIfWithComment.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is not present</p> <p>The variable \'something\' is present</p>'
      },
      {
        message: 'should evaluate <unless nullVar> as true (conditionals/unlessNull.html)',
        template: 'conditionals/unlessNull.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'nullVar\' is falsey</p>'
      },
      {
        message: 'should evaluate <unless something=\'Some content\'> as false and trigger <else> condition (conditionals/unlessValue.html)',
        template: 'conditionals/unlessValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is set to \'Some content\'</p>'
      },
      {
        message: 'should evaluate <unless something=\'no\'> as false and trigger <else> condition (conditionals/unlessElseValue.html)',
        template: 'conditionals/unlessElseValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is not set to \'no\'</p>'
      },
      {
        message: 'should evaluate <unless something and notDefined or somethingElse> as false (conditionals/unlessAndOr.html)',
        template: 'conditionals/unlessAndOr.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>should render</p>'
      },
      {
        message: 'should evaluate entire conditional and correctly show HTML comments (conditionals/commentConditional.html)',
        template: 'conditionals/commentConditional.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<!-- COMMENT 1 --><p>The variable \'something\' is present</p><!-- COMMENT 2 -->'
      },
      {
        message: 'should evaluate <if something=\'no\'> as false and <elseif somethingElse> as true (conditionals/ifElseIf.html)',
        template: 'conditionals/ifElseIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'somethingElse\' is present</p>'
      },
      {
        message: 'should evaluate <unless something> as false and <elseunless doesntexist> as true (conditionals/unlessElseUnless.html)',
        template: 'conditionals/unlessElseUnless.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should eval <if something=\'no\'> as false and <elseunless something=\'maybe\'> as true (conditionals/ifElseUnless.html)',
        template: 'conditionals/ifElseUnless.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' is not set to \'maybe\'</p>'
      },
      {
        message: 'should eval <unless something> as false and <elseif somethingElse> as true (conditionals/unlessElseIf.html)',
        template: 'conditionals/unlessElseIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'somethingElse\' is present</p>'
      },
      {
        message: 'should evaluate <if something and notDefined> as false (conditionals/and.html)',
        template: 'conditionals/and.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>and: false</p>'
      },
      {
        message: 'should evaluate `and` correctly when not using explicit values (conditionals/andImplicit.html)',
        template: 'conditionals/andImplicit.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>should render</p><p>and: false</p><p>and: false</p><p>and: false</p>'
      },
      {
        message: 'should evaluate `and` correctly using explicit values (conditionals/andExplicit.html)',
        template: 'conditionals/andExplicit.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>should render</p><p>should render</p><p>should render</p><p>and: false</p><p>and: false</p><p>and: false</p><p>and: false</p><p>and: false</p>'
      },
      {
        message: 'should evaluate `and` truth table (conditionals/andTruthTable.html)',
        template: 'conditionals/andTruthTable.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>and: true true</p>'
      },
      {
        message: 'should evaluate `or` truth table correctly (conditionals/orTruthTable.html)',
        template: 'conditionals/orTruthTable.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>or: true true</p><p>or: true false</p><p>or: true false</p><p>or: false true</p><p>or: false false</p><p>or: false true</p><p>or: true false</p><p>or: true true</p><p>or: false false</p><p>or: false false</p><p>or: false false</p>'
      },
      {
        message: 'should evaluate <if something=\'Some content\' or something=\'Nope\'> as true (conditionals/orSameVar.html)',
        template: 'conditionals/orSameVar.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>or: true</p>'
      },
      {
        message: 'should evaluate <if something xor somethingElse> as false (conditionals/xor.html)',
        template: 'conditionals/xor.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>xor: false</p>'
      },
      {
        message: 'should evaluate xor correctly when not using explicit values (conditionals/xorImplicit.html)',
        template: 'conditionals/xorImplicit.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>xor: false</p><p>should render</p><p>should render</p>'
      },
      {
        message: 'should evaluate xor correctly using explicit values (conditionals/xorExplicit.html)',
        template: 'conditionals/xorExplicit.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>xor: false</p><p>xor: false</p><p>xor: false</p><p>should render</p><p>should render</p>'
      },
      {
        message: 'should evaluate <if something and notDefined or somethingElse> as true (conditionals/andOr.html)',
        template: 'conditionals/andOr.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>and + or: true</p>'
      },
      {
        message: 'should evaluate <if not:something> as false and <if not:noExist> as true (conditionals/not.html)',
        template: 'conditionals/not.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>not: false</p><p>not: true</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true (conditionals/oneLine.html)',
        template: 'conditionals/oneLine.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-somethingFalse" as false (conditionals/oneLineIfBooleanValue.html)',
        template: 'conditionals/oneLineIfBooleanValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p></p>'
      },
      {
        message: 'should evaluate one line ifs in loops examining the object member\'s value correctly (conditionals/oneLineInLoop.html)',
        template: 'conditionals/oneLineInLoop.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-present">guy</p><p class="something-is-present">girl</p><p class="something-is-present">landscape</p><p class="something-is-not-present">guy</p><p class="something-is-present">girl</p><p class="something-is-not-present">landscape</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true when attributes are split across multiple lines (conditionals/oneLineNewLine.html)',
        template: 'conditionals/oneLineNewLine.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true in self-closing element (conditionals/oneLineSelfClosing.html)',
        template: 'conditionals/oneLineSelfClosing.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<input class="something-is-present">'
      },
      {
        message: 'should evaluate one line if "if-something" as true when result includes slash (/) characters (conditionals/oneLineWithSlash.html)',
        template: 'conditionals/oneLineWithSlash.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<a href="/something">One line if.</a>'
      },
      {
        message: 'should evaluate one line if "if-something" as true with no false condition supplied (conditionals/oneLineTrueOnly.html)',
        template: 'conditionals/oneLineTrueOnly.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as false even with no false condition supplied (conditionals/oneLineNoFalse.html)',
        template: 'conditionals/oneLineNoFalse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<h2>{content.subTitle}</h2>'
      },
      {
        message: 'should evaluate one line if "if-something=\'Some content\'" as true (conditionals/oneLineValue.html)',
        template: 'conditionals/oneLineValue.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-value">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something.something={something}" as false and remove attributes (conditionals/oneLineValueVars.html)',
        template: 'conditionals/oneLineValueVars.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<option value="Some content">Some content</option>'
      },
      {
        message: 'should evaluate <option> elements with the middle one selected (conditionals/oneLineValueVarsLooped.html)',
        template: 'conditionals/oneLineValueVarsLooped.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<option value="1">1</option><option value="2" selected="true">2</option><option value="3">3</option>'
      },
      {
        message: 'should evaluate <option> elements with the middle one selected (conditionals/conditionalValueVarsLooped.html)',
        template: 'conditionals/conditionalValueVarsLooped.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<option value="1">1</option><option value="2" selected="true">2</option><option value="3">3</option>'
      },
      {
        message: 'should evaluate one line if "if-something=\'Some content\'" as true and still add the id attribute regardless of the if statement outcome (conditionals/oneLineValueWithAdditionalAttributesNotImpactedByIf.html)',
        template: 'conditionals/oneLineValueWithAdditionalAttributesNotImpactedByIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p id="someId" class="something-is-present">One line if.</p><p id="someId">One line if.</p><p id="someId" disabled="true">One line if.</p><option value="3" selected="true">One line if.</option><option value="3" selected="true">One line if.</option>'
      },
      {
        message: 'should evaluate one line if "if-something=\'\'" as false (conditionals/oneLineEmpty.html)',
        template: 'conditionals/oneLineEmpty.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-value">One line if.</p>'
      },
      {
        message: 'should reduce multiple one line if statements down to only the first one (conditionals/oneLineMulti.html)',
        template: 'conditionals/oneLineMulti.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-present">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" with a dynamic value (conditionals/oneLineDynamicVariable.html)',
        template: 'conditionals/oneLineDynamicVariable.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="some-class">Some content</p>'
      },
      {
        message: 'should evaluate <if something> as true and the nested <if not:somethingElse> as false, triggering the nested <else> condition (conditionals/nestedConditional.html)',
        template: 'conditionals/nestedConditional.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>The variable \'something\' and \'somethingElse\' are both present</p>'
      },
      {
        message: 'should render nothing if condition isn\'t met (conditionals/ifNotPresent.html)',
        template: 'conditionals/ifNotPresent.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<div></div>'
      },
      {
        message: 'should evaluate one line if as false and apply no class (conditionals/oneLineFalse.html)',
        template: 'conditionals/oneLineFalse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p></p>'
      },
      {
        message: 'should evaluate one line if as false and apply a class (conditionals/oneLineOnlyFalse.html)',
        template: 'conditionals/oneLineOnlyFalse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="no-exist"></p>'
      },
      {
        message: 'should evaluate if statement that contains an element with a regex pattern (conditionals/ifEscapeRegex.html)',
        template: 'conditionals/ifEscapeRegex.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">'
      },
      {
        message: 'should evaluate if statement that queries the same variable more than once (conditionals/duplicateVarInline.html)',
        template: 'conditionals/duplicateVarInline.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>True</p>'
      },
      {
        message: 'should evaluate if statement with multiple instances of the same operator inline (conditionals/duplicateOperatorInline.html)',
        template: 'conditionals/duplicateOperatorInline.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>True</p>'
      },
      {
        message: 'should evaluate <if noExist> containing regex pattern as false and trigger <else> condition (conditionals/ifElseRegex.html)',
        template: 'conditionals/ifElseRegex.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>False</p>'
      },
      {
        message: 'should evaluate if statement where elseif condition is a three character named object (conditionals/ifNestedProperties.html)',
        template: 'conditionals/ifNestedProperties.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Should render</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true with quote types reversed (conditionals/oneLineReverseQuotes.html)',
        template: 'conditionals/oneLineReverseQuotes.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-true">One line if.</p>'
      },
      {
        message: 'should evaluate one line if "if-something" as true with quote types reversed and a variable result (conditionals/oneLineReverseQuotesVar.html)',
        template: 'conditionals/oneLineReverseQuotesVar.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="Some content">One line if.</p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement (conditionals/ifOutsideIf.html)',
        template: 'conditionals/ifOutsideIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p> gif-something-jpg-png </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement with a variable present (conditionals/varIfOutsideIf.html)',
        template: 'conditionals/varIfOutsideIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p> gif-Some content-jpg-png </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when combined with a normal if statement (conditionals/nestedIfOutsideIf.html)',
        template: 'conditionals/nestedIfOutsideIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p> gif-jpg-png If that should not be parsed, How art thou? </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when combined with a one line if statement (conditionals/oneLineIfOutsideIf.html)',
        template: 'conditionals/oneLineIfOutsideIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p> gif-jpg-png <span class="something-is-present"> hello </span> </p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when \'if-\' is part of an attribute\'s value (conditionals/oneLineIfInsideAttribute.html)',
        template: 'conditionals/oneLineIfInsideAttribute.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p id="gif-jpg-png">hello</p> <p class="gif-jpg-png">hello</p><p filter="gif-jpg-png">hello</p>'
      },
      {
        message: 'should ignore \'if-\' when not part of an if statement when combined with a one line if statement, reversed (conditionals/oneLineIfOutsideIfReverse.html)',
        template: 'conditionals/oneLineIfOutsideIfReverse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="something-is-present">  gif-jpg-png </p>'
      },
      {
        message: 'should evaluate 5000 one line ifs in under 10000ms (conditionals/oneLinePerformance.html)',
        template: 'conditionals/oneLinePerformance.html',
        test: (teddy, template, model) => {
          const start = new Date().getTime()
          teddy.render(template, model)
          const end = new Date().getTime()
          const time = end - start

          return time < 1000
        },
        expected: true
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition containing very few characters (conditionals/ifElseLowChars.html)',
        template: 'conditionals/ifElseLowChars.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>B</p>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition with preceding HTML comment (conditionals/ifCommentElse.html)',
        template: 'conditionals/ifCommentElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<!-- HTML comment --><p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition with multiple preceding HTML comments (conditionals/ifMultipleCommentsElse.html)',
        template: 'conditionals/ifMultipleCommentsElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<!-- HTML comment --><!-- MOAR HTML comments --><p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate <if doesntexist> as false and trigger <else> condition with embedded HTML comments in conditional statements (conditionals/ifCommentsEmbedded.html)',
        template: 'conditionals/ifCommentsEmbedded.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<!-- HTML comment --><!-- MOAR HTML comments --><p>The variable \'doesntexist\' is not present</p>'
      },
      {
        message: 'should evaluate the <unless> condition as true and not render the other conditions (conditionals/ifWithSiblingIfWithNestedIfElse.html)',
        template: 'conditionals/ifWithSiblingIfWithNestedIfElse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Should render.</p>'
      },
      {
        message: 'should print the letters behind both <if> statements nested in the <loop> (conditionals/ifLoopDoubleIf.html)',
        template: 'conditionals/ifLoopDoubleIf.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>a</p><p>b</p><p>a</p><p>b</p><p>a</p><p>b</p>'
      },
      {
        message: 'should correctly print the JSON string as unmodified text (conditionals/ifJSONStringPrintJSONString.html)',
        template: 'conditionals/ifJSONStringPrintJSONString.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<pre>{"content":{"appTitle":"Some App","pageTitle":"{content.appTitle}"},"currentYear":1858,"mainDomain":"localhost:43711","NODE_ENV":"development"}</pre>'
      }
    ]
  },
  {
    describe: 'Includes',
    tests: [
      {
        message: 'should <include> a template (includes/include.html)',
        template: 'includes/include.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should <include> all templates (includes/includeMultipleTemplates.html)',
        template: 'includes/includeMultipleTemplates.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>test test</p> <p>test test</p> <p>test test</p>'
      },
      {
        message: 'should <include> a template whose name is populated by a {variable} (includes/dynamicInclude.html)',
        template: 'includes/dynamicInclude.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should populate <include> <arg> in the child template; the class should render (includes/includeArgCheckedByOneLineIfWrapper.html)',
        template: 'includes/includeArgCheckedByOneLineIfWrapper.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="populated">Is it populated? populated</p>'
      },
      {
        message: 'should <include> a template with arguments (includes/includeWithArguments.html)',
        template: 'includes/includeWithArguments.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>override</p>'
      },
      {
        message: 'should <include> a template with a nested include (includes/nestedInclude.html)',
        template: 'includes/nestedInclude.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<div><p>Some content</p></div>'
      },
      {
        message: 'should <include> a template with a nested include passing a text argument (includes/nestedIncludeWithArg.html)',
        template: 'includes/nestedIncludeWithArg.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<div><p>nested</p></div>'
      },
      {
        message: 'should <include> a template with loop arguments (includes/nestedLoop.html)',
        template: 'includes/nestedLoop.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>a</p><p>b</p><p>c</p>'
      },
      {
        message: 'should ignore and skip rendering orphaned argument (includes/orphanedArgument.html)',
        template: 'includes/orphanedArgument.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<div></div>'
      },
      {
        message: 'should <include> a template that contains loops and variables with an argument (includes/includeLoopsAndVars.html)',
        template: 'includes/includeLoopsAndVars.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>a</p><p>b</p><p>c</p><p>world</p><p>guy</p>'
      },
      {
        message: 'should <include> a template that contains numerical {variables} (includes/numericVarInArg.html)',
        template: 'includes/numericVarInArg.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>STRING!</p>'
      },
      {
        message: 'should <include> a template with numeric arguments (includes/numericArgument.html)',
        template: 'includes/numericArgument.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Hello!</p>'
      },
      {
        message: 'should escape the contents of a script when included in a template (includes/inlineScriptTag.html)',
        template: 'includes/inlineScriptTag.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Hello!</p><script>console.log(\'Hello world\'); for (var i = 0; i < 2; i++) { console.log(\'Test\') } </script>'
      },
      {
        message: 'should evaluate {variable} outside of include as original model value (includes/argRedefineModelVar.html)',
        template: 'includes/argRedefineModelVar.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<style>p { height: 10px; }</style> <p>Some content</p>'
      },
      {
        message: 'should prevent recursion abuse (includes/argVariableWithinArg.html)',
        template: 'includes/argVariableWithinArg.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>Some content</p>'
      },
      {
        message: 'should <include> a template and render pageContent inside of <if> (includes/includeIfContent.html)',
        template: 'includes/includeIfContent.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p>hello</p>'
      },
      {
        message: 'should <include> a template and render pageContent <arg> contents and correctly parse <if>, <loop>, and <if> tags (includes/includeComplexContent.html)',
        template: 'includes/includeComplexContent.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<section class="content"><article class="thing"><section class="blah">other_prop_one</section></article><article class="thing"><section class="blah">other_prop_two</section></article></section>'
      },
      {
        message: 'should <include> a template and escape regex pattern in argument (includes/includeEscapeRegex.html)',
        template: 'includes/includeEscapeRegex.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">'
      },
      {
        message: 'should ignore includes with invalid markup (includes/invalidIncludeMarkup.html)',
        template: 'includes/invalidIncludeMarkup.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<div><p>Some content</p></div>'
      },
      {
        message: 'should escape from infinite loop of includes via setMaxPasses (includes/includeInfiniteLoop.html)',
        template: 'includes/includeInfiniteLoop.html',
        test: (teddy, template, model) => {
          teddy.setVerbosity(3)
          teddy.setMaxPasses(100)

          try {
            teddy.render(template, model)
            console.log('🌈 made it here')
          } catch (e) {
            console.log('❌ inside the error?')
            return e.message
          }
        },
        expected: 'teddy could not finish rendering the template because the max number of passes over the template (100) was exceeded; there may be an infinite loop in your template logic'
      },
      {
        message: 'should evaluate a nested reverse quotes oneliner with an arg passed to it (includes/nestedOneliner.html)',
        template: 'includes/nestedOneliner.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="Some content">One line if.</p>'
      },
      {
        message: 'should populate <include> <arg> in the child template (includes/includeArgCheckedByOneLineIfWrapper.html)',
        template: 'includes/includeArgCheckedByOneLineIfWrapper.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p class="populated">Is it populated? populated</p>'
      },
      {
        message: 'should <include> a template with a one-line if statement that renders correctly (includes/includeOneLineOnlyFalse.html)',
        template: 'includes/includeOneLineOnlyFalse.html',
        test: (teddy, template, model) => teddy.render(template, model),
        expected: '<p></p>'
      }
    ]
  }
]
