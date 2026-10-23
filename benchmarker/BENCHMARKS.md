# Templating engine benchmarks

These benchmarks were ran on the following hardware:

| | |
| --- | --- |
| Node | v26.9.0 (V8 14.6.202.34-node.32) |
| Platform | Linux 7.0.0-38-generic x64 |
| CPU | AMD Ryzen 9 9900X 12-Core Processor, 24 cores |
| Memory | 121 GB |
| Time per measurement | 1000 ms |
| Process isolation | one child process per measurement |

## Overall

### In Node, cached

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Teddy | 6 | same |
| Pug | 6 | 1.27× slower |
| Eta | 6 | 1.29× slower |
| Squirrelly | 6 | 1.38× slower |
| Marko | 6 | 1.98× slower |
| doT | 6 | 2.69× slower |
| art-template | 6 | 2.99× slower |
| Dust.js | 6 | 5.80× slower |
| Handlebars | 6 | 6.53× slower |
| Lodash template | 6 | 7.46× slower |
| Mustache | 6 | 9.49× slower |
| Nunjucks | 6 | 9.79× slower |
| EJS | 6 | 17.62× slower |
| PHP (node-php-runner) | 6 | 29.64× slower |
| LiquidJS | 6 | 84.13× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 15.85× faster |
| Eta | 6 | 12.87× faster |
| Squirrelly | 6 | 9.79× faster |
| art-template | 6 | 3.92× faster |
| Mustache | 6 | 3.90× faster |
| Lodash template | 6 | 3.46× faster |
| EJS | 6 | 3.19× faster |
| Handlebars | 6 | 1.50× faster |
| Nunjucks | 6 | 1.45× faster |
| Dust.js | 6 | 1.34× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 1.01× slower |
| PHP (node-php-runner) | 6 | 1.71× slower |
| Pug | 6 | 2.88× slower |
| Marko | 6 | 6.35× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Teddy (emitted js) | 6 | same |
| Pug | 6 | 1.21× slower |
| Eta | 6 | 1.25× slower |
| Squirrelly | 6 | 1.40× slower |
| doT | 6 | 1.87× slower |
| Marko | 6 | 2.44× slower |
| art-template | 6 | 2.46× slower |
| Dust.js | 6 | 4.01× slower |
| Handlebars | 6 | 5.31× slower |
| Mustache | 6 | 6.28× slower |
| Teddy (tree walk) | 6 | 6.30× slower |
| Lodash template | 6 | 6.56× slower |
| Nunjucks | 6 | 7.25× slower |
| EJS | 6 | 13.90× slower |
| LiquidJS | 6 | 184.77× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 16.73× faster |
| Eta | 6 | 10.87× faster |
| Squirrelly | 6 | 7.45× faster |
| Lodash template | 6 | 5.88× faster |
| art-template | 6 | 3.91× faster |
| EJS | 6 | 3.34× faster |
| Mustache | 6 | 3.10× faster |
| Nunjucks | 6 | 1.79× faster |
| Dust.js | 6 | 1.33× faster |
| Handlebars | 6 | 1.28× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.60× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,231,151 | 8.2e-4 | 0.1 | 1.64× faster | 1,259 |
| Teddy | 2.2.0 | 750,525 | 1.4e-3 | 0.2 | same | 1,258 |
| Eta | 4.6.0 | 631,038 | 1.6e-3 | 0.2 | 1.19× slower | 1,258 |
| Pug | 3.0.4 | 611,226 | 1.7e-3 | 0.2 | 1.23× slower | 1,158 |
| Squirrelly | 9.1.1 | 572,092 | 1.8e-3 | 0.2 | 1.31× slower | 1,258 |
| Marko | 6.3.51 | 538,268 | 1.9e-3 | 0.2 | 1.39× slower | 1,140 |
| doT | 1.1.3 | 392,545 | 2.6e-3 | 0.2 | 1.91× slower | 1,275 |
| Handlebars | 4.7.9 | 350,318 | 2.9e-3 | 0.2 | 2.14× slower | 1,258 |
| Nunjucks | 3.2.4 | 286,709 | 3.5e-3 | 0.2 | 2.62× slower | 1,258 |
| Lodash template | 4.18.1 | 240,344 | 4.2e-3 | 0.1 | 3.12× slower | 1,258 |
| Dust.js | 3.0.1 | 240,163 | 4.2e-3 | 0.2 | 3.13× slower | 1,258 |
| Mustache | 4.2.0 | 161,627 | 6.3e-3 | 0.2 | 4.64× slower | 1,278 |
| EJS | 6.0.1 | 125,972 | 8.0e-3 | 0.1 | 5.96× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 42,701 | 0.024 | 0.3 | 17.58× slower | 1,258 |
| LiquidJS | 10.29.0 | 26,987 | 0.037 | 0.2 | 27.81× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 10,259,131 | 1.0e-4 | 0.2 | 1.45× faster | 478 |
| Eta | 4.6.0 | 9,973,902 | 1.1e-4 | 0.3 | 1.41× faster | 478 |
| art-template | 4.13.4 | 9,926,962 | 1.1e-4 | 0.3 | 1.40× faster | 492 |
| Pug | 3.0.4 | 9,438,538 | 1.1e-4 | 0.5 | 1.33× faster | 410 |
| Teddy | 2.2.0 | 7,080,879 | 1.5e-4 | 0.8 | same | 516 |
| doT | 1.1.3 | 5,285,789 | 2.0e-4 | 0.6 | 1.34× slower | 492 |
| Marko | 6.3.51 | 1,578,948 | 6.7e-4 | 0.9 | 4.48× slower | 392 |
| Nunjucks | 3.2.4 | 1,131,395 | 9.1e-4 | 0.2 | 6.26× slower | 492 |
| Dust.js | 3.0.1 | 926,301 | 1.1e-3 | 0.3 | 7.64× slower | 516 |
| Mustache | 4.2.0 | 521,390 | 2.0e-3 | 0.4 | 13.58× slower | 454 |
| Lodash template | 4.18.1 | 514,058 | 2.0e-3 | 0.1 | 13.77× slower | 492 |
| Handlebars | 4.7.9 | 481,390 | 2.2e-3 | 0.6 | 14.71× slower | 453 |
| EJS | 6.0.1 | 374,434 | 2.8e-3 | 0.5 | 18.91× slower | 492 |
| LiquidJS | 10.29.0 | 65,409 | 0.016 | 0.5 | 108.26× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 64,906 | 0.017 | 0.8 | 109.09× slower | 478 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.2.0 | 295,576 | 3.5e-3 | 0.3 | same | 11,795 |
| art-template | 4.13.4 | 242,273 | 4.3e-3 | 0.3 | 1.22× slower | 11,627 |
| Eta | 4.6.0 | 231,615 | 4.5e-3 | 0.3 | 1.28× slower | 11,425 |
| Pug | 3.0.4 | 201,997 | 5.1e-3 | 0.4 | 1.46× slower | 7,782 |
| Squirrelly | 9.1.1 | 180,343 | 5.7e-3 | 0.2 | 1.64× slower | 11,425 |
| Marko | 6.3.51 | 159,087 | 6.5e-3 | 0.4 | 1.86× slower | 7,474 |
| doT | 1.1.3 | 82,444 | 0.012 | 0.3 | 3.59× slower | 11,627 |
| Handlebars | 4.7.9 | 45,969 | 0.022 | 0.3 | 6.43× slower | 10,121 |
| Dust.js | 3.0.1 | 42,445 | 0.024 | 0.3 | 6.96× slower | 11,627 |
| Lodash template | 4.18.1 | 36,579 | 0.028 | 0.2 | 8.08× slower | 11,627 |
| Mustache | 4.2.0 | 33,539 | 0.030 | 0.3 | 8.81× slower | 10,121 |
| EJS | 6.0.1 | 16,994 | 0.059 | 0.3 | 17.39× slower | 11,627 |
| Nunjucks | 3.2.4 | 16,735 | 0.061 | 0.3 | 17.66× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 11,446 | 0.092 | 0.5 | 25.82× slower | 11,425 |
| LiquidJS | 10.29.0 | 2,615 | 0.386 | 0.4 | 113.03× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.2.0 | 9,905 | 0.105 | 0.7 | same | 238,758 |
| Eta | 4.6.0 | 7,851 | 0.130 | 0.7 | 1.26× slower | 237,757 |
| art-template | 4.13.4 | 7,366 | 0.138 | 0.4 | 1.34× slower | 238,758 |
| Marko | 6.3.51 | 6,904 | 0.147 | 0.5 | 1.43× slower | 156,732 |
| Pug | 3.0.4 | 6,537 | 0.157 | 0.6 | 1.52× slower | 156,734 |
| Squirrelly | 9.1.1 | 6,478 | 0.157 | 0.4 | 1.53× slower | 237,757 |
| doT | 1.1.3 | 2,647 | 0.385 | 0.7 | 3.74× slower | 238,758 |
| Handlebars | 4.7.9 | 2,374 | 0.431 | 0.8 | 4.17× slower | 233,753 |
| Lodash template | 4.18.1 | 1,733 | 0.579 | 0.3 | 5.72× slower | 238,758 |
| Dust.js | 3.0.1 | 1,713 | 0.587 | 0.4 | 5.78× slower | 238,758 |
| Mustache | 4.2.0 | 1,198 | 0.844 | 0.7 | 8.27× slower | 233,753 |
| Nunjucks | 3.2.4 | 1,148 | 0.874 | 0.4 | 8.63× slower | 238,758 |
| EJS | 6.0.1 | 658 | 1.53 | 0.8 | 15.05× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 553 | 1.84 | 1.5 | 17.90× slower | 237,757 |
| LiquidJS | 10.29.0 | 104 | 9.67 | 1.0 | 95.58× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.2.0 | 221,317 | 4.6e-3 | 0.2 | same | 10,958 |
| Pug | 3.0.4 | 149,256 | 6.9e-3 | 0.3 | 1.48× slower | 8,611 |
| Squirrelly | 9.1.1 | 119,416 | 8.6e-3 | 0.3 | 1.85× slower | 10,672 |
| Eta | 4.6.0 | 110,481 | 9.3e-3 | 0.3 | 2.00× slower | 10,672 |
| Marko | 6.3.51 | 109,483 | 9.4e-3 | 0.3 | 2.02× slower | 8,247 |
| doT | 1.1.3 | 65,425 | 0.016 | 0.3 | 3.38× slower | 10,931 |
| Dust.js | 3.0.1 | 34,476 | 0.030 | 0.3 | 6.42× slower | 10,883 |
| Lodash template | 4.18.1 | 21,863 | 0.047 | 0.3 | 10.12× slower | 10,883 |
| Handlebars | 4.7.9 | 20,237 | 0.051 | 0.3 | 10.94× slower | 11,648 |
| Mustache | 4.2.0 | 15,983 | 0.064 | 0.3 | 13.85× slower | 11,708 |
| Nunjucks | 3.2.4 | 9,899 | 0.125 | 12.7 | 22.36× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 7,568 | 0.136 | 1.1 | 29.24× slower | 10,672 |
| EJS | 6.0.1 | 6,182 | 0.163 | 0.2 | 35.80× slower | 10,883 |
| art-template | 4.13.4 | 5,767 | 0.182 | 1.6 | 38.38× slower | 10,883 |
| LiquidJS | 10.29.0 | 2,017 | 0.505 | 0.7 | 109.72× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.2.0 | 147,272 | 7.1e-3 | 0.3 | same | 17,397 |
| Pug | 3.0.4 | 104,668 | 9.7e-3 | 0.2 | 1.41× slower | 11,824 |
| Squirrelly | 9.1.1 | 91,290 | 0.011 | 0.2 | 1.61× slower | 17,067 |
| Eta | 4.6.0 | 86,913 | 0.012 | 0.3 | 1.69× slower | 17,067 |
| Marko | 6.3.51 | 83,305 | 0.012 | 0.2 | 1.77× slower | 11,438 |
| doT | 1.1.3 | 45,060 | 0.023 | 0.2 | 3.27× slower | 17,364 |
| Dust.js | 3.0.1 | 23,941 | 0.042 | 0.2 | 6.15× slower | 17,328 |
| Handlebars | 4.7.9 | 17,495 | 0.058 | 0.3 | 8.42× slower | 18,765 |
| Lodash template | 4.18.1 | 17,252 | 0.058 | 0.2 | 8.54× slower | 17,308 |
| Mustache | 4.2.0 | 12,842 | 0.079 | 0.3 | 11.47× slower | 18,837 |
| Nunjucks | 3.2.4 | 9,360 | 0.126 | 3.5 | 15.73× slower | 17,308 |
| art-template | 4.13.4 | 5,698 | 0.186 | 1.7 | 25.84× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 5,630 | 0.184 | 0.6 | 26.16× slower | 17,067 |
| EJS | 6.0.1 | 5,204 | 0.195 | 0.5 | 28.30× slower | 17,308 |
| LiquidJS | 10.29.0 | 1,482 | 0.681 | 0.7 | 99.39× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 40,804 | 0.025 | 0.3 | 13.21× faster | 1,275 |
| Eta | 4.6.0 | 20,441 | 0.050 | 0.3 | 6.62× faster | 1,258 |
| EJS | 6.0.1 | 18,596 | 0.054 | 0.2 | 6.02× faster | 1,258 |
| Squirrelly | 9.1.1 | 15,514 | 0.066 | 0.3 | 5.02× faster | 1,258 |
| art-template | 4.13.4 | 11,727 | 0.088 | 0.8 | 3.80× faster | 1,259 |
| Mustache | 4.2.0 | 9,262 | 0.109 | 0.2 | 3.00× faster | 1,278 |
| Lodash template | 4.18.1 | 8,187 | 0.130 | 1.8 | 2.65× faster | 1,258 |
| LiquidJS | 10.29.0 | 7,029 | 0.149 | 1.3 | 2.28× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,468 | 0.160 | 0.6 | 2.09× faster | 1,258 |
| Teddy | 2.2.0 | 3,088 | 0.333 | 0.9 | same | 1,258 |
| Handlebars | 4.7.9 | 2,427 | 0.418 | 0.6 | 1.27× slower | 1,258 |
| Dust.js | 3.0.1 | 1,818 | 0.563 | 0.9 | 1.70× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 984 | 1.11 | 1.4 | 3.14× slower | 1,258 |
| Pug | 3.0.4 | 394 | 2.56 | 1.1 | 7.84× slower | 1,158 |
| Marko | 6.3.51 | 301 | 3.56 | 4.3 | 10.27× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 51,677 | 0.020 | 0.4 | 53.61× faster | 492 |
| EJS | 6.0.1 | 24,317 | 0.042 | 0.3 | 25.23× faster | 492 |
| Eta | 4.6.0 | 22,449 | 0.045 | 0.3 | 23.29× faster | 478 |
| Squirrelly | 9.1.1 | 16,186 | 0.063 | 0.4 | 16.79× faster | 478 |
| art-template | 4.13.4 | 16,093 | 0.065 | 0.8 | 16.70× faster | 492 |
| LiquidJS | 10.29.0 | 11,788 | 0.092 | 2.0 | 12.23× faster | 492 |
| Lodash template | 4.18.1 | 8,879 | 0.121 | 1.6 | 9.21× faster | 492 |
| Mustache | 4.2.0 | 8,378 | 0.122 | 0.4 | 8.69× faster | 454 |
| Nunjucks | 3.2.4 | 5,590 | 0.182 | 0.4 | 5.80× faster | 492 |
| Handlebars | 4.7.9 | 2,448 | 0.413 | 0.5 | 2.54× faster | 453 |
| Dust.js | 3.0.1 | 1,813 | 0.557 | 0.6 | 1.88× faster | 516 |
| Teddy | 2.2.0 | 964 | 1.07 | 1.7 | same | 516 |
| PHP (node-php-runner) | 2.0.0 | 908 | 1.15 | 1.2 | 1.06× slower | 478 |
| Pug | 3.0.4 | 709 | 1.42 | 0.7 | 1.36× slower | 410 |
| Marko | 6.3.51 | 183 | 5.75 | 4.4 | 5.27× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 34,188 | 0.030 | 0.3 | 15.96× faster | 11,627 |
| Eta | 4.6.0 | 23,087 | 0.044 | 0.3 | 10.77× faster | 11,425 |
| art-template | 4.13.4 | 21,284 | 0.049 | 0.8 | 9.93× faster | 11,627 |
| Squirrelly | 9.1.1 | 16,477 | 0.062 | 0.4 | 7.69× faster | 11,425 |
| EJS | 6.0.1 | 11,820 | 0.086 | 0.3 | 5.52× faster | 11,627 |
| Mustache | 4.2.0 | 9,034 | 0.112 | 0.3 | 4.22× faster | 10,121 |
| Lodash template | 4.18.1 | 6,516 | 0.162 | 1.5 | 3.04× faster | 11,627 |
| Nunjucks | 3.2.4 | 5,556 | 0.183 | 0.5 | 2.59× faster | 11,627 |
| Handlebars | 4.7.9 | 3,772 | 0.274 | 0.8 | 1.76× faster | 10,121 |
| Dust.js | 3.0.1 | 2,354 | 0.434 | 0.7 | 1.10× faster | 11,627 |
| LiquidJS | 10.29.0 | 2,151 | 0.473 | 0.7 | same | 11,627 |
| Teddy | 2.2.0 | 2,143 | 0.486 | 1.3 | same | 11,795 |
| PHP (node-php-runner) | 2.0.0 | 884 | 1.16 | 1.0 | 2.42× slower | 11,425 |
| Pug | 3.0.4 | 667 | 1.52 | 1.1 | 3.21× slower | 7,782 |
| Marko | 6.3.51 | 383 | 2.81 | 4.5 | 5.59× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Eta | 4.6.0 | 5,877 | 0.174 | 0.6 | 2.59× faster | 237,757 |
| art-template | 4.13.4 | 5,828 | 0.177 | 0.7 | 2.57× faster | 238,758 |
| Squirrelly | 9.1.1 | 4,758 | 0.215 | 0.6 | 2.10× faster | 237,757 |
| doT | 1.1.3 | 2,586 | 0.391 | 0.5 | 1.14× faster | 238,758 |
| Teddy | 2.2.0 | 2,267 | 0.465 | 1.3 | same | 238,758 |
| Handlebars | 4.7.9 | 1,730 | 0.593 | 0.9 | 1.31× slower | 233,753 |
| Mustache | 4.2.0 | 1,215 | 0.834 | 0.8 | 1.87× slower | 233,753 |
| Lodash template | 4.18.1 | 1,124 | 1.33 | 14.5 | 2.02× slower | 238,758 |
| Nunjucks | 3.2.4 | 1,028 | 0.977 | 0.5 | 2.20× slower | 238,758 |
| Dust.js | 3.0.1 | 925 | 1.10 | 0.9 | 2.45× slower | 238,758 |
| Pug | 3.0.4 | 690 | 1.47 | 1.1 | 3.28× slower | 156,734 |
| EJS | 6.0.1 | 647 | 1.56 | 1.0 | 3.50× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 540 | 1.89 | 1.4 | 4.20× slower | 237,757 |
| Marko | 6.3.51 | 479 | 2.24 | 3.6 | 4.73× slower | 156,732 |
| LiquidJS | 10.29.0 | 97.3 | 10.33 | 1.5 | 23.30× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 25,366 | 0.040 | 0.2 | 25.57× faster | 10,931 |
| Eta | 4.6.0 | 22,282 | 0.046 | 0.3 | 22.46× faster | 10,672 |
| Squirrelly | 9.1.1 | 17,824 | 0.057 | 0.4 | 17.97× faster | 10,672 |
| Mustache | 4.2.0 | 5,397 | 0.187 | 0.4 | 5.44× faster | 11,708 |
| Lodash template | 4.18.1 | 4,689 | 0.219 | 1.3 | 4.73× faster | 10,883 |
| Dust.js | 3.0.1 | 2,805 | 0.362 | 0.6 | 2.83× faster | 10,883 |
| Handlebars | 4.7.9 | 1,546 | 0.666 | 1.1 | 1.56× faster | 11,648 |
| EJS | 6.0.1 | 1,278 | 0.790 | 0.6 | 1.29× faster | 10,883 |
| Teddy | 2.2.0 | 992 | 1.05 | 1.7 | same | 10,958 |
| art-template | 4.13.4 | 940 | 1.08 | 1.2 | 1.06× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 687 | 1.48 | 1.1 | 1.44× slower | 10,672 |
| LiquidJS | 10.29.0 | 570 | 1.77 | 0.7 | 1.74× slower | 10,883 |
| Nunjucks | 3.2.4 | 444 | 2.28 | 1.2 | 2.24× slower | 10,883 |
| Pug | 3.0.4 | 356 | 2.82 | 0.7 | 2.79× slower | 8,611 |
| Marko | 6.3.51 | 101 | 10.38 | 4.9 | 9.86× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 16,540 | 0.062 | 0.3 | 48.11× faster | 17,364 |
| Eta | 4.6.0 | 16,117 | 0.064 | 0.4 | 46.88× faster | 17,067 |
| Squirrelly | 9.1.1 | 12,348 | 0.083 | 0.4 | 35.92× faster | 17,067 |
| Mustache | 4.2.0 | 3,754 | 0.269 | 0.4 | 10.92× faster | 18,837 |
| Lodash template | 4.18.1 | 3,360 | 0.307 | 1.1 | 9.77× faster | 17,308 |
| Dust.js | 3.0.1 | 1,418 | 0.714 | 0.7 | 4.12× faster | 17,328 |
| EJS | 6.0.1 | 1,173 | 0.859 | 0.6 | 3.41× faster | 17,308 |
| Handlebars | 4.7.9 | 927 | 1.09 | 0.8 | 2.70× faster | 18,765 |
| art-template | 4.13.4 | 819 | 1.26 | 1.5 | 2.38× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 677 | 1.50 | 1.0 | 1.97× faster | 17,067 |
| Nunjucks | 3.2.4 | 493 | 2.07 | 1.4 | 1.43× faster | 17,308 |
| LiquidJS | 10.29.0 | 467 | 2.17 | 1.1 | 1.36× faster | 17,308 |
| Teddy | 2.2.0 | 344 | 2.96 | 1.9 | same | 17,397 |
| Pug | 3.0.4 | 189 | 5.31 | 0.7 | 1.82× slower | 11,824 |
| Marko | 6.3.51 | 73.8 | 13.94 | 4.4 | 4.66× slower | 11,438 |

## In a browser, cached (chromium)

The same scenarios rendered inside a real browser rather than in Node, timing rendering only. A browser has no filesystem, so every template and partial is handed to the engine up front.

**Teddy is listed twice, and it is the only engine here that is.** Every other engine in this table renders one way: it turns a template into a JavaScript function and calls it. Teddy can do that, and it can also render by walking the node tree its compiler built, without writing any JavaScript at all. Those are two different renderers, not two ways of arriving at the same one, which is why the route changes the number for Teddy and for nobody else. Both rows are real ways to run it, and which one an app gets depends on whether it has a build step:

- **Teddy (emitted js)** is the emitted JavaScript, written out by `teddy.precompile()` in Node and loaded as a script. Faster, and it needs a build step and a known set of templates.
- **Teddy (tree walk)** is what a page gets with no build step at all: drop in the browser build and render. It is also the only thing that can render a template that does not exist until runtime, which is what a live editor or a template fetched from a server needs.

Ratios are against **Teddy (emitted js)**, since that is the like for like against the other engines here, all of which are running a compiled function too.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 1,096,983 | 9.1e-4 | 1.44× faster | 1,259 |
| Pug | ahead of time | 839,339 | 1.2e-3 | 1.10× faster | 1,158 |
| Teddy (emitted js) | ahead of time | 762,686 | 1.3e-3 | same | 1,258 |
| Eta | in page | 742,799 | 1.3e-3 | 1.03× slower | 1,258 |
| Squirrelly | in page | 687,900 | 1.5e-3 | 1.11× slower | 1,258 |
| doT | in page | 539,936 | 1.9e-3 | 1.41× slower | 1,275 |
| Teddy (tree walk) | in page | 415,563 | 2.4e-3 | 1.84× slower | 1,258 |
| Marko | ahead of time | 408,667 | 2.4e-3 | 1.87× slower | 1,140 |
| Handlebars | in page | 398,487 | 2.5e-3 | 1.91× slower | 1,258 |
| Nunjucks | in page | 335,402 | 3.0e-3 | 2.27× slower | 1,258 |
| Dust.js | in page | 305,733 | 3.3e-3 | 2.49× slower | 1,258 |
| Lodash template | in page | 273,663 | 3.7e-3 | 2.79× slower | 1,258 |
| Mustache | in page | 242,250 | 4.1e-3 | 3.15× slower | 1,278 |
| EJS | in page | 142,154 | 7.0e-3 | 5.37× slower | 1,258 |
| LiquidJS | in page | 13,496 | 0.074 | 56.51× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 5,728,117 | 1.7e-4 | 1.39× faster | 492 |
| Eta | in page | 5,545,121 | 1.8e-4 | 1.35× faster | 478 |
| Squirrelly | in page | 5,528,400 | 1.8e-4 | 1.34× faster | 478 |
| Pug | ahead of time | 5,418,078 | 1.8e-4 | 1.32× faster | 410 |
| doT | in page | 4,691,769 | 2.1e-4 | 1.14× faster | 492 |
| Teddy (emitted js) | ahead of time | 4,119,984 | 2.4e-4 | same | 516 |
| Nunjucks | in page | 1,095,636 | 9.1e-4 | 3.76× slower | 492 |
| Dust.js | in page | 972,340 | 1.0e-3 | 4.24× slower | 516 |
| Teddy (tree walk) | in page | 700,295 | 1.4e-3 | 5.88× slower | 516 |
| Marko | ahead of time | 695,418 | 1.4e-3 | 5.92× slower | 392 |
| Mustache | in page | 576,666 | 1.7e-3 | 7.14× slower | 454 |
| Lodash template | in page | 549,410 | 1.8e-3 | 7.50× slower | 492 |
| Handlebars | in page | 518,840 | 1.9e-3 | 7.94× slower | 453 |
| EJS | in page | 395,996 | 2.5e-3 | 10.40× slower | 492 |
| LiquidJS | in page | 30,694 | 0.033 | 134.23× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 326,984 | 3.1e-3 | same | 11,795 |
| art-template | in page | 269,405 | 3.7e-3 | 1.21× slower | 11,627 |
| Eta | in page | 261,489 | 3.8e-3 | 1.25× slower | 11,425 |
| Pug | ahead of time | 216,123 | 4.6e-3 | 1.51× slower | 7,782 |
| Squirrelly | in page | 182,255 | 5.5e-3 | 1.79× slower | 11,425 |
| Marko | ahead of time | 132,702 | 7.5e-3 | 2.46× slower | 7,474 |
| doT | in page | 123,517 | 8.1e-3 | 2.65× slower | 11,627 |
| Dust.js | in page | 63,835 | 0.016 | 5.12× slower | 11,627 |
| Handlebars | in page | 52,571 | 0.019 | 6.22× slower | 10,121 |
| Mustache | in page | 51,360 | 0.019 | 6.37× slower | 10,121 |
| Lodash template | in page | 37,684 | 0.027 | 8.68× slower | 11,627 |
| Nunjucks | in page | 24,858 | 0.040 | 13.15× slower | 11,627 |
| Teddy (tree walk) | in page | 24,370 | 0.041 | 13.42× slower | 11,795 |
| EJS | in page | 18,824 | 0.053 | 17.37× slower | 11,627 |
| LiquidJS | in page | 1,266 | 0.790 | 258.21× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 10,210 | 0.098 | same | 238,758 |
| Eta | in page | 8,321 | 0.120 | 1.23× slower | 237,757 |
| art-template | in page | 7,487 | 0.134 | 1.36× slower | 238,758 |
| Pug | ahead of time | 6,883 | 0.145 | 1.48× slower | 156,734 |
| Squirrelly | in page | 6,561 | 0.152 | 1.56× slower | 237,757 |
| Marko | ahead of time | 6,542 | 0.153 | 1.56× slower | 156,732 |
| doT | in page | 4,033 | 0.248 | 2.53× slower | 238,758 |
| Handlebars | in page | 3,055 | 0.327 | 3.34× slower | 233,753 |
| Dust.js | in page | 2,572 | 0.389 | 3.97× slower | 238,758 |
| Teddy (tree walk) | in page | 1,962 | 0.510 | 5.20× slower | 238,758 |
| Mustache | in page | 1,865 | 0.536 | 5.47× slower | 233,753 |
| Lodash template | in page | 1,845 | 0.542 | 5.53× slower | 238,758 |
| Nunjucks | in page | 1,696 | 0.590 | 6.02× slower | 238,758 |
| EJS | in page | 764 | 1.31 | 13.37× slower | 238,758 |
| LiquidJS | in page | 49.7 | 20.12 | 205.40× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 238,452 | 4.2e-3 | same | 10,958 |
| Pug | ahead of time | 162,348 | 6.2e-3 | 1.47× slower | 8,611 |
| Squirrelly | in page | 127,748 | 7.8e-3 | 1.87× slower | 10,672 |
| Eta | in page | 117,823 | 8.5e-3 | 2.02× slower | 10,672 |
| doT | in page | 100,355 | 1.0e-2 | 2.38× slower | 10,931 |
| Marko | ahead of time | 98,350 | 0.010 | 2.42× slower | 8,247 |
| Dust.js | in page | 52,626 | 0.019 | 4.53× slower | 10,883 |
| Handlebars | in page | 25,465 | 0.039 | 9.36× slower | 11,648 |
| Mustache | in page | 25,314 | 0.040 | 9.42× slower | 11,708 |
| Lodash template | in page | 24,620 | 0.041 | 9.69× slower | 10,883 |
| Teddy (tree walk) | in page | 23,727 | 0.042 | 10.05× slower | 10,958 |
| Nunjucks | in page | 14,233 | 0.070 | 16.75× slower | 10,883 |
| art-template | in page | 11,861 | 0.084 | 20.10× slower | 10,883 |
| EJS | in page | 9,077 | 0.110 | 26.27× slower | 10,883 |
| LiquidJS | in page | 700 | 1.43 | 340.43× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 153,104 | 6.5e-3 | same | 17,397 |
| Pug | ahead of time | 111,707 | 9.0e-3 | 1.37× slower | 11,824 |
| Eta | in page | 94,405 | 0.011 | 1.62× slower | 17,067 |
| Squirrelly | in page | 87,375 | 0.011 | 1.75× slower | 17,067 |
| Marko | ahead of time | 73,985 | 0.014 | 2.07× slower | 11,438 |
| doT | in page | 69,795 | 0.014 | 2.19× slower | 17,364 |
| Dust.js | in page | 35,630 | 0.028 | 4.30× slower | 17,328 |
| Handlebars | in page | 20,311 | 0.049 | 7.54× slower | 18,765 |
| Lodash template | in page | 18,675 | 0.054 | 8.20× slower | 17,308 |
| Teddy (tree walk) | in page | 18,536 | 0.054 | 8.26× slower | 17,397 |
| Mustache | in page | 18,345 | 0.055 | 8.35× slower | 18,837 |
| Nunjucks | in page | 11,996 | 0.083 | 12.76× slower | 17,308 |
| art-template | in page | 11,595 | 0.086 | 13.20× slower | 17,308 |
| EJS | in page | 7,231 | 0.138 | 21.17× slower | 17,308 |
| LiquidJS | in page | 527 | 1.90 | 290.55× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 92,349 | 0.011 | 16.18× faster | 1,275 |
| Eta | 34,580 | 0.029 | 6.06× faster | 1,258 |
| Lodash template | 27,782 | 0.036 | 4.87× faster | 1,258 |
| EJS | 26,907 | 0.037 | 4.71× faster | 1,258 |
| Squirrelly | 23,660 | 0.042 | 4.14× faster | 1,258 |
| Mustache | 13,868 | 0.072 | 2.43× faster | 1,278 |
| art-template | 13,448 | 0.074 | 2.36× faster | 1,259 |
| Nunjucks | 7,300 | 0.137 | 1.28× faster | 1,258 |
| Teddy | 5,709 | 0.175 | same | 1,258 |
| LiquidJS | 5,241 | 0.191 | 1.09× slower | 1,258 |
| Handlebars | 4,285 | 0.233 | 1.33× slower | 1,258 |
| Dust.js | 3,313 | 0.302 | 1.72× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 140,928 | 7.1e-3 | 50.78× faster | 492 |
| Lodash template | 41,551 | 0.024 | 14.97× faster | 492 |
| Eta | 41,362 | 0.024 | 14.91× faster | 478 |
| EJS | 38,568 | 0.026 | 13.90× faster | 492 |
| Squirrelly | 25,836 | 0.039 | 9.31× faster | 478 |
| art-template | 19,596 | 0.051 | 7.06× faster | 492 |
| Mustache | 13,627 | 0.073 | 4.91× faster | 454 |
| Nunjucks | 8,591 | 0.116 | 3.10× faster | 492 |
| LiquidJS | 8,573 | 0.117 | 3.09× faster | 492 |
| Handlebars | 4,167 | 0.240 | 1.50× faster | 453 |
| Dust.js | 3,370 | 0.297 | 1.21× faster | 516 |
| Teddy | 2,775 | 0.360 | same | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 76,030 | 0.013 | 16.94× faster | 11,627 |
| Eta | 41,101 | 0.024 | 9.16× faster | 11,425 |
| art-template | 26,120 | 0.038 | 5.82× faster | 11,627 |
| Squirrelly | 26,005 | 0.038 | 5.79× faster | 11,425 |
| Lodash template | 22,058 | 0.045 | 4.91× faster | 11,627 |
| EJS | 14,634 | 0.068 | 3.26× faster | 11,627 |
| Mustache | 14,580 | 0.069 | 3.25× faster | 10,121 |
| Nunjucks | 7,928 | 0.126 | 1.77× faster | 11,627 |
| Handlebars | 6,511 | 0.154 | 1.45× faster | 10,121 |
| Dust.js | 4,498 | 0.222 | same | 11,627 |
| Teddy | 4,489 | 0.223 | same | 11,795 |
| LiquidJS | 1,112 | 0.900 | 4.04× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 7,127 | 0.140 | 4.54× faster | 237,757 |
| art-template | 6,057 | 0.165 | 3.86× faster | 238,758 |
| Squirrelly | 5,435 | 0.184 | 3.46× faster | 237,757 |
| doT | 3,891 | 0.257 | 2.48× faster | 238,758 |
| Handlebars | 2,289 | 0.437 | 1.46× faster | 233,753 |
| Lodash template | 1,776 | 0.563 | 1.13× faster | 238,758 |
| Dust.js | 1,730 | 0.578 | 1.10× faster | 238,758 |
| Mustache | 1,718 | 0.582 | 1.10× faster | 233,753 |
| Teddy | 1,569 | 0.637 | same | 238,758 |
| Nunjucks | 1,540 | 0.649 | 1.02× slower | 238,758 |
| EJS | 751 | 1.33 | 2.09× slower | 238,758 |
| LiquidJS | 49.2 | 20.32 | 31.89× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 47,164 | 0.021 | 18.55× faster | 10,931 |
| Eta | 38,735 | 0.026 | 15.24× faster | 10,672 |
| Squirrelly | 27,370 | 0.037 | 10.77× faster | 10,672 |
| Lodash template | 17,174 | 0.058 | 6.76× faster | 10,883 |
| Mustache | 8,672 | 0.115 | 3.41× faster | 11,708 |
| EJS | 6,429 | 0.156 | 2.53× faster | 10,883 |
| Dust.js | 5,496 | 0.182 | 2.16× faster | 10,883 |
| art-template | 5,314 | 0.188 | 2.09× faster | 10,883 |
| Nunjucks | 4,048 | 0.247 | 1.59× faster | 10,883 |
| Handlebars | 2,754 | 0.363 | 1.08× faster | 11,648 |
| Teddy | 2,542 | 0.393 | same | 10,958 |
| LiquidJS | 657 | 1.52 | 3.87× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 28,467 | 0.035 | 34.26× faster | 17,364 |
| Eta | 23,893 | 0.042 | 28.76× faster | 17,067 |
| Squirrelly | 17,055 | 0.059 | 20.53× faster | 17,067 |
| Lodash template | 12,513 | 0.080 | 15.06× faster | 17,308 |
| Mustache | 5,132 | 0.195 | 6.18× faster | 18,837 |
| EJS | 4,493 | 0.223 | 5.41× faster | 17,308 |
| art-template | 3,782 | 0.264 | 4.55× faster | 17,308 |
| Dust.js | 2,702 | 0.370 | 3.25× faster | 17,328 |
| Nunjucks | 2,469 | 0.405 | 2.97× faster | 17,308 |
| Handlebars | 1,402 | 0.713 | 1.69× faster | 18,765 |
| Teddy | 831 | 1.20 | same | 17,397 |
| LiquidJS | 472 | 2.12 | 1.76× slower | 17,308 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **Pug**: ships no build that compiles a template in a browser: pug compiles ahead of time, so it is measured that way
- **Marko**: ships no build that compiles a template in a browser: marko compiles ahead of time
- **PHP (node-php-runner)**: not a javascript engine, so there is nothing to run in a browser

## Notes on individual engines

- **Pug**: partials are mixins; pug include is inlined at compile time
- **Mustache**: logic-less: else branches are written as inverted sections
- **Dust.js**: renders through a callback, called before it returns
- **Marko**: ahead-of-time compiler; a .marko file becomes a js module
- **LiquidJS**: output is unescaped by default; escaping is explicit
- **doT**: partials are compile-time definitions, inlined before the render function exists
- **Lodash template**: no include mechanism; partials are passed in as compiled functions
- **PHP (node-php-runner)**: not a javascript engine: the template is PHP, and every render crosses into another process, so a fixed round trip and writing the part of the model the page reads as JSON cost more than running the template does

