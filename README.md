Teddy templating engine
===
[![NPM version](https://badge.fury.io/js/teddy.png)](http://badge.fury.io/js/teddy) [![Dependency Status](https://gemnasium.com/kethinov/teddy.png)](https://gemnasium.com/kethinov/teddy) [![Gittip](http://img.shields.io/gittip/kethinov.png)](https://www.gittip.com/kethinov/)

Teddy is an easy-to-read, HTML-based, mostly logic-less DOM templating engine with support for both server-side and client-side templating.

It uses HTML-like `<tags>` for rudimentary templating logic and Teddy Roosevelt's facial hair for `{variables}`.

![Teddy Roosevelt's facial hair is a curly brace.](https://raw.github.com/kethinov/teddy/master/assets/teddy.jpg "Teddy Roosevelt's facial hair is a curly brace.")

Table of contents
===

- [Why yet another templating engine?](https://github.com/kethinov/teddy#why-yet-another-templating-engine)
  - [Other popular templating engines are too cryptic](https://github.com/kethinov/teddy#other-popular-templating-engines-are-too-cryptic)
- [Teddy, symbol-buster extraordinaire](https://github.com/kethinov/teddy#teddy-symbol-buster-extraordinaire)
- [How to write Teddy templates](https://github.com/kethinov/teddy#how-to-write-teddy-templates)
  - [Includes](https://github.com/kethinov/teddy#includes)
  - [Conditionals](https://github.com/kethinov/teddy#conditionals)
  - [Boolean logic](https://github.com/kethinov/teddy#boolean-logic)
  - [One line ifs](https://github.com/kethinov/teddy#one-line-ifs)
  - [Loops](https://github.com/kethinov/teddy#loops)
  - [A complex example combining all tag types](https://github.com/kethinov/teddy#a-complex-example-combining-all-tag-types)
- [Using Teddy in Node.js](https://github.com/kethinov/teddy#using-teddy-in-nodejs)
- [Using Teddy with client-side JS](https://github.com/kethinov/teddy#using-teddy-with-client-side-js)
- [API documentation](https://github.com/kethinov/teddy#api-documentation)
- [Notable intentional design choices and limitations](https://github.com/kethinov/teddy#notable-intentional-design-choices-and-limitations)
- [Client-side browser support](https://github.com/kethinov/teddy#client-side-browser-support)
- [How to run the unit tests](https://github.com/kethinov/teddy#how-to-run-the-unit-tests)
- [Dependencies](https://github.com/kethinov/teddy#dependencies)
- [License](https://github.com/kethinov/teddy#license)

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

Want something simpler and more readable so you can stop wasting time memorizing what all those funky symbols do and just get work done?

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
- Server-side `{!comments!}` delimited by exclamation points in a fashion similar to `<!-- HTML comments -->`. Server-side comments are stripped out at the template compilation stage.
- No funky symbols to memorize. Just `{variables}` for data and new HTML-like `<tags>` for rudimentary logic.

How to write Teddy templates
===

Here's some examples of how to write Teddy templates:

Variables
---

Display a variable by simply writing `{varName}` anywhere in the template.

HTML entities such as `<`, `>`, `&`, `'`, and `"` will be escaped.

If you want to suppress this escaping, write your variable like this: `{varName|s}`.

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

The arguments you've defined will be accessible as `{firstArgument}` and `{secondArgument}` in the child template `partial.html`.

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

One line ifs
---

If you need a more concise conditional just to control which attributes are applied to a given element, then use this syntax:

```html
<p if-something true="class='present'" false="class='not-present'">One line if.</p>
```

In that structure, the attribute `if-something` checks to see if the variable `something` is present. If so, the class delcared in the `true` attribute is written to the element, resulting in the following output:

```html
<p class='present'>One line if.</p>
```

If not, the class declared in the `false` attribute is written to the element, resulting in the following output:

```html
<p class='not-present'>One line if.</p>
```

Like the `<if>` tag you can check for both the presence of a variable as well as its value. To check the value of a variable, use this syntax:

```html
<p if-something='hello' true="class='hello'" false="class='not-hello'">One line if.</p>
```

It's important to note that whichever type of quotes you use on the outside of your `true` or `false` attributes must be reversed on the inside. So if you use single quotes on the outside, then you must use double quotes on the inside.

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

*Note: you can also use `in` in place of `through` if you like a more concise syntax.*

A complex example combining all tag types
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

Using Teddy in Node.js
===

Teddy is designed for use with [Express](http://expressjs.com) in [Node.js](http://nodejs.org).

- First require the node modules `express`, and `teddy`
- Then initialize express and configure it to your liking
- In your express config, make sure to include this line: `app.engine('html', teddy.__express)`

For a complete sample implementation, see the sample app here: [sampleApps/nodeHelloWorld](https://github.com/kethinov/teddy/tree/master/sampleApps/nodeHelloWorld).

Or if you're looking for a more fully-featured web framework to build web apps with using Teddy templates, then try out Teddy's companion, [Roosevelt](https://github.com/kethinov/roosevelt).


Using Teddy with client-side JS
===

Server-side app:

- Setup a Node.js app using the instructions above
- Precompile templates somewhere in your app using the `teddy.compile('templateName.html')` method
- Create a route that serves one or more precompiled templates as `text/javascript`
- Optionally write the precompiled templates somewhere to disk and serve them as statics instead to optimize for performance

Client-side HTML:

- Include teddy.js: `<script src='teddy.js'></script>`
- Include precompiled templates: `<script src='path/to/precompiled/templates'></script>`
- Include your client.js: `<script src='client.js'></script>`

Writing your client.js:

- Define a model: `var model = {some: 'data'}` or optionally pull the JSON from the server, localStorage, or wherever
- Render a template client-side: `var rendered = teddy.render(teddy.compiledTemplates['template.html'], model)`
- Render the template into the document somewhere, for instance: `document.body.insertAdjacentHTML('beforeend', rendered);`

For a complete sample implementation, see the sample app here: [sampleApps/client-server](https://github.com/kethinov/teddy/tree/master/sampleApps/client-server).

API documentation
===

- `teddy.compile(path)`: Compile a template server-side by referencing a file name. This method returns a compiled template. It also populates these two objects:
  - `teddy.compiledTemplates`: Object indexed by template file path and file name.
  - `teddy.packagedTemplates`: Same as compiledTemplates, except it stores packaged templates instead of compiled templates. Packaged templates are templates compiled on the server and sent to the client as raw JS statements that can be simply eval'd client-side rather than compiled client-side.
- `teddy.compile(templateString, templateName)`: Compile a template directly by passing a string rather than a file name. Give the template a name using the second argument. This method returns a compiled template. It also populates the two objects mentioned above, but instead indexes them by your chosen templateName, as path is not relevant.
- `teddy.render(templateNameOrPath, dataModel)`: Render a template. This method will compile the template if it has not already been compiled.
- `teddy.setTemplateRoot(path)`: Set the location of your templates directory. The default is the current directory.
- `teddy.setVerbosity(n)`: Sets the level of verbosity in Teddy's console logs. Call `teddy.setVerbosity(n)` where `n` equals one of the below values to change the default:
  - `0`: No logging.
  - `1`: The default. Concise logging. Usually just logs serious errors.
  - `2`: Verbose logging. Logs even minor errors.
  - `3`: Debug mode. Very verbose.
- `teddy.strictParser(true)`: When this setting is enabled, Teddy will throw an exception if the template is not well formed. Default is false. *(Not recommended to enable in production as throwing exceptions could cause downtime.)*
- `teddy.enableForeachTag(true)`: When this setting is enabled, Teddy will allow the old `<foreach>` tag syntax. Default is false. *(Not recommended to enable as the `foreach` tag will likely be deprecated in the future.)*
- `teddy.compileAtEveryRender(true)`: When this setting is enabled, Teddy will compile the template at each render rather than caching previous compiles. Default is false. *(Not recommended to enable in production for performance reasons.)*

Notable intentional design choices and limitations
===

- All variables in Teddy templates are case-insensitive because HTML is case-insensitive.
- Teddy adheres to a mostly logic-less templates philosophy. Teddy is of the opinion that complex logic beyond what Teddy tags are capable of generally doesn't belong in templates. Evaluate such logic at the code level and pass the results to the templates through the model as readable variables.
- Teddy's client-side performance and browser support is largely tied to how well [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) and [XMLSerializer](https://developer.mozilla.org/en-US/docs/XMLSerializer) are implemented (if at all) in the target browser.
- Teddy is beta software! Not many apps have been written using Teddy yet, so it's entirely possible that there will be some significant bugs.

Client-side browser support
===

Teddy is supported on:

- Recent versions of Chrome
- Recent versions of Firefox
- Recent versions of Opera
- Recent versions of Safari
- Android browser 4.x+
- Internet Explorer 10+

How to run the unit tests
===

Want to hack teddy's code but don't want to break something and cause a regression in the process? Run the supplied unit tests to sanity check existing features.

Start by cloning the git repo:

```
git clone git@github.com:kethinov/teddy.git
cd teddy
```

Install dependencies for the server test:

```
npm install
```

Run server test:

```
npm test
```

To run the client tests, open `unitTests/client/clientTests.html` and follow its instructions.

Dependencies
===

Node.js dependencies:

- [xmldom](https://github.com/jindw/xmldom) - W3C Standard based (XML DOM Level 2 Core) DOMParser and XMLSerializer for Node.js

Client-side dependencies:

- [DOMParser HTML extension](https://gist.github.com/eligrey/1129031)</a> (bundled) - polyfill for DOMParser parseFromString for certain browsers

Node.js unit test dependencies:

- None

Client-side unit test dependencies:

- [prettify.js](https://code.google.com/p/google-code-prettify)</a> (bundled) - used to syntax highlight rendered template in unitTests/client/clientTests.html
- [vkBeautify](http://www.eslinstructor.net/vkbeautify) (bundled) - used to indent rendered template in unitTests/client/clientTests.html

License
===

All original code in Teddy is licensed under the [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0)</a>. Commercial and noncommercial use is permitted with attribution.