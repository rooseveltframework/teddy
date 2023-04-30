
Teddy templating engine
===

[![Build Status](https://github.com/rooseveltframework/teddy/workflows/CI/badge.svg
)](https://github.com/rooseveltframework/teddy/actions?query=workflow%3ACI) [![codecov](https://codecov.io/gh/rooseveltframework/teddy/branch/master/graph/badge.svg)](https://codecov.io/gh/rooseveltframework/teddy) [![npm](https://img.shields.io/npm/v/teddy.svg)](https://www.npmjs.com/package/teddy)

Teddy is the most readable and easy to learn templating language there is!

Or put a more technical way, Teddy is an easy to read, HTML-inspired, mostly logic-less DOM templating engine with support for both server-side and client-side templating.

It uses HTML-like `<tags>` for rudimentary templating logic and Teddy Roosevelt's facial hair for `{variables}`.

![Teddy Roosevelt's facial hair is a curly brace.](https://github.com/rooseveltframework/generator-roosevelt/blob/master/generators/app/templates/statics/images/teddy.jpg "Teddy Roosevelt's facial hair is a curly brace.")


Table of contents
===
- [Why yet another templating engine?](https://github.com/rooseveltframework/teddy#why-yet-another-templating-engine)
  - [Other popular templating engines are too cryptic](https://github.com/rooseveltframework/teddy#other-popular-templating-engines-are-too-cryptic)
- [Teddy, symbol-buster extraordinaire](https://github.com/rooseveltframework/teddy#teddy-symbol-buster-extraordinaire)
- [How to write Teddy templates](https://github.com/rooseveltframework/teddy#how-to-write-teddy-templates)
  - [Variables](https://github.com/rooseveltframework/teddy#variables)
  - [Includes](https://github.com/rooseveltframework/teddy#includes)
  - [Conditionals](https://github.com/rooseveltframework/teddy#conditionals)
  - [Boolean logic](https://github.com/rooseveltframework/teddy#boolean-logic)
  - [One-line ifs](https://github.com/rooseveltframework/teddy#one-line-ifs)
  - [Loops](https://github.com/rooseveltframework/teddy#loops)
  - [Non-parsed-blocks](https://github.com/rooseveltframework/teddy#non-parsed-blocks)
  - [A complex example combining many tags](https://github.com/rooseveltframework/teddy#a-complex-example-combining-many-tags)
- [Using Teddy in Node.js](https://github.com/rooseveltframework/teddy#using-teddy-in-nodejs)
- [Using Teddy with client-side JS](https://github.com/rooseveltframework/teddy#using-teddy-with-client-side-js)
- [API documentation](https://github.com/rooseveltframework/teddy#api-documentation)
- [Hacking the code](https://github.com/rooseveltframework/teddy#hacking-the-code)

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
- Server-side `{! comments !}` delimited by exclamation points in a fashion similar to `<!-- HTML comments -->`. Server-side comments are stripped out at the template compilation stage.


How to write Teddy templates
===

Here's some examples of how to write Teddy templates:


Variables
---

Display a variable by simply writing `{varName}` anywhere in the template.

HTML entities such as `<`, `>`, `&`, `'`, and `"` will be escaped by default as a safeguard against [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting).

If you need to suppress this escaping in certain scenarios, write your variable like this: `{varName|s}`.


Includes
---

Include another template:

```html
<include src='partial.html'></include>
```

Or use the no extension shorthand (Teddy will append the `.html` extension for you):

```html
<include src='partial'></include>
```

Pass arguments to the template:

```html
<include src='partial.html'>
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
<if something='hello'>
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

Note: `<if something>` and `<if something=''>` are considered logically equivalent statements in Teddy. 

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
<p if-something true="class='shown'" false="class='hidden'">One-line if.</p>
```

In that structure, the attribute `if-something` checks to see if the variable `something` is truthy. This means it will check for either variable presence in the model or the boolean value `true`. If so, the class delcared in the `true` attribute is written to the element, resulting in the following output:

```html
<p class='shown'>One-line if.</p>
```

If not, this will check for non-presence in the model or the boolean value `false`. If so, the class declared in the `false` attribute is written to the element, resulting in the following output:

```html
<p class='hidden'>One-line if.</p>
```

Like the `<if>` tag you can check for both the presence of a variable as well as its value. To check the value of a variable, use this syntax:

```html
<p if-something='hello' true="class='hello'" false="class='not-hello'">One-line if.</p>
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
<loop through='letters' val='letter'>
  <p>{letter}</p> <!-- outputs a, b, c -->
</loop>
```

In the above example `through='letters'` defines the JS model being iterated over and `val='letter'` defines a local variable for the current `letter` being iterated over.

When looping over more complex data structures, sometimes you will need access to both the key and the value of your array or object. For instance, suppose this JS model:

```js
names = {jack: 'guy', jill: 'girl', hill: 'landscape'};
```

It can be iterated over like so:

```html
<loop through='names' key='name' val='description'>
  <p>{name}</p> <!-- outputs jack, jill, hill -->
  <p>{description}</p> <!-- outputs guy, girl, landscape -->
</loop>
```

We once again define a `through` attribute which we set to `through='names'` and a `val` attribute which we set to `val='description'` similar to the last example. However this time we've iterated over a JS object with named keys instead of a simple indexed array, so it is useful to define a `key` attribute in the `<loop>` tag to gain access to the name of the current iteration variable. We have defined it as `key='name'` in this example.

Even complex, hierarchical data structures can be iterated over. For instance, suppose this JS model:

```js
objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];
```

For the above array of objects, we can combine the techniques illustrated above to display each member of the hierarchy in sequence:

```html
<loop through='objects' key='i' val='item'>
  <p>{i}</p> <!-- outputs 0, 1, 2 -->
  <p>{item.a}</p> <!-- outputs 1, 4, 7 -->
  <p>{item.b}</p> <!-- outputs 2, 5, 8 -->
  <p>{item.c}</p> <!-- outputs 3, 6, 9 -->
</loop>
```

## Non-parsed blocks

To skip teddy parsing a block of code, use a `<noteddy>` tag:

```html
<p><noteddy>{this_var_will_not_be_parsed}</noteddy></p>
```

You can also instruct the contents of a variable to not be parsed after that variable is rendered using the `|p` flag:

```html
<p>{this_var_will_be_parsed_but_its_contents_will_not_be|p}</p>
```

Note: Teddy tags will also not be parsed if they appear inside of elements that interpret child text as plain text, e.g. `<style>`, `<script>`, `<textarea>`, etc.

A complex example combining many tags
---

Supposing the following JS model again:

```js
objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];
```

We could perform many complex operations simultaneously. For instance, we could iterate over it with a `<loop>` and then at each iteration perform an `<if>` statement and `<include>` a partial:

```html
<loop through='objects' val='item'>
  <if item.a='4'>
    <p>item.a is 4</p>
  </if>
  <p if-item.b='5' true="class='item-b-is-five'" false='hidden'>item.b is 5</p>
  <include src='partial.html'>
    <arg firstArgument>{item.b}</arg>
    <arg secondArgument>
      <span>{item.c}</span>
    </arg>
  </include>
</loop>
```

*Tip: Using Teddy in [VS Code](https://code.visualstudio.com/)? Check out the [Teddy Snippets](https://marketplace.visualstudio.com/items?itemName=lannonbr.vscode-teddy-snippets) extension to help you write Teddy tags.*

Using Teddy in Node.js
===

Install Teddy with npm: `npm i teddy`. Then require or import the module to gain access to its API. See [API documentation](https://github.com/rooseveltframework/teddy#api-documentation).

Teddy is also designed for use with [Express](http://expressjs.com).

- First require or import `express` and `teddy`.
- Then initialize Express and configure it to your liking.
- In your Express config, make sure to include this line: `app.engine('html', teddy.__express)`.

If you're looking for a more fully-featured web framework to build web apps with using Teddy templates, then try out Teddy's companion, [Roosevelt](https://github.com/rooseveltframework/roosevelt).

If you're interested in using Teddy with the [gulp.js](http://gulpjs.com) build system for Node apps, check out the [gulp-teddy](https://github.com/Csombek/gulp-teddy) project.


Using Teddy with client-side JS
===

- Use Teddy in a script tag without a module bundler: Install Teddy with npm. You can then load the `node_modules/teddy/dist/teddy.js` file into a script tag which will create a global `teddy` variable you can use to gain access to its API.
- Use Teddy with a module bundler: Install Teddy with npm. You can then import the module from `node_modules/teddy/dist/teddy.js` to a module bundler like Browserify, Webpack, etc to gain access to its API.

You can then pass source code to Teddy's render method, like so:  `teddy.render(sourceCode, yourModel)`. The render method will return a fully rendered template. See [API documentation](https://github.com/rooseveltframework/teddy#api-documentation) for more information about the Teddy API.

Teddy is supported on all modern browsers. Support for Internet Explorer was dropped with Teddy 0.5.0.

To install without npm, you can clone this repo and build teddy manually by running `npm run build`.


API documentation
===

- `teddy.getTemplates()`: Get the internal cache of templates.
- `teddy.setTemplate(name, template)`: Add a new template to the template cache.
- `teddy.render(template, model)`: Render a template by supplying either source code or a file name (in Node.js).
  - Returns fully rendered HTML.
  - Removes `{! teddy comments !}`
- `teddy.setTemplateRoot(path)`: Set the location of your templates directory.
  - Default is the current directory.
- `teddy.setVerbosity(n)`: Sets the level of verbosity in Teddy's console logs. Call `teddy.setVerbosity(n)` where `n` equals one of the below values to change the default:
  - `0`: No logging.
  - `1`: The default. Concise logging. Will usually only log serious errors.
  - `2`: Verbose logging. Logs even minor errors.
  - `3`: Debug mode. Very verbose.
- `teddy.setDefaultParams()`: Reset all params to default.
- `teddy.maxPasses(n)`: Sets the maximum number of passes the parser can execute over your template. If this maximum is exceeded, Teddy will stop attempting to render the template. The limit exists to prevent the possibility of teddy producing infinite loops due to improperly coded templates.
  - Default: 1000.

Hacking the code
===

If you want to write code for this project, here's how to set up a development environment:

- Fork/clone this repo.
- Install dependencies: `npm ci`
- Do a build: `npm run build` — builds are needed after every code change.
- Run the tests: `npm t`
