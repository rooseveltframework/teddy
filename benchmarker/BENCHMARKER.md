# Teddy benchmarks

## What is being compared

| Engine | Family |
| --- | --- |
| [Teddy](https://rooseveltframework.org/docs/teddy) | HTML tags |
| [EJS](https://ejs.co) | embedded JavaScript |
| [Pug](https://pugjs.org) | indentation |
| [Mustache](https://github.com/janl/mustache.js) | logic-less braces |
| [Handlebars](https://handlebarsjs.com) | logic-less braces |
| [Dust.js](https://www.dustjs.com) | logic-less braces |
| [Marko](https://markojs.com) | HTML tags, compiled |
| [Nunjucks](https://mozilla.github.io/nunjucks) | Jinja |
| [LiquidJS](https://liquidjs.com) | Liquid |
| [Eta](https://eta.js.org) | embedded JavaScript |
| [Squirrelly](https://squirrelly.js.org) | embedded JavaScript |
| [doT](https://olado.github.io/doT) | embedded JavaScript |
| [Lodash template](https://lodash.com/docs#template) | embedded JavaScript |
| [art-template](https://aui.github.io/art-template) | embedded JavaScript |
| [PHP](https://rooseveltframework.org/docs/node-php-runner) via [node-php-runner](https://github.com/rooseveltframework/node-php-runner) | PHP |

## The scenarios

Six pages, each isolating a different cost:

| Scenario | What it renders | What it separates out |
| --- | --- | --- |
| `variables` | 28 interpolations, one escaped and one raw | model lookup and writing a value out |
| `conditionals` | 8 branches, including an else-if chain and an inline attribute condition | branch evaluation, and the cost of the branch not taken |
| `loops` | 24 products, each with a branch and a nested loop over 3 tags | nested iteration |
| `table` | 1,000 rows of 7 cells | how the engine scales when one small body repeats |
| `partials` | a header and footer once, a product partial 24 times | per-call overhead of including another template, and of the partial reading the caller's loop variable |
| `page` | a full document: head, header, banner, else-if chain, 24 products, a 25 row table, footer | all of the above, which is the closest thing here to a real request |

## Has teddy got faster or slower?

To see what your changes did to teddy's speed, compare them against `main`:

```bash
npm run benchmark:compare
```

That measures teddy as it is in this checkout, uncommitted changes and all, and teddy at `main`, three times each, taking turns. It takes a few minutes. Nothing in this checkout is stashed, switched or rewritten: `main` is checked out into a temporary git worktree, built there, and removed afterwards. Other ways to call it:

```bash
npm run benchmark:compare -- 2.1.0              # this checkout against another branch, tag or commit
npm run benchmark:compare -- 2.1.0 main         # one version against another
npm run benchmark:compare -- main main          # a version against itself: how much the numbers move on their own
npm run benchmark:compare -- --runs=5           # more runs: slower, and a steadier answer
npm run benchmark:compare -- --scenarios=page --no-browser    # narrower, and quicker
```

It prints a summary first, then a table for each pass, and writes the same thing to `COMPARISON.md` (which isn't committed, since the numbers only mean something on the machine that measured them). For example:

```
in short
  Rendering a compiled template in Chromium: about 16% faster overall, and up to 22% faster (variables)
  Compiling and rendering a template in Chromium: about 10% slower overall
  Rendering a precompiled template in Chromium: about 1.6× as fast overall, and up to 1.7× as fast (page)

Chromium, precompiled: rendering a template precompiled in node
  scenario                  main   this checkout     change      noise  verdict
  page                    90,678         156,925     +73.1%      ±0.9%  ▲ faster
  variables              526,817         760,360     +44.3%      ±1.5%  ▲ faster
  overall                                            +58.0%      ±0.6%  ▲ faster
```

How to read it:

- The figures are renders per second, the median of each version's runs. Higher is faster.
- **Noise** is how far apart the runs of the *same* code landed. Two runs of identical code differ by a few percent for a steady measurement and by twenty or more for a jumpy one, so a change smaller than the noise could be chance. A change is only called **faster** or **slower** when it's bigger than the noise, and bigger than 3%; anything else is **no clear change**.
- **Overall** is the geometric mean of the pass's scenarios, and its noise is worked out across all of them at once, which makes it much steadier than any one scenario. A change too small to be sure of in one scenario can be clear overall.
- The passes: **cached** is rendering a template that's already compiled, which is what an app does nearly all the time. **Cold** compiles and renders it every time, which an app does once per template. **Precompiled** renders in a browser a template compiled in node ahead of time.
- If a verdict says "no clear change" where you expected one, run it again with `--runs=5`. If a version compared against itself shows changes, the machine was too busy to measure on.

The summary is written to go straight into a changelog: take the passes that say faster or slower, and leave out the ones that say "no clear change", which is all that can honestly be said for them. The summary above became:

> Improved client-side rendering performance. Precompiled templates now render about 1.5× as fast, and cached templates up to a quarter faster. Compiling a template in the browser is about 10% slower, since whitespace between elements is now kept.

The version compared against is built with this checkout's installed dependencies, so the difference is teddy's own code. To measure a dependency update instead, use the baseline described below.

## Run

```bash
npm run benchmark
```

This measures every engine, which is what `BENCHMARKS.md` reports, and takes much longer than a comparison. teddy is built first if its build is missing, or older than its source, so a run never measures a build left over from another branch.

### Options

Anything after `--` reaches the suite: `npm run benchmark -- --modes=cached,cold --browser`.

```
--engines=teddy,ejs,pug     only these engines
--scenarios=table,page      only these scenarios
--browser=chromium          which browser to measure in (chromium, firefox, webkit)
--no-browser                skip the browser passes
--precompiled=chromium      which browser to measure precompiled templates in
--no-precompiled            skip the precompiled browser pass
--modes=cached,cold         what to measure (default: both)
--time=1000                 milliseconds per measurement
--warmup=250                milliseconds of warmup per measurement
--iterations=16             minimum samples per measurement
--table-rows=1000           rows in the table scenario
--products=24               products in the loop, partial, and page scenarios
--no-isolate                run every measurement in this process
--no-verify                 skip the output equivalence check
--verify-only               run the equivalence check and stop
--out=.                     where to write BENCHMARKS.json and BENCHMARKS.md
--no-write                  print the report without writing files
--write                     write BENCHMARKS.md from a partial run, which it otherwise refuses to do
--no-save-baseline          keep the existing baseline instead of replacing it with this run
--save-baseline             record a partial run as the baseline, which it otherwise will not do
--baseline=BASELINE.json    compare against a baseline kept somewhere else
--list                      list engines and scenarios
--help                      this list
```

