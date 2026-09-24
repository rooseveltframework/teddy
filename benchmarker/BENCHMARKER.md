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

## Run

```bash
npm run benchmark
```

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

