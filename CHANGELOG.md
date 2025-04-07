# Teddy Changelog

## Next version

- Put your changes here...

## 1.1.0

- Added `<escape>` tag.
- Excluded `<pre>` tags from Teddy parsing. Add a `parse` attribute to prevent this behavior.
- Fixed a bug that could cause infinite loops in variable parsing.
- Updated dependencies.

## 1.0.1

- Fixed a bug that caused client-side Teddy to try to fetch resources from the server inappropriately while parsing the template.
- Updated dependencies.

## 1.0.0

- Added support for a new `<!--! server-side comments -->` syntax.
- Changed the behavior of `<include>` tags to display an error when attempting to include a template that does not exist.
- Updated various dependencies.

## 0.6.26

- Fixed a bug that could cause ${templateLiteral} strings to lose their $ character if they were meant to print as strings and not be parsed as Teddy variables.
- Updated various dependencies.

## 0.6.25

- Fixed bugs associated with `selected-value` and `checked-value` attributes.

## 0.6.24

- Added `{varName|h}` to force hide or `{varName|d}` to force display variable. This is a per-var override for:
  - `teddy.setEmptyVarBehavior('hide')`: Will make it possible for variables which don't resolve to display as empty strings instead of displaying the variable.
    - Default: 'display'.
- Added support for sourcing most Teddy attribute values dynamically from `{variables}`.
- Added boolean logic to one-line if statements.
- Added `selected-value` and `checked-value` attributes for setting what option to select or what checkbox / radio to check in a more concise way than using one-line ifs.
- Fixed a bug that prevented boolean logic from working if there were multiple `and` or multiple `or` attributes on an element.
- Updated various dependencies.

## 0.6.23

- Added new `<inline>` tag for adding inline CSS or JS using Teddy variables. Usage is optional, but it can help you avoid syntax error warnings in your code editor.
- Fixed a bug preventing `<include>` args from parsing correctly in certain circumstances.
- Updated various dependencies.

## 0.6.22

- Made variable name lookups case insensitive in server-side Teddy to match client-side Teddy so as to match HTML grammar rules.
- Added some performance improvements to loops and includes.
- Fixed a bug preventing `<noparse>` and `<noteddy>` tags from working in markup passed to include tags.
- Updated various dependencies.

## 0.6.21

- Fixed missing exports so you can require/import teddy less verbosely in your projects.
- Updated docs to clarify what the different builds of Teddy are meant to be used for.
- Removed minified cjs build since there is no use case for it.
- Updated various dependencies.

## 0.6.20

- Fixed double-encoding HTML entity bug in client-side mode.
- Updated various dependencies.

## 0.6.19

- Made client-side Teddy parser a bit more tolerant of bad markup.

## 0.6.18

- Fixed a bug which caused client-side Teddy to rename yet more form elements accidentally.

## 0.6.17

- Fixed a bug which caused client-side Teddy to handle array length lookups differently from `cheerio`-driven Teddy.
- Fixed a bug which caused client-side Teddy to crash if extra spaces were in markup attribute lists.
- Fixed a bug which caused client-side Teddy to return the wrong data with 2 or more layers of object lookups if the object keys were camelCase.
- Fixed a bug which caused client-side Teddy to rename some form elements accidentally.
- Updated various dependencies.

## 0.6.16

- Fixed a bug which caused client-side Teddy to fail in some situations like putting a `<loop>` in a `<select>` element.
- Deprecated a test that tests for passing numeric arguments to include tags, since this violates HTML grammar and never should've worked to begin with. It may still work with `cheerio`-driven Teddy because `cheerio`'s parser is more forgiving than a standards-compliant one unless and until `cheerio` deprecates support for that itself. Client-side Teddy will not support it, so for consistency the test has been removed.
- Updated various dependencies.

## 0.6.15

- Fixed a bug which caused the `cheerio`-driven modules to not work client-side if you choose to use them there.
- Updated various dependencies.

## 0.6.14

- Finished work on `cheerioPolyfill.js` which makes it possible for Teddy to execute in client-side contexts without using `cheerio`, allowing for a very small bundle size for client-side Teddy (17kb minified).
- Fixed client-side tests to test Teddy in the browser properly.
- Refactored tests to improve maintainability.
- Updated various dependencies.

## 0.6.13

- Removed `xregexp` and `html-entities` dependencies. Also Replaced `cheerio` with `cheerio/slim`. These changes have reduced bundle size significantly.
- Began work on `cheerioPolyfill.js` which will allow Teddy to execute in client-side contexts without using `cheerio`. This will result in even smaller bundle sizes (currently around 16kb minified), however the work is unfinished.
- Updated various dependencies.

## 0.6.12

- Downgraded `cheerio` to prevent webpack errors when using Teddy on frontend.
- Updated various dependencies.

## 0.6.11

- Added new setting `teddy.setEmptyVarBehavior('hide')` that will make it possible for variables which don't resolve to display as empty strings instead of displaying the variable.

## 0.6.10

- Added support for template literal `${templateLiteral}` variables.
- Fixed bug that caused Teddy to crash if you attempted to loop through a Set.
- Replaced internal HTML entities scanner with the `html-entities` npm package.
- Updated various dependencies.

## 0.6.9

- Fixed issue with rendering variables with empty strings piped through variables with flags.
- Updated various dependencies.

## 0.6.8

- Fixed issue with rendering special characters correctly when piped through a teddy noparse flagged variable.
- Updated various dependencies.

## 0.6.7

- Fixed issue causing server-side comments to not be stripped from templates parsed as strings instead of as files.
- Updated various dependencies.

## 0.6.6

- Fixed issue causing the template caching feature to not work properly in Express apps.
- Updated various dependencies.

## 0.6.5

- Fixed scenario where one-line if with only a false condition could crash if it's fed by arguments from an include element.
- Fixed crash associated with embedding JSON strings in script tags.
- Fixed bug causing "{}" to be inappropriately stripped from templates.
- Reduced unminified bundle size from 2.4mb to 1.5mb and added a minified bundle that reduces it further to 449kb.
- Improved logging and refactored the code a bit.
- Updated various dependencies.

## 0.6.4

- Fixed crash that could occur in an unusual edge case.
- Various dependencies bumped.

## 0.6.3

- Restored template-level caching feature with an improved API.
- Restored compile method but now with an API similar to other templating systems. It will now take a template string and return a function which when given model data will render HTML from the template and model data.
- Now hosting the Teddy playground on [https://rooseveltframework.github.io/teddy/playground.html](https://rooseveltframework.github.io/teddy/playground.html). Thanks to [jsDelivr](https://www.jsdelivr.com/package/npm/teddy?tab=files) for CDN hosting.
- Various dependencies bumped.

## 0.6.2

- Significant performance improvements.
- Added a new `<cache>` element that can be used to improve template parsing performance further.
- Various dependencies bumped.

## 0.6.1

- Fixed memory leak related to the no parse block feature.
- Various dependencies bumped.

## 0.6.0

- Breaking: `<include>` elements will no longer automatically disable escaping content of `<arg>` variables. Use `{var|s}` to disable escaping yourself.
- Breaking: One-line if statements like `if-something=''` will now evaluate as true if `something` is present in the model.
- Breaking: You can no longer apply more than one one-line if statement to the same element.
- Breaking: Boolean logic will no longer allow you to query the same variable twice in the same if statement or use the same boolean logic operator twice in the same if statement.
- Breaking: You can no longer use Teddy tags in elements that interpret child text as plain text, e.g. `<style>`, `<script>`, `<textarea>`, etc.
- Breaking: Removed the `noparse` and `noteddy` attribute feature from `<include>` tags.
- Breaking: Removed Teddy's internal minifier since third party HTML minifiers are better.
- Breaking: Removed caching feature. A better-designed one may arrive in the future.
- Breaking: Server-side comments will now always be removed, even if they are contained in a no-parse block. To preserve them for display, you must manually escape them with HTML entities.
- Breaking: `teddy.compile` was removed as a public method. To set a new template, you must now call `teddy.setTemplate` to create it. Accordingly the `teddy.compileAtEveryRender` method has been removed as well.
- Breaking: The `|p` flag will now also apply the same logic as `|s` as well. If you have any `{variables}` written like `{variable|s|p}`, you can now optionally write it as `{variable|p}` instead to get identical functionality.
- Breaking: The `in` attribute as a synonym for `through` in `<loop>` has been removed.
- Significant stability improvements; lots of bugs fixed.
- Some performance improvements, some performance downgrades (notably looping through large datasets is slightly slower now).
- Simplified API.
- `maxPasses` default changed from 25000 to 1000.
- Various dependencies bumped.

## 0.5.10

- Fixed bug with one-line-ifs. See https://github.com/rooseveltframework/teddy/pull/540
- Various dependencies bumped.

## 0.5.9

- Fixed an issue where model content could get printed without being escaped even when the `|s` flag is not present.
- Various dependencies bumped.

## 0.5.8

- Fixed bug in client-side support where file extensions would be inappropriately appended to template names in some cases.
- Dropped Node 15 support. Added Node 16 support.
- Various dependencies bumped.

## 0.5.7

- Closed:
  - https://github.com/rooseveltframework/teddy/issues/446
  - https://github.com/rooseveltframework/teddy/issues/431
  - https://github.com/rooseveltframework/teddy/issues/449
  - https://github.com/rooseveltframework/teddy/issues/426
- Dropped Node 12 support.
- Various dependencies bumped.

## 0.5.6

- Closed https://github.com/rooseveltframework/teddy/issues/404
- Various dependencies bumped.

## 0.5.5

- Closed https://github.com/rooseveltframework/teddy/issues/421

## 0.5.4

- Closed https://github.com/rooseveltframework/teddy/issues/412
- Closed https://github.com/rooseveltframework/teddy/pull/418
- Closed many unreported bugs.
- Wrote a test for https://github.com/rooseveltframework/teddy/issues/404
- Wrote a test for https://github.com/rooseveltframework/teddy/issues/357 but upon further investigation now consider it a wontfix.
- Various dependencies bumped.

## 0.5.3

- Fixed some Windows-exclusive bugs related to how newlines are parsed in Windows vs. other operating systems.
- Various dependencies bumped.
- CI improvements.

## 0.5.2

- Undo accidental removal of package-lock.json.

## 0.5.1

- Removed postinstall script since it created a problematic prompt to install webpack-cli during npm installs.

## 0.5.0

- Variables with spaces in them will now be parsed.
- Fixed issue where one line if statements couldn't use variables as part of the condition.
- Fixed issue where recursive variable resolution could cause an infinite loop.
- Significant performance improvements.
- Total rewrite into a much cleaner codebase:
  - Less reliance on regex and more reliance on character counting in base algorithm.
  - Code now split into separate files for development but bundled into a single JS file with Webpack during deployment.
- Various dependencies bumped.
- CI improvements.

## 0.4.28 and below

[Here be dragons](https://en.wikipedia.org/wiki/Here_be_dragons)...
