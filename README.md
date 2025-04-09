Teddy templating engine
===

[![Build Status](https://github.com/rooseveltframework/teddy/workflows/CI/badge.svg
)](https://github.com/rooseveltframework/teddy/actions?query=workflow%3ACI) [![npm](https://img.shields.io/npm/v/teddy.svg)](https://www.npmjs.com/package/teddy)

Teddy is the most readable and easy to learn templating language there is!

Or put a more technical way, Teddy is an easy to read, HTML-inspired, mostly logic-less DOM templating engine with support for both server-side and client-side templating.

It uses HTML-like `<tags>` for rudimentary templating logic and Teddy Roosevelt's facial hair for `{variables}`.

[Check out this live demo](https://rooseveltframework.github.io/teddy/playground.html) or see below for documentation on how to write Teddy templates.

![Teddy Roosevelt's facial hair is a curly brace.](https://github.com/rooseveltframework/generator-roosevelt/blob/main/generators/app/templates/statics/images/teddy.jpg "Teddy Roosevelt's facial hair is a curly brace.")

Why yet another templating engine?
===

Good question.

Here's why:

Other popular templating engines are too cryptic
---

Are you tired of all those unnecessarily cryptic templating systems out there that look like this?

```html
<h1>{{header}}</h1>
{{#bug}}
{{/bug}}

{{#items}}
  {{#first}}
    <li><strong>{{name}}</strong></li>
  {{/first}}
  {{#link}}
    <li><a href="{{url}}">{{name}}</a></li>
  {{/link}}
{{/items}}

{{#empty}}
  <p>The list is empty.</p>
{{/empty}}
```

...Or this?

```html
{{#each comments}}
<h2><a href="/posts/{{../permalink}}#{{id}}">{{title}}</a></h2>
<div>{{body}}</div>
{{/each}}
```

...Or this?

```html
{#names}{.}{@idx}{.}{/idx}{@sep}, {/sep}{/names}
```

Want something simpler and more readable so you can stop wasting time memorizing what all those funky symbols do so you can focus more on getting actual work done?

Well you're not the only one.

Teddy, symbol-buster extraordinaire
===

Teddy the trust-buster was a man of the people, curtailing the abuse of monopolists. As [the most badass President of all-time](http://www.cracked.com/article_15895_the-5-most-badass-presidents-all-time_p5.html), there's no way he'd put up with all this indecipherable templating nonsense.

As such, Teddy the templating engine is an engine of the people, curtailing the abuse of indecipherable templating systems. Teddy trust-buster extraordinaire is now symbol-buster extraordinaire.

Here's how:

- More concise `{variable}` syntax. One curly bracket. Not two, not three, no pound signs, no question marks, no backticks, no gang signs, and no hieroglyphs.
- An `<include>` tag for layout templates and partials which accepts arguments via child `<arg>` elements.
- Flow control tags: `<if>`, `<unless>`, `<elseif>`, `<elseunless>`, and `<else>` for basic templating logic.
- A `<loop>` tag for looping.
- Server-side comments using `<!--! this syntax -->` or `{! this syntax !}` which are stripped out at the template compilation stage.

How to write Teddy templates
===

Here's some examples of how to write Teddy templates:

Variables
---

Display a variable by simply writing `{varName}` anywhere in the template. You can also use template literal `${templateLiteral}` variables as well.

All variable names are case-insensitive, both in `{varName}` form and when referenced in Teddy tags described below. This is to comply with the rules of HTML grammar which mandate that HTML tags and attributes be case insensitive.

HTML entities such as `<`, `>`, `&`, `'`, and `"` will be escaped by default as a safeguard against [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting). If you want to deliberately escape some text or some HTML, then wrap it in an `<escape>` tag like this: `<escape><p>hello</p></escape>` which will output: `&lt;p&gt;hello&lt;/p&gt;`.

If you need to suppress this escaping in certain scenarios, write your variable like this: `{varName|s}`.

### A note about inline CSS or JS via Teddy variables

If you want to pass inline CSS or JS code to a `<style>` or `<script>` tag via a Teddy variable, you can do so like this:

```html
<style>{inlineStyles|s}</style>
<script>{inlineScript|s}</script>
```

That will work, but your code editor may complain that this is a syntax error. To avoid that, Teddy also provides a convenience tag called `<inline>` to let you do it like this instead:

```html
<inline css="inlineStyles"></inline>
<inline js="inlineScript"></inline>
```

The `<inline>` tag approach will work the same as the previous examples using `<style>` or `<script>` tags manually, but code editors will not consider it a syntax error.

Includes
---

Include another template:

```html
<include src="partial.html"></include>
```

Or use the no extension shorthand (Teddy will append the `.html` extension for you):

```html
<include src="partial"></include>
```

Pass arguments to the template:

```html
<include src="partial.html">
  <arg firstArgument>Plain text argument</arg>
  <arg secondArgument>
    <span>Argument with HTML in it</span>
  </arg>
</include>
```

The arguments you've defined will be accessible as `{firstArgument}` and `{secondArgument|s}` in the child template `partial.html`. Note you must use the `|s` flag to suppress escaping HTML entities in order to render the HTML in the second argument.

Conditionals
---

Check for the presence of a variable:

```html
<if something>
  <p>The variable 'something' is present</p>
</if>
<else>
  <p>The variable 'something' is not present</p>
</else>
```

Check a variable's value:

```html
<if something="hello">
  <p>The variable 'something' is set to 'hello'</p>
</if>
<else>
  <p>The variable 'something' is not set to 'hello'</p>
</else>
```

Check for the non-presence of a variable:

```html
<unless something>
  <p>The variable 'something' is not present</p>
</unless>
<else>
  <p>The variable 'something' is present</p>
</else>
```

An `<if>` statement structure with an `<elseif>` tag which is evaluated if the first `<if>` fails:

```html
<if something>
  <p>The variable 'something' is present</p>
</if>
<elseif somethingElse>
  <p>The variable 'something' is not present, but 'somethingElse' is present</p>
</elseif>
<else>
  <p>The variable 'something' is not present and neither is 'somethingElse'</p>
</else>
```

An `<unless>` statement structure with an `<elseunless>` tag which is evaluated if the first `<unless>` fails:

```html
<unless something>
  <p>The variable 'something' is not present</p>
</unless>
<elseunless somethingElse>
  <p>The variable 'something' is present, but 'somethingElse' is not present</p>
</elseunless>
<else>
  <p>The variables 'something' and 'somethingElse' are both present</p>
</else>
```

Note: `<if something>` and `<if something="">` are considered logically equivalent statements in Teddy fjksdfjskd.

Boolean logic
---

Boolean logic operators are evaluated left to right.

`or` operator:

```html
<if something or somethingElse>
  <p>This will render if either 'something' or 'somethingElse' is present.</p>
</if>
```

`and` operator

```html
<if something and somethingElse>
  <p>This will render if 'something' is present and 'somethingElse' is present too.</p>
</if>
```

`xor` operator:

```html
<if something xor somethingElse>
  <p>This will render if either 'something' is present or 'somethingElse' is present, but it will not render if both are present.</p>
</if>
<else>
  <p>This will render if 'something' is present and 'somethingElse' is present too.</p>
</else>
```

`not:` prefix:

```html
<if not:something>
  <p>This will render if 'something' is not present.</p>
</if>
```

Note: you cannot query the same variable twice in the same if statement or use the same boolean logic operator twice in the same if statement due to the rules of HTML grammar requiring that no HTML attributes appear more than once on the same tag.

One-line ifs
---

If you need a more concise conditional to control which attributes are applied to a given element, then use this syntax:

```html
<p if-something true='class="shown"' false='class="hidden"'>One-line if.</p>
```

In that structure, the attribute `if-something` checks to see if the variable `something` is truthy. This means it will check for either variable presence in the model or the boolean value `true`. If so, the class declared in the `true` attribute is written to the element, resulting in the following output:

```html
<p class="shown">One-line if.</p>
```

If not, this will check for non-presence in the model or the boolean value `false`. If so, the class declared in the `false` attribute is written to the element, resulting in the following output:

```html
<p class="hidden">One-line if.</p>
```

Like the `<if>` tag you can check for both the presence of a variable as well as its value. To check the value of a variable, use this syntax:

```html
<p if-something="hello" true='class="hello"' false='class="not-hello"'>One-line if.</p>
```

It's important to note that whichever type of quotes you use on the outside of your `true` or `false` attributes must be reversed on the inside. So if you use single quotes on the outside, then you must use double quotes on the inside.

Also note you can only have one one-line if statement per element.

Loops
---

Assume the following JS model:

```js
letters = ['a', 'b', 'c'];
```

It can be iterated over like so:

```html
<loop through="letters" val="letter">
  <p>{letter}</p> <!-- outputs a, b, c -->
</loop>
```

In the above example `through="letters"` defines the JS model being iterated over and `val="letter"` defines a local variable for the current `letter` being iterated over.

When looping over more complex data structures, sometimes you will need access to both the key and the value of your array or object. For instance, suppose this JS model:

```js
names = {jack: 'guy', jill: 'girl', hill: 'landscape'};
```

It can be iterated over like so:

```html
<loop through="names" key="name" val="description">
  <p>{name}</p> <!-- outputs jack, jill, hill -->
  <p>{description}</p> <!-- outputs guy, girl, landscape -->
</loop>
```

We once again define a `through` attribute which we set to `through="names"` and a `val` attribute which we set to `val="description"` similar to the last example. However this time we've iterated over a JS object with named keys instead of a simple indexed array, so it is useful to define a `key` attribute in the `<loop>` tag to gain access to the name of the current iteration variable. We have defined it as `key="name"` in this example.

Even complex, hierarchical data structures can be iterated over. For instance, suppose this JS model:

```js
objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];
```

For the above array of objects, we can combine the techniques illustrated above to display each member of the hierarchy in sequence:

```html
<loop through="objects" key="i" val="item">
  <p>{i}</p> <!-- outputs 0, 1, 2 -->
  <p>{item.a}</p> <!-- outputs 1, 4, 7 -->
  <p>{item.b}</p> <!-- outputs 2, 5, 8 -->
  <p>{item.c}</p> <!-- outputs 3, 6, 9 -->
</loop>
```

## Selecting option elements, checkboxes, or radio buttons

You could use a one-line if to select `<option>` elements inside of `<select>` fields, or to select checkboxes / radio buttons like this:

```html
<select>
  <option value="a" if-foo="a" true="selected">A</option>
  <option value="b" if-foo="b" true="selected">B</option>
  <option value="c" if-foo="c" true="selected">C</option>
</select>
```

However that is tedious.

Teddy also provides a convenience attribute `selected-value` to automate this process so you can write it like this:

```html
<select selected-value="b">
  <option value="a">A</option>
  <option value="b">B</option> <!-- this will be selected -->
  <option value="c">C</option>
</select>
```

This also works with checkboxes and radio buttons using `checked-value`:

```html
<div checked-value="b">
  <input type="checkbox" name="letters" value="a">
  <input type="checkbox" name="letters" value="b"> <!-- this will be selected -->
  <input type="checkbox" name="letters" value="c">
</div>

<div checked-value="b">
  <input type="radio" name="letters" value="a">
  <input type="radio" name="letters" value="b"> <!-- this will be selected -->
  <input type="radio" name="letters" value="c">
</div>

<div checked-value="b" checked-value="c">
  <input type="checkbox" name="letters" value="a">
  <input type="checkbox" name="letters" value="b"> <!-- this will be selected -->
  <input type="checkbox" name="letters" value="c"> <!-- this will be selected -->
</div>
```

## Non-parsed blocks

To skip teddy parsing a block of code, use a `<noteddy>` or `<noparse>` tag:

```html
<p><noteddy>{this_var_will_not_be_parsed}</noteddy></p>
```

You can also instruct the contents of a variable to not be parsed after that variable is rendered using the `|p` flag:

```html
<p>{this_var_will_be_parsed_but_its_contents_will_not_be|p}</p>
```

Note: Teddy tags will also not be parsed if they appear inside of elements that interpret child text as plain text, e.g. `<style>`, `<script>`, `<textarea>`, etc. Teddy will also not parse anything in a `<pre>` tag unless you add a `parse` attribute to the `<pre>` tag like `<pre parse>`.

Caching blocks
---

You can use a `<cache>` element to prevent Teddy from having to continuously re-render blocks of template code that frequently resolve to the same markup in order to improve template parsing performance.

Here's an example:

```html
<p>Dynamic: Welcome {user}!</p>
<cache name="weather" key="city" maxCaches="3">
  <p>Cached: High temperature today in {city} is {value}.</p>
</cache>
```

In the above example, assume that there are a large number of values that `{user}` could resolve to, but there are a limited number of values that `{city}` and `{value}` could resolve to. In that case, we can cache the block of code that doesn't need re-rendering as often by enclosing it in a `<cache>` element to improve the performance of template parsing while still allowing other parts of the template to be parsed dynamically at each render.

Here's what the attributes mean:

- `name`: What you want to name your cache. The name is necessary so you can manually clear the cache from JavaScript later if you like via `teddy.clearCache(name, keyVal)`.

  - `teddy.clearCache(name)` will delete the whole cache at that name, e.g. all values for `{city}`.
  - `teddy.clearCache(name, keyVal)` will delete just the value at that keyVal, e.g. just the cache for when `{city}` resolves to NY if you set keyVal to NY.

- `key`: The model value to use to index new caches.

  - Example: Suppose `city` in the above example could resolve to three possible values: NY, SF, and LA. In that case, the caching feature will create 3 caches using the `city` key: one for each of the three possible values.

- `maxAge`: How old the cache can be in milliseconds before it is invalidated and will be re-rendered.

  - Default: 0 (no limit).

- `maxCaches`: The maximum number of caches that Teddy will be allowed to create for a given `<cache>` element. If the maximum is reached, Teddy will remove the oldest cache in the stack, where oldest is defined as the least recently created *or* accessed.

  - Default: 1000.

You can also cache whole templates. For more details about that, see the API docs below.

A complex example combining many tags
---

Supposing the following JS model again:

```js
objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];
```

We could perform many complex operations simultaneously. For instance, we could iterate over it with a `<loop>` and then at each iteration perform an `<if>` statement and `<include>` a partial:

```html
<loop through="objects" val="item">
  <if item.a="4">
    <p>item.a is 4</p>
  </if>
  <p if-item.b="5" true='class="item-b-is-five"' false="hidden">item.b is 5</p>
  <include src="partial.html">
    <arg firstArgument>{item.b}</arg>
    <arg secondArgument>
      <span>{item.c}</span>
    </arg>
  </include>
</loop>
```

*Tip: Using Teddy in [VS Code](https://code.visualstudio.com/)? Check out the [Teddy Snippets](https://marketplace.visualstudio.com/items?itemName=lannonbr.vscode-teddy-snippets) extension to help you write Teddy tags.*

Usage
===

Install Teddy with npm: `npm i teddy`.

The package is distributed with builds intended for usage in Node.js and separate builds intended for browser use. The Node.js builds use [cheerio](https://www.npmjs.com/package/cheerio) for DOM parsing and the browser builds use native DOM parsing instead.

*Note: Because the Node.js builds include cheerio as a dependency, they are much larger files. As such, you can use the Node.js builds in the browser if you want, but it is not recommended because they will result in much larger bundle sizes. Only do so if you encounter a bug that is exclusive to the browser builds.*

For use in Node.js:

- `dist/teddy.cjs`: CommonJS bundle: `const teddy = require('teddy')`
- `dist/teddy.mjs`: ES module: `import teddy from 'teddy'`

For use in browsers:

- `dist/teddy.client.cjs`: CommonJS bundle: : `const teddy = require('teddy/client')`
- `dist/teddy.js`: Standalone bundle that can be included via `<script>` tags.
- `dist/teddy.min.js`: Minified standalone bundle that can be included via `<script>` tags.
- `dist/teddy.client.mjs`: ES module: `import teddy from 'teddy/client'`
- `dist/teddy.min.mjs`: Minified ES module: `import teddy from 'teddy/client/min'`

Once Teddy is included in your app, you can then pass source code to Teddy's render method, like so: `teddy.render(sourceCode, yourModel)`. The render method will return a fully rendered template. See [API documentation](https://github.com/rooseveltframework/teddy#api) for more information about the Teddy API.

To use Teddy with with [Express](http://expressjs.com):

- First require or import `express` and `teddy`.
- Then initialize Express and configure it to your liking.
- In your Express config, make sure to include this line: `app.engine('html', teddy.__express)`.

If you're looking for a more fully-featured web framework to build web apps with using Teddy templates, then try out Teddy's companion, [Roosevelt](https://github.com/rooseveltframework/roosevelt).

If you're interested in using Teddy with the [gulp.js](http://gulpjs.com) build system for Node apps, check out the [gulp-teddy](https://github.com/Csombek/gulp-teddy) project.

API
===

- `teddy.getTemplates()`: Get the internal cache of templates.

- `teddy.setTemplate(name, template)`: Add a new template to the template cache.

- `teddy.clearTemplates()`: Clear the template cache.

- `teddy.render(template, model)`: Render a template by supplying either source code or a file name (in Node.js).

  - Returns fully rendered HTML.
  - Removes `<!--! teddy comments -->` and `{! teddy comments !}`

- `teddy.setTemplateRoot(path)`: Set the location of your templates directory.

  - Default is the current directory.

- `teddy.compile(templateString)`: Takes a template string and returns a function which when given model data will render HTML from the template and model data.

  - e.g.

    - ```javascript
      const templateFunction = teddy.compile('<p>{hello}</p>')
      templateFunction({ hello: 'world' }) // returns "<p>world</p>"
      ```

- `teddy.setVerbosity(n)`: Sets the level of verbosity in Teddy's console logs. Call `teddy.setVerbosity(n)` where `n` equals one of the below values to change the default:

  - `0` or `'none'`: No logging.
  - `1` or `'concise'`: The default. Concise logging. Will usually only log serious errors.
  - `2` or `'verbose'`: Verbose logging. Logs even minor errors.
  - `3`, `'debug'`, or `'DEBUG'`: Debug mode. Very verbose.

- `teddy.setDefaultParams()`: Reset all params to default.

- `teddy.maxPasses(n)`: Sets the maximum number of passes the parser can execute over your template. If this maximum is exceeded, Teddy will stop attempting to render the template. The limit exists to prevent the possibility of teddy producing infinite loops due to improperly coded templates.

  - Default: `1000`.

- `teddy.setEmptyVarBehavior('hide')`: Will make it possible for variables which don't resolve to display as empty strings instead of displaying the variable.

  - Default: `'display'`.

  - Override this behavior on a per variable basis by using `{varName|h}` to force it to hide or `{varName|d}` to force it to display.

- `teddy.setIncludeNotFoundBehavior('hide')`: Will make it possible for `<include>` tags which don't resolve to display as empty strings instead of displaying an error.

  - Default: `'display'`.

- `teddy.setCache(params)`: Declare a template-level cache.

  - Params:

    - `template`: Name of the template to cache.

    - `key`: Model variable to cache it by.

      - Set to `'none'` to cache the first render for all model values.

    - `maxAge`: How old the cache can be in milliseconds before it is invalidated and will be re-rendered.

      - Default: `0` (no limit).

    - `maxCaches`: The maximum number of caches that Teddy will be allowed to create for a given template/key combination. If the maximum is reached, Teddy will remove the oldest cache in the stack, where oldest is defined as the least recently created *or* accessed.

      - Default: `1000`.
      - Note: does not apply to caches where `key` is not also set.

  - Example:

    - ```javascript
      teddy.setCache({
        template: 'someTemplate.html',
        key: 'city',
        maxAge: 1000
      })
      ```

- `teddy.clearCache(name)`: If `name` is a string, it will delete the whole cache at that name.

- `teddy.clearCache(name, keyVal)`: Deletes just the value at that keyVal. Assumes `name` will be a string.

- `teddy.clearCache(params)`: If `params` is an object, it will delete a whole template-level cache.

  - Params:
    - `template`: Name of the template to delete the cache of.
    - `key`: Model variable cache index to delete it by.
      - If `key` is not provided, it will delete all caches of that template.

Hacking the code
===

If you want to write code for this project, here's how to set up a development environment:

- Fork/clone this repo.
- Install dependencies: `npm ci`
- Do a build: `npm run build` — builds are needed after every code change.
- Run the tests: `npm t`
