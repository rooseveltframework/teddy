# Templating engine benchmarks

These benchmarks were ran on the following hardware:

| | |
| --- | --- |
| Node | v26.9.0 (V8 14.6.202.34-node.32) |
| Platform | Linux 7.0.0-44-generic x64 |
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
| Eta | 6 | 1.27× slower |
| Pug | 6 | 1.28× slower |
| Squirrelly | 6 | 1.32× slower |
| Marko | 6 | 1.60× slower |
| doT | 6 | 2.61× slower |
| art-template | 6 | 2.97× slower |
| Dust.js | 6 | 5.72× slower |
| Handlebars | 6 | 6.36× slower |
| Lodash template | 6 | 7.24× slower |
| Mustache | 6 | 9.77× slower |
| Nunjucks | 6 | 10.25× slower |
| EJS | 6 | 17.17× slower |
| PHP (node-php-runner) | 6 | 29.59× slower |
| LiquidJS | 6 | 95.16× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 16.05× faster |
| Eta | 6 | 13.26× faster |
| Squirrelly | 6 | 9.99× faster |
| art-template | 6 | 3.95× faster |
| EJS | 6 | 3.94× faster |
| Mustache | 6 | 3.89× faster |
| Lodash template | 6 | 3.48× faster |
| Nunjucks | 6 | 1.49× faster |
| Handlebars | 6 | 1.48× faster |
| Dust.js | 6 | 1.36× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 1.06× slower |
| PHP (node-php-runner) | 6 | 1.64× slower |
| Pug | 6 | 2.82× slower |
| Marko | 6 | 4.72× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Teddy (emitted js) | 6 | same |
| Pug | 6 | 1.21× slower |
| Eta | 6 | 1.30× slower |
| Squirrelly | 6 | 1.42× slower |
| Marko | 6 | 1.66× slower |
| doT | 6 | 1.94× slower |
| art-template | 6 | 2.41× slower |
| Dust.js | 6 | 4.10× slower |
| Handlebars | 6 | 5.42× slower |
| Mustache | 6 | 6.21× slower |
| Lodash template | 6 | 6.44× slower |
| Teddy (tree walk) | 6 | 6.45× slower |
| Nunjucks | 6 | 7.14× slower |
| EJS | 6 | 13.42× slower |
| LiquidJS | 6 | 204.42× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 15.59× faster |
| Eta | 6 | 10.09× faster |
| Squirrelly | 6 | 6.95× faster |
| Lodash template | 6 | 5.50× faster |
| art-template | 6 | 3.84× faster |
| EJS | 6 | 3.74× faster |
| Mustache | 6 | 3.00× faster |
| Nunjucks | 6 | 1.68× faster |
| Dust.js | 6 | 1.29× faster |
| Handlebars | 6 | 1.27× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.84× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,175,270 | 8.9e-4 | 0.2 | 1.57× faster | 1,259 |
| Teddy | 2.3.4 | 748,393 | 1.4e-3 | 0.2 | same | 1,258 |
| Eta | 4.6.0 | 631,566 | 1.6e-3 | 0.2 | 1.18× slower | 1,258 |
| Marko | 6.5.2 | 608,385 | 1.7e-3 | 0.8 | 1.23× slower | 1,140 |
| Squirrelly | 9.1.1 | 570,552 | 1.8e-3 | 0.2 | 1.31× slower | 1,258 |
| Pug | 3.0.4 | 538,210 | 1.9e-3 | 0.1 | 1.39× slower | 1,158 |
| doT | 1.1.3 | 383,986 | 2.7e-3 | 0.2 | 1.95× slower | 1,275 |
| Handlebars | 4.7.10 | 332,102 | 3.1e-3 | 0.2 | 2.25× slower | 1,258 |
| Nunjucks | 3.2.4 | 274,709 | 3.8e-3 | 0.2 | 2.72× slower | 1,258 |
| Dust.js | 3.0.1 | 233,034 | 4.4e-3 | 0.2 | 3.21× slower | 1,258 |
| Lodash template | 4.18.1 | 231,732 | 4.4e-3 | 0.1 | 3.23× slower | 1,258 |
| Mustache | 4.2.0 | 162,689 | 6.3e-3 | 0.1 | 4.60× slower | 1,278 |
| EJS | 7.0.2 | 124,896 | 8.1e-3 | 0.1 | 5.99× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 40,707 | 0.026 | 0.3 | 18.38× slower | 1,258 |
| LiquidJS | 10.30.1 | 22,019 | 0.047 | 0.3 | 33.99× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 10,227,689 | 1.0e-4 | 1.3 | 1.79× faster | 478 |
| Eta | 4.6.0 | 9,667,342 | 1.2e-4 | 2.7 | 1.69× faster | 478 |
| Pug | 3.0.4 | 9,307,725 | 1.2e-4 | 0.3 | 1.63× faster | 410 |
| art-template | 4.13.4 | 9,278,839 | 1.2e-4 | 2.0 | 1.62× faster | 492 |
| Teddy | 2.3.4 | 5,715,628 | 1.8e-4 | 0.2 | same | 516 |
| doT | 1.1.3 | 5,167,755 | 2.0e-4 | 0.7 | 1.11× slower | 492 |
| Marko | 6.5.2 | 2,666,524 | 4.1e-4 | 2.1 | 2.14× slower | 392 |
| Nunjucks | 3.2.4 | 1,072,041 | 9.6e-4 | 0.2 | 5.33× slower | 492 |
| Dust.js | 3.0.1 | 920,491 | 1.1e-3 | 0.2 | 6.21× slower | 516 |
| Lodash template | 4.18.1 | 517,082 | 2.0e-3 | 0.1 | 11.05× slower | 492 |
| Handlebars | 4.7.10 | 471,381 | 2.2e-3 | 0.3 | 12.13× slower | 453 |
| Mustache | 4.2.0 | 383,224 | 2.7e-3 | 0.5 | 14.91× slower | 454 |
| EJS | 7.0.2 | 367,850 | 2.8e-3 | 0.2 | 15.54× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 59,541 | 0.018 | 0.3 | 96.00× slower | 478 |
| LiquidJS | 10.30.1 | 56,009 | 0.018 | 0.2 | 102.05× slower | 492 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.4 | 301,620 | 3.5e-3 | 0.6 | same | 11,795 |
| art-template | 4.13.4 | 239,741 | 4.3e-3 | 0.2 | 1.26× slower | 11,627 |
| Eta | 4.6.0 | 230,770 | 4.5e-3 | 0.2 | 1.31× slower | 11,425 |
| Pug | 3.0.4 | 195,492 | 5.5e-3 | 1.1 | 1.54× slower | 7,782 |
| Squirrelly | 9.1.1 | 180,262 | 5.7e-3 | 0.2 | 1.67× slower | 11,425 |
| Marko | 6.5.2 | 156,595 | 6.6e-3 | 0.3 | 1.93× slower | 7,474 |
| doT | 1.1.3 | 82,695 | 0.012 | 0.2 | 3.65× slower | 11,627 |
| Handlebars | 4.7.10 | 43,406 | 0.024 | 0.3 | 6.95× slower | 10,121 |
| Dust.js | 3.0.1 | 39,356 | 0.026 | 0.3 | 7.66× slower | 11,627 |
| Lodash template | 4.18.1 | 35,593 | 0.029 | 0.2 | 8.47× slower | 11,627 |
| Mustache | 4.2.0 | 33,046 | 0.031 | 0.2 | 9.13× slower | 10,121 |
| EJS | 7.0.2 | 17,067 | 0.060 | 0.6 | 17.67× slower | 11,627 |
| Nunjucks | 3.2.4 | 15,928 | 0.065 | 0.4 | 18.94× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 11,075 | 0.094 | 0.5 | 27.23× slower | 11,425 |
| LiquidJS | 10.30.1 | 2,026 | 0.510 | 0.9 | 148.85× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.4 | 9,407 | 0.111 | 0.6 | same | 238,758 |
| Eta | 4.6.0 | 7,385 | 0.139 | 0.5 | 1.27× slower | 237,757 |
| art-template | 4.13.4 | 7,075 | 0.145 | 0.6 | 1.33× slower | 238,758 |
| Marko | 6.5.2 | 6,968 | 0.145 | 0.4 | 1.35× slower | 156,732 |
| Squirrelly | 9.1.1 | 6,335 | 0.161 | 0.5 | 1.48× slower | 237,757 |
| Pug | 3.0.4 | 6,321 | 0.165 | 0.7 | 1.49× slower | 156,734 |
| doT | 1.1.3 | 2,744 | 0.367 | 0.4 | 3.43× slower | 238,758 |
| Handlebars | 4.7.10 | 2,576 | 0.397 | 0.7 | 3.65× slower | 233,753 |
| Lodash template | 4.18.1 | 1,703 | 0.593 | 0.6 | 5.52× slower | 238,758 |
| Dust.js | 3.0.1 | 1,680 | 0.603 | 0.7 | 5.60× slower | 238,758 |
| Mustache | 4.2.0 | 1,124 | 0.904 | 0.9 | 8.37× slower | 233,753 |
| Nunjucks | 3.2.4 | 773 | 1.31 | 0.8 | 12.17× slower | 238,758 |
| EJS | 7.0.2 | 659 | 1.53 | 0.9 | 14.27× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 576 | 1.78 | 1.8 | 16.33× slower | 237,757 |
| LiquidJS | 10.30.1 | 87.6 | 11.43 | 0.8 | 107.42× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.4 | 215,938 | 4.8e-3 | 0.2 | same | 10,958 |
| Pug | 3.0.4 | 145,379 | 7.2e-3 | 0.3 | 1.49× slower | 8,611 |
| Marko | 6.5.2 | 137,542 | 7.4e-3 | 0.2 | 1.57× slower | 8,247 |
| Squirrelly | 9.1.1 | 123,707 | 8.3e-3 | 0.2 | 1.75× slower | 10,672 |
| Eta | 4.6.0 | 109,834 | 9.4e-3 | 0.3 | 1.97× slower | 10,672 |
| doT | 1.1.3 | 61,758 | 0.017 | 0.3 | 3.50× slower | 10,931 |
| Dust.js | 3.0.1 | 33,525 | 0.030 | 0.2 | 6.44× slower | 10,883 |
| Lodash template | 4.18.1 | 21,778 | 0.047 | 0.2 | 9.92× slower | 10,883 |
| Handlebars | 4.7.10 | 19,661 | 0.052 | 0.3 | 10.98× slower | 11,648 |
| Mustache | 4.2.0 | 15,745 | 0.065 | 0.3 | 13.71× slower | 11,708 |
| Nunjucks | 3.2.4 | 9,483 | 0.123 | 3.4 | 22.77× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 6,943 | 0.149 | 0.5 | 31.10× slower | 10,672 |
| EJS | 7.0.2 | 5,719 | 0.178 | 0.4 | 37.76× slower | 10,883 |
| art-template | 4.13.4 | 5,554 | 0.190 | 1.6 | 38.88× slower | 10,883 |
| LiquidJS | 10.30.1 | 1,826 | 0.555 | 0.6 | 118.26× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.4 | 146,330 | 7.1e-3 | 0.3 | same | 17,397 |
| Pug | 3.0.4 | 97,437 | 0.011 | 0.3 | 1.50× slower | 11,824 |
| Marko | 6.5.2 | 93,647 | 0.011 | 0.2 | 1.56× slower | 11,438 |
| Squirrelly | 9.1.1 | 89,190 | 0.012 | 0.2 | 1.64× slower | 17,067 |
| Eta | 4.6.0 | 81,664 | 0.013 | 0.3 | 1.79× slower | 17,067 |
| doT | 1.1.3 | 43,632 | 0.023 | 0.2 | 3.35× slower | 17,364 |
| Dust.js | 3.0.1 | 23,030 | 0.044 | 0.3 | 6.35× slower | 17,328 |
| Handlebars | 4.7.10 | 16,906 | 0.060 | 0.3 | 8.66× slower | 18,765 |
| Lodash template | 4.18.1 | 16,849 | 0.060 | 0.2 | 8.68× slower | 17,308 |
| Mustache | 4.2.0 | 12,111 | 0.084 | 0.3 | 12.08× slower | 18,837 |
| Nunjucks | 3.2.4 | 9,620 | 0.120 | 3.2 | 15.21× slower | 17,308 |
| art-template | 4.13.4 | 5,402 | 0.194 | 1.5 | 27.09× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 5,327 | 0.192 | 0.4 | 27.47× slower | 17,067 |
| EJS | 7.0.2 | 5,057 | 0.201 | 0.4 | 28.93× slower | 17,308 |
| LiquidJS | 10.30.1 | 1,292 | 0.778 | 0.4 | 113.24× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 40,489 | 0.025 | 0.3 | 13.76× faster | 1,275 |
| EJS | 7.0.2 | 24,279 | 0.042 | 0.2 | 8.25× faster | 1,258 |
| Eta | 4.6.0 | 19,140 | 0.054 | 0.3 | 6.51× faster | 1,258 |
| Squirrelly | 9.1.1 | 15,201 | 0.067 | 0.4 | 5.17× faster | 1,258 |
| art-template | 4.13.4 | 11,481 | 0.090 | 0.7 | 3.90× faster | 1,259 |
| Mustache | 4.2.0 | 8,867 | 0.115 | 0.4 | 3.01× faster | 1,278 |
| Lodash template | 4.18.1 | 8,225 | 0.129 | 1.5 | 2.80× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,508 | 0.156 | 0.4 | 2.21× faster | 1,258 |
| LiquidJS | 10.30.1 | 6,430 | 0.164 | 1.2 | 2.19× faster | 1,258 |
| Teddy | 2.3.4 | 2,941 | 0.354 | 1.2 | same | 1,258 |
| Handlebars | 4.7.10 | 2,300 | 0.444 | 0.7 | 1.28× slower | 1,258 |
| Dust.js | 3.0.1 | 1,647 | 0.621 | 0.8 | 1.79× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 1,005 | 1.10 | 1.3 | 2.93× slower | 1,258 |
| Pug | 3.0.4 | 378 | 2.67 | 1.2 | 7.78× slower | 1,158 |
| Marko | 6.5.2 | 368 | 2.93 | 4.4 | 7.99× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 51,190 | 0.020 | 0.2 | 55.65× faster | 492 |
| EJS | 7.0.2 | 34,543 | 0.029 | 0.2 | 37.55× faster | 492 |
| Eta | 4.6.0 | 22,016 | 0.047 | 0.3 | 23.94× faster | 478 |
| art-template | 4.13.4 | 15,833 | 0.066 | 0.8 | 17.21× faster | 492 |
| Squirrelly | 9.1.1 | 15,720 | 0.065 | 0.3 | 17.09× faster | 478 |
| LiquidJS | 10.30.1 | 10,663 | 0.104 | 1.9 | 11.59× faster | 492 |
| Lodash template | 4.18.1 | 8,302 | 0.131 | 1.6 | 9.03× faster | 492 |
| Mustache | 4.2.0 | 8,137 | 0.125 | 0.4 | 8.85× faster | 454 |
| Nunjucks | 3.2.4 | 5,532 | 0.183 | 0.4 | 6.01× faster | 492 |
| Handlebars | 4.7.10 | 2,288 | 0.445 | 0.7 | 2.49× faster | 453 |
| Dust.js | 3.0.1 | 1,805 | 0.563 | 0.7 | 1.96× faster | 516 |
| Teddy | 2.3.4 | 920 | 1.12 | 1.3 | same | 516 |
| PHP (node-php-runner) | 2.0.0 | 836 | 1.22 | 1.1 | 1.10× slower | 478 |
| Pug | 3.0.4 | 643 | 1.58 | 1.2 | 1.43× slower | 410 |
| Marko | 6.5.2 | 251 | 4.25 | 4.3 | 3.66× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 31,927 | 0.032 | 0.3 | 15.18× faster | 11,627 |
| Eta | 4.6.0 | 22,589 | 0.045 | 0.5 | 10.74× faster | 11,425 |
| art-template | 4.13.4 | 21,019 | 0.049 | 0.6 | 9.99× faster | 11,627 |
| Squirrelly | 9.1.1 | 16,426 | 0.062 | 0.3 | 7.81× faster | 11,425 |
| EJS | 7.0.2 | 12,586 | 0.081 | 0.4 | 5.98× faster | 11,627 |
| Mustache | 4.2.0 | 8,781 | 0.117 | 0.6 | 4.18× faster | 10,121 |
| Lodash template | 4.18.1 | 6,011 | 0.178 | 1.3 | 2.86× faster | 11,627 |
| Nunjucks | 3.2.4 | 5,420 | 0.191 | 0.6 | 2.58× faster | 11,627 |
| Handlebars | 4.7.10 | 3,522 | 0.294 | 0.8 | 1.67× faster | 10,121 |
| Dust.js | 3.0.1 | 2,351 | 0.434 | 0.7 | 1.12× faster | 11,627 |
| Teddy | 2.3.4 | 2,103 | 0.497 | 1.3 | same | 11,795 |
| LiquidJS | 10.30.1 | 1,858 | 0.551 | 0.8 | 1.13× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 1,017 | 1.06 | 1.1 | 2.07× slower | 11,425 |
| Pug | 3.0.4 | 700 | 1.44 | 0.8 | 3.00× slower | 7,782 |
| Marko | 6.5.2 | 498 | 2.16 | 3.7 | 4.23× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Eta | 4.6.0 | 5,918 | 0.172 | 0.5 | 2.72× faster | 237,757 |
| art-template | 4.13.4 | 5,349 | 0.195 | 0.8 | 2.46× faster | 238,758 |
| Squirrelly | 9.1.1 | 4,395 | 0.235 | 0.7 | 2.02× faster | 237,757 |
| doT | 1.1.3 | 2,423 | 0.421 | 0.7 | 1.11× faster | 238,758 |
| Teddy | 2.3.4 | 2,173 | 0.481 | 1.2 | same | 238,758 |
| Handlebars | 4.7.10 | 1,590 | 0.645 | 0.9 | 1.37× slower | 233,753 |
| Lodash template | 4.18.1 | 1,098 | 1.40 | 15.0 | 1.98× slower | 238,758 |
| Mustache | 4.2.0 | 1,073 | 0.954 | 1.1 | 2.03× slower | 233,753 |
| Nunjucks | 3.2.4 | 963 | 1.05 | 0.6 | 2.26× slower | 238,758 |
| Dust.js | 3.0.1 | 913 | 1.10 | 0.6 | 2.38× slower | 238,758 |
| Pug | 3.0.4 | 684 | 1.49 | 1.1 | 3.18× slower | 156,734 |
| EJS | 7.0.2 | 633 | 1.59 | 0.7 | 3.43× slower | 238,758 |
| Marko | 6.5.2 | 552 | 1.93 | 3.4 | 3.94× slower | 156,732 |
| PHP (node-php-runner) | 2.0.0 | 483 | 2.11 | 1.4 | 4.50× slower | 237,757 |
| LiquidJS | 10.30.1 | 87.1 | 11.49 | 0.7 | 24.95× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 24,046 | 0.043 | 0.4 | 25.38× faster | 10,931 |
| Eta | 4.6.0 | 22,001 | 0.047 | 0.3 | 23.22× faster | 10,672 |
| Squirrelly | 9.1.1 | 17,475 | 0.058 | 0.3 | 18.45× faster | 10,672 |
| Mustache | 4.2.0 | 5,381 | 0.188 | 0.4 | 5.68× faster | 11,708 |
| Lodash template | 4.18.1 | 4,253 | 0.248 | 1.3 | 4.49× faster | 10,883 |
| Dust.js | 3.0.1 | 2,687 | 0.378 | 0.5 | 2.84× faster | 10,883 |
| Handlebars | 4.7.10 | 1,534 | 0.664 | 0.8 | 1.62× faster | 11,648 |
| EJS | 7.0.2 | 1,530 | 0.660 | 0.6 | 1.62× faster | 10,883 |
| Teddy | 2.3.4 | 947 | 1.09 | 1.4 | same | 10,958 |
| art-template | 4.13.4 | 870 | 1.18 | 1.3 | 1.09× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 709 | 1.43 | 1.0 | 1.34× slower | 10,672 |
| LiquidJS | 10.30.1 | 541 | 1.86 | 0.7 | 1.75× slower | 10,883 |
| Nunjucks | 3.2.4 | 429 | 2.36 | 1.1 | 2.21× slower | 10,883 |
| Pug | 3.0.4 | 353 | 2.85 | 0.9 | 2.68× slower | 8,611 |
| Marko | 6.5.2 | 132 | 7.85 | 3.8 | 7.18× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 16,636 | 0.061 | 0.3 | 51.88× faster | 17,364 |
| Eta | 4.6.0 | 16,478 | 0.062 | 0.3 | 51.38× faster | 17,067 |
| Squirrelly | 9.1.1 | 12,394 | 0.082 | 0.4 | 38.65× faster | 17,067 |
| Mustache | 4.2.0 | 3,544 | 0.285 | 0.4 | 11.05× faster | 18,837 |
| Lodash template | 4.18.1 | 3,461 | 0.297 | 1.0 | 10.79× faster | 17,308 |
| EJS | 7.0.2 | 1,366 | 0.745 | 0.8 | 4.26× faster | 17,308 |
| Dust.js | 3.0.1 | 1,364 | 0.742 | 0.6 | 4.25× faster | 17,328 |
| Handlebars | 4.7.10 | 886 | 1.15 | 0.9 | 2.76× faster | 18,765 |
| art-template | 4.13.4 | 799 | 1.28 | 1.2 | 2.49× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 663 | 1.52 | 0.9 | 2.07× faster | 17,067 |
| Nunjucks | 3.2.4 | 500 | 2.04 | 1.3 | 1.56× faster | 17,308 |
| LiquidJS | 10.30.1 | 450 | 2.25 | 1.0 | 1.40× faster | 17,308 |
| Teddy | 2.3.4 | 321 | 3.18 | 1.8 | same | 17,397 |
| Pug | 3.0.4 | 183 | 5.52 | 1.5 | 1.75× slower | 11,824 |
| Marko | 6.5.2 | 101 | 10.22 | 3.7 | 3.18× slower | 11,438 |

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
| art-template | in page | 1,076,349 | 9.3e-4 | 1.36× faster | 1,259 |
| Pug | ahead of time | 823,429 | 1.2e-3 | 1.04× faster | 1,158 |
| Teddy (emitted js) | ahead of time | 793,539 | 1.3e-3 | same | 1,258 |
| Eta | in page | 711,931 | 1.4e-3 | 1.11× slower | 1,258 |
| Squirrelly | in page | 691,798 | 1.4e-3 | 1.15× slower | 1,258 |
| Marko | ahead of time | 690,387 | 1.4e-3 | 1.15× slower | 1,140 |
| doT | in page | 519,576 | 1.9e-3 | 1.53× slower | 1,275 |
| Teddy (tree walk) | in page | 392,260 | 2.5e-3 | 2.02× slower | 1,258 |
| Handlebars | in page | 384,076 | 2.6e-3 | 2.07× slower | 1,258 |
| Nunjucks | in page | 347,012 | 2.9e-3 | 2.29× slower | 1,258 |
| Dust.js | in page | 293,159 | 3.4e-3 | 2.71× slower | 1,258 |
| Lodash template | in page | 276,638 | 3.6e-3 | 2.87× slower | 1,258 |
| Mustache | in page | 232,699 | 4.3e-3 | 3.41× slower | 1,278 |
| EJS | in page | 148,837 | 6.7e-3 | 5.33× slower | 1,258 |
| LiquidJS | in page | 12,094 | 0.083 | 65.61× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Squirrelly | in page | 5,632,132 | 1.8e-4 | 1.36× faster | 478 |
| art-template | in page | 5,444,318 | 1.8e-4 | 1.32× faster | 492 |
| Eta | in page | 5,428,086 | 1.8e-4 | 1.31× faster | 478 |
| Pug | ahead of time | 5,098,390 | 2.0e-4 | 1.23× faster | 410 |
| doT | in page | 4,630,723 | 2.2e-4 | 1.12× faster | 492 |
| Teddy (emitted js) | ahead of time | 4,129,507 | 2.4e-4 | same | 516 |
| Marko | ahead of time | 2,366,153 | 4.2e-4 | 1.75× slower | 392 |
| Nunjucks | in page | 1,179,743 | 8.5e-4 | 3.50× slower | 492 |
| Dust.js | in page | 1,005,695 | 9.9e-4 | 4.11× slower | 516 |
| Teddy (tree walk) | in page | 684,952 | 1.5e-3 | 6.03× slower | 516 |
| Mustache | in page | 631,981 | 1.6e-3 | 6.53× slower | 454 |
| Lodash template | in page | 581,080 | 1.7e-3 | 7.11× slower | 492 |
| Handlebars | in page | 506,830 | 2.0e-3 | 8.15× slower | 453 |
| EJS | in page | 408,237 | 2.4e-3 | 10.12× slower | 492 |
| LiquidJS | in page | 27,409 | 0.036 | 150.66× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 320,953 | 3.1e-3 | same | 11,795 |
| art-template | in page | 274,212 | 3.6e-3 | 1.17× slower | 11,627 |
| Eta | in page | 248,832 | 4.0e-3 | 1.29× slower | 11,425 |
| Pug | ahead of time | 216,109 | 4.6e-3 | 1.49× slower | 7,782 |
| Squirrelly | in page | 170,749 | 5.9e-3 | 1.88× slower | 11,425 |
| Marko | ahead of time | 158,355 | 6.3e-3 | 2.03× slower | 7,474 |
| doT | in page | 115,060 | 8.7e-3 | 2.79× slower | 11,627 |
| Dust.js | in page | 61,691 | 0.016 | 5.20× slower | 11,627 |
| Mustache | in page | 49,894 | 0.020 | 6.43× slower | 10,121 |
| Handlebars | in page | 49,638 | 0.020 | 6.47× slower | 10,121 |
| Lodash template | in page | 39,775 | 0.025 | 8.07× slower | 11,627 |
| Teddy (tree walk) | in page | 23,177 | 0.043 | 13.85× slower | 11,795 |
| Nunjucks | in page | 23,145 | 0.043 | 13.87× slower | 11,627 |
| EJS | in page | 19,195 | 0.052 | 16.72× slower | 11,627 |
| LiquidJS | in page | 1,125 | 0.889 | 285.24× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 9,568 | 0.105 | same | 238,758 |
| Eta | in page | 7,573 | 0.132 | 1.26× slower | 237,757 |
| art-template | in page | 7,288 | 0.137 | 1.31× slower | 238,758 |
| Pug | ahead of time | 6,871 | 0.146 | 1.39× slower | 156,734 |
| Marko | ahead of time | 6,470 | 0.155 | 1.48× slower | 156,732 |
| Squirrelly | in page | 5,963 | 0.168 | 1.60× slower | 237,757 |
| doT | in page | 3,626 | 0.276 | 2.64× slower | 238,758 |
| Handlebars | in page | 2,965 | 0.337 | 3.23× slower | 233,753 |
| Dust.js | in page | 2,378 | 0.421 | 4.02× slower | 238,758 |
| Teddy (tree walk) | in page | 1,979 | 0.505 | 4.83× slower | 238,758 |
| Mustache | in page | 1,830 | 0.547 | 5.23× slower | 233,753 |
| Nunjucks | in page | 1,714 | 0.583 | 5.58× slower | 238,758 |
| Lodash template | in page | 1,706 | 0.586 | 5.61× slower | 238,758 |
| EJS | in page | 760 | 1.32 | 12.59× slower | 238,758 |
| LiquidJS | in page | 42.1 | 23.75 | 227.25× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 224,967 | 4.4e-3 | same | 10,958 |
| Pug | ahead of time | 157,945 | 6.3e-3 | 1.42× slower | 8,611 |
| Squirrelly | in page | 124,644 | 8.0e-3 | 1.80× slower | 10,672 |
| Eta | in page | 113,369 | 8.8e-3 | 1.98× slower | 10,672 |
| Marko | ahead of time | 111,747 | 8.9e-3 | 2.01× slower | 8,247 |
| doT | in page | 94,035 | 0.011 | 2.39× slower | 10,931 |
| Dust.js | in page | 50,107 | 0.020 | 4.49× slower | 10,883 |
| Mustache | in page | 24,665 | 0.041 | 9.12× slower | 11,708 |
| Lodash template | in page | 24,569 | 0.041 | 9.16× slower | 10,883 |
| Handlebars | in page | 23,933 | 0.042 | 9.40× slower | 11,648 |
| Teddy (tree walk) | in page | 21,345 | 0.047 | 10.54× slower | 10,958 |
| Nunjucks | in page | 14,182 | 0.071 | 15.86× slower | 10,883 |
| art-template | in page | 12,511 | 0.080 | 17.98× slower | 10,883 |
| EJS | in page | 9,187 | 0.109 | 24.49× slower | 10,883 |
| LiquidJS | in page | 657 | 1.52 | 342.59× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 151,833 | 6.6e-3 | same | 17,397 |
| Pug | ahead of time | 109,475 | 9.1e-3 | 1.39× slower | 11,824 |
| Marko | ahead of time | 87,033 | 0.011 | 1.74× slower | 11,438 |
| Squirrelly | in page | 85,724 | 0.012 | 1.77× slower | 17,067 |
| Eta | in page | 84,912 | 0.012 | 1.79× slower | 17,067 |
| doT | in page | 67,624 | 0.015 | 2.25× slower | 17,364 |
| Dust.js | in page | 33,233 | 0.030 | 4.57× slower | 17,328 |
| Handlebars | in page | 19,718 | 0.051 | 7.70× slower | 18,765 |
| Teddy (tree walk) | in page | 18,227 | 0.055 | 8.33× slower | 17,397 |
| Mustache | in page | 18,029 | 0.055 | 8.42× slower | 18,837 |
| Lodash template | in page | 17,947 | 0.056 | 8.46× slower | 17,308 |
| art-template | in page | 11,886 | 0.084 | 12.77× slower | 17,308 |
| Nunjucks | in page | 11,256 | 0.089 | 13.49× slower | 17,308 |
| EJS | in page | 7,237 | 0.138 | 20.98× slower | 17,308 |
| LiquidJS | in page | 457 | 2.19 | 332.44× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 87,274 | 0.011 | 15.86× faster | 1,275 |
| EJS | 33,942 | 0.029 | 6.17× faster | 1,258 |
| Eta | 31,763 | 0.031 | 5.77× faster | 1,258 |
| Lodash template | 26,103 | 0.038 | 4.74× faster | 1,258 |
| Squirrelly | 22,940 | 0.044 | 4.17× faster | 1,258 |
| Mustache | 14,065 | 0.071 | 2.56× faster | 1,278 |
| art-template | 13,864 | 0.072 | 2.52× faster | 1,259 |
| Nunjucks | 7,185 | 0.139 | 1.31× faster | 1,258 |
| LiquidJS | 5,508 | 0.182 | same | 1,258 |
| Teddy | 5,502 | 0.182 | same | 1,258 |
| Handlebars | 3,928 | 0.255 | 1.40× slower | 1,258 |
| Dust.js | 3,159 | 0.317 | 1.74× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 132,735 | 7.5e-3 | 42.34× faster | 492 |
| EJS | 49,585 | 0.020 | 15.82× faster | 492 |
| Eta | 39,468 | 0.025 | 12.59× faster | 478 |
| Lodash template | 36,953 | 0.027 | 11.79× faster | 492 |
| Squirrelly | 24,822 | 0.040 | 7.92× faster | 478 |
| art-template | 19,411 | 0.052 | 6.19× faster | 492 |
| Mustache | 13,619 | 0.073 | 4.34× faster | 454 |
| LiquidJS | 8,309 | 0.120 | 2.65× faster | 492 |
| Nunjucks | 8,062 | 0.124 | 2.57× faster | 492 |
| Handlebars | 4,176 | 0.239 | 1.33× faster | 453 |
| Dust.js | 3,444 | 0.290 | 1.10× faster | 516 |
| Teddy | 3,135 | 0.319 | same | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 71,132 | 0.014 | 15.49× faster | 11,627 |
| Eta | 39,762 | 0.025 | 8.66× faster | 11,425 |
| art-template | 25,291 | 0.040 | 5.51× faster | 11,627 |
| Squirrelly | 22,294 | 0.045 | 4.86× faster | 11,425 |
| Lodash template | 21,650 | 0.046 | 4.72× faster | 11,627 |
| EJS | 15,731 | 0.064 | 3.43× faster | 11,627 |
| Mustache | 14,015 | 0.071 | 3.05× faster | 10,121 |
| Nunjucks | 7,681 | 0.130 | 1.67× faster | 11,627 |
| Handlebars | 6,694 | 0.149 | 1.46× faster | 10,121 |
| Teddy | 4,591 | 0.218 | same | 11,795 |
| Dust.js | 4,358 | 0.229 | 1.05× slower | 11,627 |
| LiquidJS | 1,027 | 0.974 | 4.47× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 6,498 | 0.154 | 4.19× faster | 237,757 |
| art-template | 6,089 | 0.164 | 3.93× faster | 238,758 |
| Squirrelly | 5,130 | 0.195 | 3.31× faster | 237,757 |
| doT | 3,758 | 0.266 | 2.42× faster | 238,758 |
| Handlebars | 2,208 | 0.453 | 1.42× faster | 233,753 |
| Lodash template | 1,716 | 0.583 | 1.11× faster | 238,758 |
| Dust.js | 1,673 | 0.598 | 1.08× faster | 238,758 |
| Mustache | 1,608 | 0.622 | 1.04× faster | 233,753 |
| Teddy | 1,551 | 0.645 | same | 238,758 |
| Nunjucks | 1,506 | 0.664 | 1.03× slower | 238,758 |
| EJS | 779 | 1.28 | 1.99× slower | 238,758 |
| LiquidJS | 41.6 | 24.05 | 37.31× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 45,538 | 0.022 | 18.72× faster | 10,931 |
| Eta | 35,807 | 0.028 | 14.72× faster | 10,672 |
| Squirrelly | 27,042 | 0.037 | 11.12× faster | 10,672 |
| Lodash template | 16,339 | 0.061 | 6.72× faster | 10,883 |
| Mustache | 8,474 | 0.118 | 3.48× faster | 11,708 |
| EJS | 6,738 | 0.148 | 2.77× faster | 10,883 |
| Dust.js | 5,424 | 0.184 | 2.23× faster | 10,883 |
| art-template | 5,323 | 0.188 | 2.19× faster | 10,883 |
| Nunjucks | 3,726 | 0.268 | 1.53× faster | 10,883 |
| Handlebars | 2,849 | 0.351 | 1.17× faster | 11,648 |
| Teddy | 2,432 | 0.411 | same | 10,958 |
| LiquidJS | 553 | 1.81 | 4.40× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 26,158 | 0.038 | 30.38× faster | 17,364 |
| Eta | 23,441 | 0.043 | 27.22× faster | 17,067 |
| Squirrelly | 16,456 | 0.061 | 19.11× faster | 17,067 |
| Lodash template | 12,193 | 0.082 | 14.16× faster | 17,308 |
| Mustache | 5,170 | 0.193 | 6.00× faster | 18,837 |
| EJS | 5,091 | 0.196 | 5.91× faster | 17,308 |
| art-template | 3,731 | 0.268 | 4.33× faster | 17,308 |
| Dust.js | 2,742 | 0.365 | 3.18× faster | 17,328 |
| Nunjucks | 2,330 | 0.429 | 2.71× faster | 17,308 |
| Handlebars | 1,530 | 0.654 | 1.78× faster | 18,765 |
| Teddy | 861 | 1.16 | same | 17,397 |
| LiquidJS | 454 | 2.20 | 1.90× slower | 17,308 |
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

