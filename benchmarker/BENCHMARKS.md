# Templating engine benchmarks

These benchmarks were ran on the following hardware:

| | |
| --- | --- |
| Node | v24.19.0 (V8 13.6.233.17-node.51) |
| Platform | Linux 7.0.0-34-generic x64 |
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
| Pug | 6 | 1.20× slower |
| Eta | 6 | 1.28× slower |
| Squirrelly | 6 | 1.38× slower |
| Marko | 6 | 1.94× slower |
| doT | 6 | 2.30× slower |
| art-template | 6 | 3.20× slower |
| Dust.js | 6 | 5.21× slower |
| Handlebars | 6 | 6.72× slower |
| Lodash template | 6 | 7.32× slower |
| Nunjucks | 6 | 9.28× slower |
| Mustache | 6 | 10.46× slower |
| EJS | 6 | 17.06× slower |
| PHP (node-php-runner) | 6 | 29.50× slower |
| LiquidJS | 6 | 83.10× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 13.44× faster |
| Eta | 6 | 9.43× faster |
| Squirrelly | 6 | 8.20× faster |
| Mustache | 6 | 3.60× faster |
| art-template | 6 | 3.21× faster |
| Lodash template | 6 | 2.97× faster |
| EJS | 6 | 2.67× faster |
| Dust.js | 6 | 1.57× faster |
| Nunjucks | 6 | 1.38× faster |
| Handlebars | 6 | 1.29× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 1.12× slower |
| PHP (node-php-runner) | 6 | 2.57× slower |
| Pug | 6 | 3.12× slower |
| Marko | 6 | 7.22× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Pug | 6 | 1.30× faster |
| Eta | 6 | 1.23× faster |
| Squirrelly | 6 | 1.13× faster |
| Teddy (emitted js) | 6 | same |
| doT | 6 | 1.20× slower |
| Marko | 6 | 1.56× slower |
| art-template | 6 | 1.57× slower |
| Dust.js | 6 | 2.57× slower |
| Handlebars | 6 | 3.36× slower |
| Mustache | 6 | 4.00× slower |
| Lodash template | 6 | 4.19× slower |
| Teddy (tree walk) | 6 | 4.34× slower |
| Nunjucks | 6 | 4.64× slower |
| EJS | 6 | 8.89× slower |
| LiquidJS | 6 | 119.73× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 14.17× faster |
| Eta | 6 | 9.21× faster |
| Squirrelly | 6 | 6.15× faster |
| Lodash template | 6 | 5.28× faster |
| art-template | 6 | 3.54× faster |
| EJS | 6 | 3.01× faster |
| Mustache | 6 | 2.79× faster |
| Nunjucks | 6 | 1.59× faster |
| Dust.js | 6 | 1.19× faster |
| Handlebars | 6 | 1.16× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.88× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,021,441 | 1.0e-3 | 0.3 | 1.31× faster | 1,259 |
| Pug | 3.0.4 | 832,126 | 1.2e-3 | 0.1 | 1.07× faster | 1,158 |
| Teddy | 2.0.5 | 776,791 | 1.3e-3 | 0.4 | same | 1,258 |
| Eta | 4.6.0 | 613,907 | 1.7e-3 | 0.4 | 1.27× slower | 1,258 |
| Marko | 6.3.51 | 530,497 | 1.9e-3 | 0.2 | 1.46× slower | 1,140 |
| Squirrelly | 9.1.1 | 529,499 | 1.9e-3 | 0.1 | 1.47× slower | 1,258 |
| doT | 1.1.3 | 429,026 | 2.3e-3 | 0.1 | 1.81× slower | 1,275 |
| Handlebars | 4.7.9 | 338,353 | 3.0e-3 | 0.2 | 2.30× slower | 1,258 |
| Nunjucks | 3.2.4 | 285,152 | 3.5e-3 | 0.1 | 2.72× slower | 1,258 |
| Dust.js | 3.0.1 | 274,940 | 3.7e-3 | 0.1 | 2.83× slower | 1,258 |
| Lodash template | 4.18.1 | 227,957 | 4.4e-3 | 0.1 | 3.41× slower | 1,258 |
| Mustache | 4.2.0 | 132,403 | 7.6e-3 | 0.1 | 5.87× slower | 1,278 |
| EJS | 6.0.1 | 121,846 | 8.3e-3 | 0.1 | 6.38× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 39,798 | 0.026 | 0.2 | 19.52× slower | 1,258 |
| LiquidJS | 10.29.0 | 26,447 | 0.038 | 0.2 | 29.37× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 9,561,164 | 1.1e-4 | 1.6 | 1.37× faster | 478 |
| Eta | 4.6.0 | 9,402,076 | 1.1e-4 | 2.0 | 1.35× faster | 478 |
| Pug | 3.0.4 | 9,091,635 | 1.2e-4 | 2.6 | 1.31× faster | 410 |
| art-template | 4.13.4 | 8,484,780 | 1.2e-4 | 1.4 | 1.22× faster | 492 |
| Teddy | 2.0.5 | 6,958,458 | 1.5e-4 | 0.2 | same | 516 |
| doT | 1.1.3 | 5,409,593 | 1.9e-4 | 0.1 | 1.29× slower | 492 |
| Marko | 6.3.51 | 1,686,764 | 6.0e-4 | 0.1 | 4.13× slower | 392 |
| Nunjucks | 3.2.4 | 1,187,645 | 8.5e-4 | 0.1 | 5.86× slower | 492 |
| Dust.js | 3.0.1 | 959,232 | 1.1e-3 | 0.4 | 7.25× slower | 516 |
| Lodash template | 4.18.1 | 522,558 | 1.9e-3 | 0.1 | 13.32× slower | 492 |
| Handlebars | 4.7.9 | 423,965 | 2.4e-3 | 0.2 | 16.41× slower | 453 |
| EJS | 6.0.1 | 372,900 | 2.7e-3 | 0.1 | 18.66× slower | 492 |
| Mustache | 4.2.0 | 275,078 | 3.7e-3 | 0.1 | 25.30× slower | 454 |
| LiquidJS | 10.29.0 | 65,752 | 0.015 | 0.2 | 105.83× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 62,002 | 0.017 | 0.2 | 112.23× slower | 478 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.0.5 | 292,775 | 3.4e-3 | 0.1 | same | 11,795 |
| Eta | 4.6.0 | 227,105 | 4.5e-3 | 0.2 | 1.29× slower | 11,425 |
| art-template | 4.13.4 | 226,986 | 4.5e-3 | 0.2 | 1.29× slower | 11,627 |
| Pug | 3.0.4 | 200,970 | 5.1e-3 | 0.3 | 1.46× slower | 7,782 |
| Squirrelly | 9.1.1 | 178,366 | 5.7e-3 | 0.2 | 1.64× slower | 11,425 |
| Marko | 6.3.51 | 159,472 | 6.3e-3 | 0.1 | 1.84× slower | 7,474 |
| doT | 1.1.3 | 98,551 | 0.010 | 0.3 | 2.97× slower | 11,627 |
| Dust.js | 3.0.1 | 45,058 | 0.022 | 0.1 | 6.50× slower | 11,627 |
| Mustache | 4.2.0 | 41,140 | 0.024 | 0.2 | 7.12× slower | 10,121 |
| Handlebars | 4.7.9 | 41,070 | 0.025 | 0.2 | 7.13× slower | 10,121 |
| Lodash template | 4.18.1 | 36,683 | 0.027 | 0.1 | 7.98× slower | 11,627 |
| EJS | 6.0.1 | 17,218 | 0.058 | 0.1 | 17.00× slower | 11,627 |
| Nunjucks | 3.2.4 | 16,714 | 0.060 | 0.3 | 17.52× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 12,091 | 0.085 | 0.4 | 24.21× slower | 11,425 |
| LiquidJS | 10.29.0 | 2,485 | 0.404 | 0.3 | 117.82× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.0.5 | 9,099 | 0.113 | 0.6 | same | 238,758 |
| art-template | 4.13.4 | 7,628 | 0.134 | 0.6 | 1.19× slower | 238,758 |
| Eta | 4.6.0 | 7,471 | 0.136 | 0.4 | 1.22× slower | 237,757 |
| Marko | 6.3.51 | 6,439 | 0.157 | 0.4 | 1.41× slower | 156,732 |
| Squirrelly | 9.1.1 | 6,304 | 0.160 | 0.3 | 1.44× slower | 237,757 |
| Pug | 3.0.4 | 6,155 | 0.165 | 0.5 | 1.48× slower | 156,734 |
| doT | 1.1.3 | 3,147 | 0.323 | 0.7 | 2.89× slower | 238,758 |
| Handlebars | 4.7.9 | 2,348 | 0.432 | 0.7 | 3.88× slower | 233,753 |
| Dust.js | 3.0.1 | 1,818 | 0.554 | 0.5 | 5.01× slower | 238,758 |
| Lodash template | 4.18.1 | 1,700 | 0.592 | 0.4 | 5.35× slower | 238,758 |
| Mustache | 4.2.0 | 1,501 | 0.669 | 0.4 | 6.06× slower | 233,753 |
| Nunjucks | 3.2.4 | 1,284 | 0.780 | 0.2 | 7.09× slower | 238,758 |
| EJS | 6.0.1 | 683 | 1.47 | 0.5 | 13.33× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 542 | 1.90 | 1.9 | 16.79× slower | 237,757 |
| LiquidJS | 10.29.0 | 100 | 10.05 | 1.8 | 90.97× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.0.5 | 208,155 | 4.9e-3 | 0.2 | same | 10,958 |
| Pug | 3.0.4 | 149,618 | 6.9e-3 | 0.2 | 1.39× slower | 8,611 |
| Squirrelly | 9.1.1 | 118,599 | 8.6e-3 | 0.3 | 1.76× slower | 10,672 |
| Eta | 4.6.0 | 112,236 | 9.1e-3 | 0.2 | 1.85× slower | 10,672 |
| Marko | 6.3.51 | 106,055 | 9.6e-3 | 0.2 | 1.96× slower | 8,247 |
| doT | 1.1.3 | 74,736 | 0.014 | 0.2 | 2.79× slower | 10,931 |
| Dust.js | 3.0.1 | 37,340 | 0.027 | 0.3 | 5.57× slower | 10,883 |
| Lodash template | 4.18.1 | 21,258 | 0.047 | 0.2 | 9.79× slower | 10,883 |
| Handlebars | 4.7.9 | 19,602 | 0.052 | 0.3 | 10.62× slower | 11,648 |
| Mustache | 4.2.0 | 13,552 | 0.075 | 0.3 | 15.36× slower | 11,708 |
| Nunjucks | 3.2.4 | 10,269 | 0.113 | 4.5 | 20.27× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 7,230 | 0.141 | 0.4 | 28.79× slower | 10,672 |
| EJS | 6.0.1 | 6,011 | 0.168 | 0.3 | 34.63× slower | 10,883 |
| art-template | 4.13.4 | 5,031 | 0.208 | 2.0 | 41.37× slower | 10,883 |
| LiquidJS | 10.29.0 | 1,999 | 0.507 | 0.9 | 104.15× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.0.5 | 137,074 | 7.4e-3 | 0.2 | same | 17,397 |
| Pug | 3.0.4 | 98,497 | 0.010 | 0.2 | 1.39× slower | 11,824 |
| Squirrelly | 9.1.1 | 87,136 | 0.012 | 0.4 | 1.57× slower | 17,067 |
| Eta | 4.6.0 | 86,925 | 0.012 | 0.4 | 1.58× slower | 17,067 |
| Marko | 6.3.51 | 79,133 | 0.013 | 0.4 | 1.73× slower | 11,438 |
| doT | 1.1.3 | 52,079 | 0.019 | 0.2 | 2.63× slower | 17,364 |
| Dust.js | 3.0.1 | 25,586 | 0.040 | 0.3 | 5.36× slower | 17,328 |
| Lodash template | 4.18.1 | 16,871 | 0.060 | 0.2 | 8.12× slower | 17,308 |
| Handlebars | 4.7.9 | 16,501 | 0.062 | 0.4 | 8.31× slower | 18,765 |
| Mustache | 4.2.0 | 10,302 | 0.098 | 0.2 | 13.31× slower | 18,837 |
| Nunjucks | 3.2.4 | 8,616 | 0.135 | 4.6 | 15.91× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 5,338 | 0.190 | 0.4 | 25.68× slower | 17,067 |
| EJS | 6.0.1 | 5,185 | 0.194 | 0.2 | 26.44× slower | 17,308 |
| art-template | 4.13.4 | 5,056 | 0.206 | 1.7 | 27.11× slower | 17,308 |
| LiquidJS | 10.29.0 | 1,444 | 0.699 | 0.6 | 94.92× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 38,310 | 0.026 | 0.1 | 10.23× faster | 1,275 |
| EJS | 6.0.1 | 17,409 | 0.058 | 0.2 | 4.65× faster | 1,258 |
| Eta | 4.6.0 | 17,095 | 0.059 | 0.1 | 4.57× faster | 1,258 |
| Squirrelly | 9.1.1 | 14,825 | 0.068 | 0.3 | 3.96× faster | 1,258 |
| art-template | 4.13.4 | 10,931 | 0.093 | 0.6 | 2.92× faster | 1,259 |
| Mustache | 4.2.0 | 9,905 | 0.102 | 0.2 | 2.65× faster | 1,278 |
| Lodash template | 4.18.1 | 8,237 | 0.124 | 1.0 | 2.20× faster | 1,258 |
| LiquidJS | 10.29.0 | 7,736 | 0.135 | 1.1 | 2.07× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,112 | 0.165 | 0.3 | 1.63× faster | 1,258 |
| Teddy | 2.0.5 | 3,744 | 0.275 | 1.1 | same | 1,258 |
| Handlebars | 4.7.9 | 2,644 | 0.385 | 0.7 | 1.42× slower | 1,258 |
| Dust.js | 3.0.1 | 2,632 | 0.383 | 0.4 | 1.42× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 689 | 1.49 | 1.5 | 5.44× slower | 1,258 |
| Pug | 3.0.4 | 419 | 2.40 | 0.7 | 8.94× slower | 1,158 |
| Marko | 6.3.51 | 307 | 3.65 | 8.8 | 12.18× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 46,942 | 0.022 | 0.2 | 42.81× faster | 492 |
| EJS | 6.0.1 | 23,103 | 0.044 | 0.2 | 21.07× faster | 492 |
| Eta | 4.6.0 | 18,995 | 0.053 | 0.2 | 17.32× faster | 478 |
| Squirrelly | 9.1.1 | 16,142 | 0.062 | 0.2 | 14.72× faster | 478 |
| art-template | 4.13.4 | 15,163 | 0.067 | 0.5 | 13.83× faster | 492 |
| LiquidJS | 10.29.0 | 12,539 | 0.086 | 1.9 | 11.44× faster | 492 |
| Mustache | 4.2.0 | 9,669 | 0.105 | 0.3 | 8.82× faster | 454 |
| Lodash template | 4.18.1 | 8,831 | 0.116 | 1.0 | 8.05× faster | 492 |
| Nunjucks | 3.2.4 | 7,459 | 0.135 | 0.3 | 6.80× faster | 492 |
| Dust.js | 3.0.1 | 2,620 | 0.385 | 0.4 | 2.39× faster | 516 |
| Handlebars | 4.7.9 | 2,585 | 0.393 | 0.7 | 2.36× faster | 453 |
| Teddy | 2.0.5 | 1,096 | 0.935 | 1.3 | same | 516 |
| Pug | 3.0.4 | 706 | 1.43 | 0.7 | 1.55× slower | 410 |
| PHP (node-php-runner) | 2.0.0 | 687 | 1.49 | 1.5 | 1.60× slower | 478 |
| Marko | 6.3.51 | 187 | 5.74 | 5.6 | 5.88× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 34,847 | 0.029 | 0.2 | 13.23× faster | 11,627 |
| art-template | 4.13.4 | 20,575 | 0.049 | 0.4 | 7.81× faster | 11,627 |
| Eta | 4.6.0 | 19,156 | 0.053 | 0.2 | 7.27× faster | 11,425 |
| Squirrelly | 9.1.1 | 16,568 | 0.061 | 0.2 | 6.29× faster | 11,425 |
| EJS | 6.0.1 | 11,756 | 0.085 | 0.2 | 4.46× faster | 11,627 |
| Mustache | 4.2.0 | 10,409 | 0.097 | 0.2 | 3.95× faster | 10,121 |
| Lodash template | 4.18.1 | 6,726 | 0.152 | 0.9 | 2.55× faster | 11,627 |
| Nunjucks | 3.2.4 | 6,372 | 0.159 | 0.3 | 2.42× faster | 11,627 |
| Handlebars | 4.7.9 | 3,838 | 0.268 | 0.9 | 1.46× faster | 10,121 |
| Dust.js | 3.0.1 | 3,270 | 0.308 | 0.4 | 1.24× faster | 11,627 |
| Teddy | 2.0.5 | 2,633 | 0.390 | 1.1 | same | 11,795 |
| LiquidJS | 10.29.0 | 2,156 | 0.469 | 0.5 | 1.22× slower | 11,627 |
| Pug | 3.0.4 | 781 | 1.29 | 0.6 | 3.37× slower | 7,782 |
| PHP (node-php-runner) | 2.0.0 | 675 | 1.51 | 1.4 | 3.90× slower | 11,425 |
| Marko | 6.3.51 | 396 | 2.76 | 7.6 | 6.65× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 5,782 | 0.177 | 0.7 | 2.19× faster | 238,758 |
| Eta | 4.6.0 | 5,226 | 0.195 | 0.6 | 1.98× faster | 237,757 |
| Squirrelly | 9.1.1 | 4,481 | 0.230 | 0.7 | 1.70× faster | 237,757 |
| doT | 1.1.3 | 2,950 | 0.344 | 0.6 | 1.12× faster | 238,758 |
| Teddy | 2.0.5 | 2,636 | 0.391 | 1.2 | same | 238,758 |
| Handlebars | 4.7.9 | 1,531 | 0.663 | 0.8 | 1.72× slower | 233,753 |
| Mustache | 4.2.0 | 1,321 | 0.765 | 0.7 | 2.00× slower | 233,753 |
| Lodash template | 4.18.1 | 1,147 | 1.17 | 14.9 | 2.30× slower | 238,758 |
| Nunjucks | 3.2.4 | 1,092 | 0.919 | 0.4 | 2.41× slower | 238,758 |
| Dust.js | 3.0.1 | 1,039 | 0.973 | 0.7 | 2.54× slower | 238,758 |
| Pug | 3.0.4 | 772 | 1.31 | 0.8 | 3.42× slower | 156,734 |
| EJS | 6.0.1 | 676 | 1.48 | 0.2 | 3.90× slower | 238,758 |
| Marko | 6.3.51 | 484 | 2.18 | 3.7 | 5.45× slower | 156,732 |
| PHP (node-php-runner) | 2.0.0 | 425 | 2.40 | 1.7 | 6.20× slower | 237,757 |
| LiquidJS | 10.29.0 | 97.1 | 10.36 | 1.9 | 27.15× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 24,225 | 0.042 | 0.3 | 21.50× faster | 10,931 |
| Eta | 4.6.0 | 19,186 | 0.053 | 0.2 | 17.03× faster | 10,672 |
| Squirrelly | 9.1.1 | 17,620 | 0.057 | 0.2 | 15.64× faster | 10,672 |
| Mustache | 4.2.0 | 5,581 | 0.181 | 0.3 | 4.95× faster | 11,708 |
| Lodash template | 4.18.1 | 4,406 | 0.232 | 0.8 | 3.91× faster | 10,883 |
| Dust.js | 3.0.1 | 3,725 | 0.272 | 0.5 | 3.31× faster | 10,883 |
| Handlebars | 4.7.9 | 1,590 | 0.641 | 0.9 | 1.41× faster | 11,648 |
| EJS | 6.0.1 | 1,254 | 0.800 | 0.3 | 1.11× faster | 10,883 |
| Teddy | 2.0.5 | 1,127 | 0.915 | 1.5 | same | 10,958 |
| art-template | 4.13.4 | 878 | 1.16 | 1.1 | 1.28× slower | 10,883 |
| LiquidJS | 10.29.0 | 589 | 1.71 | 0.6 | 1.91× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 578 | 1.76 | 1.4 | 1.95× slower | 10,672 |
| Nunjucks | 3.2.4 | 538 | 1.88 | 1.1 | 2.09× slower | 10,883 |
| Pug | 3.0.4 | 360 | 2.81 | 1.3 | 3.13× slower | 8,611 |
| Marko | 6.3.51 | 104 | 10.02 | 4.8 | 10.86× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 16,060 | 0.064 | 0.4 | 42.30× faster | 17,364 |
| Eta | 4.6.0 | 13,786 | 0.074 | 0.3 | 36.31× faster | 17,067 |
| Squirrelly | 9.1.1 | 11,852 | 0.086 | 0.3 | 31.21× faster | 17,067 |
| Mustache | 4.2.0 | 3,641 | 0.279 | 0.5 | 9.59× faster | 18,837 |
| Lodash template | 4.18.1 | 3,403 | 0.298 | 0.8 | 8.96× faster | 17,308 |
| Dust.js | 3.0.1 | 2,054 | 0.492 | 0.5 | 5.41× faster | 17,328 |
| EJS | 6.0.1 | 1,105 | 0.907 | 0.3 | 2.91× faster | 17,308 |
| Handlebars | 4.7.9 | 900 | 1.13 | 1.0 | 2.37× faster | 18,765 |
| art-template | 4.13.4 | 767 | 1.33 | 1.3 | 2.02× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 535 | 1.91 | 1.5 | 1.41× faster | 17,067 |
| LiquidJS | 10.29.0 | 519 | 1.93 | 0.6 | 1.37× faster | 17,308 |
| Nunjucks | 3.2.4 | 489 | 2.07 | 1.1 | 1.29× faster | 17,308 |
| Teddy | 2.0.5 | 380 | 2.69 | 1.7 | same | 17,397 |
| Pug | 3.0.4 | 205 | 4.90 | 0.6 | 1.86× slower | 11,824 |
| Marko | 6.3.51 | 75.8 | 14.23 | 10.7 | 5.01× slower | 11,438 |

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
| art-template | in page | 1,116,119 | 9.0e-4 | 2.08× faster | 1,259 |
| Pug | ahead of time | 836,930 | 1.2e-3 | 1.56× faster | 1,158 |
| Eta | in page | 741,376 | 1.3e-3 | 1.38× faster | 1,258 |
| Squirrelly | in page | 698,065 | 1.4e-3 | 1.30× faster | 1,258 |
| doT | in page | 547,704 | 1.8e-3 | 1.02× faster | 1,275 |
| Teddy (emitted js) | ahead of time | 536,695 | 1.9e-3 | same | 1,258 |
| Handlebars | in page | 416,067 | 2.4e-3 | 1.29× slower | 1,258 |
| Marko | ahead of time | 406,791 | 2.5e-3 | 1.32× slower | 1,140 |
| Nunjucks | in page | 338,705 | 3.0e-3 | 1.58× slower | 1,258 |
| Teddy (tree walk) | in page | 331,239 | 3.0e-3 | 1.62× slower | 1,158 |
| Dust.js | in page | 318,567 | 3.1e-3 | 1.68× slower | 1,258 |
| Lodash template | in page | 278,153 | 3.6e-3 | 1.93× slower | 1,258 |
| Mustache | in page | 247,356 | 4.0e-3 | 2.17× slower | 1,278 |
| EJS | in page | 143,065 | 7.0e-3 | 3.75× slower | 1,258 |
| LiquidJS | in page | 13,902 | 0.072 | 38.61× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 5,752,111 | 1.7e-4 | 1.81× faster | 492 |
| Eta | in page | 5,638,284 | 1.8e-4 | 1.77× faster | 478 |
| Squirrelly | in page | 5,607,290 | 1.8e-4 | 1.76× faster | 478 |
| Pug | ahead of time | 5,514,342 | 1.8e-4 | 1.73× faster | 410 |
| doT | in page | 4,788,837 | 2.1e-4 | 1.51× faster | 492 |
| Teddy (emitted js) | ahead of time | 3,180,708 | 3.1e-4 | same | 516 |
| Nunjucks | in page | 1,123,724 | 8.9e-4 | 2.83× slower | 492 |
| Dust.js | in page | 1,010,562 | 9.9e-4 | 3.15× slower | 516 |
| Marko | ahead of time | 701,561 | 1.4e-3 | 4.53× slower | 392 |
| Teddy (tree walk) | in page | 691,981 | 1.4e-3 | 4.60× slower | 410 |
| Mustache | in page | 609,854 | 1.6e-3 | 5.22× slower | 454 |
| Handlebars | in page | 536,128 | 1.9e-3 | 5.93× slower | 453 |
| Lodash template | in page | 533,266 | 1.9e-3 | 5.96× slower | 492 |
| EJS | in page | 402,213 | 2.5e-3 | 7.91× slower | 492 |
| LiquidJS | in page | 29,160 | 0.034 | 109.08× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 272,548 | 3.7e-3 | 1.32× faster | 11,627 |
| Eta | in page | 261,651 | 3.8e-3 | 1.27× faster | 11,425 |
| Pug | ahead of time | 222,993 | 4.5e-3 | 1.08× faster | 7,782 |
| Teddy (emitted js) | ahead of time | 205,870 | 4.9e-3 | same | 11,795 |
| Squirrelly | in page | 184,867 | 5.4e-3 | 1.11× slower | 11,425 |
| Marko | ahead of time | 126,711 | 7.9e-3 | 1.62× slower | 7,474 |
| doT | in page | 124,925 | 8.0e-3 | 1.65× slower | 11,627 |
| Dust.js | in page | 65,234 | 0.015 | 3.16× slower | 11,627 |
| Handlebars | in page | 53,324 | 0.019 | 3.86× slower | 10,121 |
| Mustache | in page | 50,737 | 0.020 | 4.06× slower | 10,121 |
| Lodash template | in page | 39,455 | 0.025 | 5.22× slower | 11,627 |
| Nunjucks | in page | 25,478 | 0.039 | 8.08× slower | 11,627 |
| Teddy (tree walk) | in page | 23,147 | 0.043 | 8.89× slower | 7,782 |
| EJS | in page | 19,094 | 0.052 | 10.78× slower | 11,627 |
| LiquidJS | in page | 1,282 | 0.780 | 160.60× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Eta | in page | 8,063 | 0.124 | 1.19× faster | 237,757 |
| art-template | in page | 7,438 | 0.134 | 1.10× faster | 238,758 |
| Pug | ahead of time | 6,970 | 0.143 | 1.03× faster | 156,734 |
| Teddy (emitted js) | ahead of time | 6,763 | 0.148 | same | 238,758 |
| Marko | ahead of time | 6,662 | 0.150 | 1.02× slower | 156,732 |
| Squirrelly | in page | 6,501 | 0.154 | 1.04× slower | 237,757 |
| doT | in page | 3,949 | 0.253 | 1.71× slower | 238,758 |
| Handlebars | in page | 2,965 | 0.337 | 2.28× slower | 233,753 |
| Dust.js | in page | 2,548 | 0.392 | 2.65× slower | 238,758 |
| Teddy (tree walk) | in page | 1,969 | 0.508 | 3.43× slower | 156,734 |
| Mustache | in page | 1,867 | 0.536 | 3.62× slower | 233,753 |
| Lodash template | in page | 1,845 | 0.542 | 3.66× slower | 238,758 |
| Nunjucks | in page | 1,621 | 0.617 | 4.17× slower | 238,758 |
| EJS | in page | 750 | 1.33 | 9.01× slower | 238,758 |
| LiquidJS | in page | 48.1 | 20.81 | 140.74× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Pug | ahead of time | 165,706 | 6.0e-3 | 1.31× faster | 8,611 |
| Squirrelly | in page | 127,084 | 7.9e-3 | same | 10,672 |
| Teddy (emitted js) | ahead of time | 126,718 | 7.9e-3 | same | 10,958 |
| Eta | in page | 111,184 | 9.0e-3 | 1.14× slower | 10,672 |
| Marko | ahead of time | 105,589 | 9.5e-3 | 1.20× slower | 8,247 |
| doT | in page | 100,878 | 9.9e-3 | 1.26× slower | 10,931 |
| Dust.js | in page | 52,078 | 0.019 | 2.43× slower | 10,883 |
| Lodash template | in page | 24,686 | 0.041 | 5.13× slower | 10,883 |
| Handlebars | in page | 24,669 | 0.041 | 5.14× slower | 11,648 |
| Mustache | in page | 24,364 | 0.041 | 5.20× slower | 11,708 |
| Teddy (tree walk) | in page | 21,669 | 0.046 | 5.85× slower | 8,611 |
| Nunjucks | in page | 14,453 | 0.069 | 8.77× slower | 10,883 |
| art-template | in page | 11,988 | 0.083 | 10.57× slower | 10,883 |
| EJS | in page | 9,048 | 0.111 | 14.00× slower | 10,883 |
| LiquidJS | in page | 694 | 1.44 | 182.59× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Pug | ahead of time | 110,487 | 9.1e-3 | 1.24× faster | 11,824 |
| Eta | in page | 94,251 | 0.011 | 1.05× faster | 17,067 |
| Squirrelly | in page | 92,307 | 0.011 | 1.03× faster | 17,067 |
| Teddy (emitted js) | ahead of time | 89,429 | 0.011 | same | 17,397 |
| Marko | ahead of time | 73,585 | 0.014 | 1.22× slower | 11,438 |
| doT | in page | 69,506 | 0.014 | 1.29× slower | 17,364 |
| Dust.js | in page | 33,446 | 0.030 | 2.67× slower | 17,328 |
| Handlebars | in page | 21,412 | 0.047 | 4.18× slower | 18,765 |
| Mustache | in page | 18,801 | 0.053 | 4.76× slower | 18,837 |
| Lodash template | in page | 18,707 | 0.053 | 4.78× slower | 17,308 |
| Teddy (tree walk) | in page | 17,751 | 0.056 | 5.04× slower | 11,825 |
| Nunjucks | in page | 11,944 | 0.084 | 7.49× slower | 17,308 |
| art-template | in page | 11,578 | 0.086 | 7.72× slower | 17,308 |
| EJS | in page | 7,324 | 0.137 | 12.21× slower | 17,308 |
| LiquidJS | in page | 528 | 1.90 | 169.49× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 93,358 | 0.011 | 15.01× faster | 1,275 |
| Eta | 34,779 | 0.029 | 5.59× faster | 1,258 |
| Lodash template | 27,965 | 0.036 | 4.50× faster | 1,258 |
| EJS | 27,211 | 0.037 | 4.38× faster | 1,258 |
| Squirrelly | 22,984 | 0.044 | 3.70× faster | 1,258 |
| Mustache | 13,912 | 0.072 | 2.24× faster | 1,278 |
| art-template | 13,648 | 0.073 | 2.19× faster | 1,259 |
| Nunjucks | 7,355 | 0.136 | 1.18× faster | 1,258 |
| Teddy | 6,218 | 0.161 | same | 1,158 |
| LiquidJS | 5,314 | 0.188 | 1.17× slower | 1,258 |
| Handlebars | 4,324 | 0.231 | 1.44× slower | 1,258 |
| Dust.js | 3,357 | 0.298 | 1.85× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 141,271 | 7.1e-3 | 40.33× faster | 492 |
| Lodash template | 41,276 | 0.024 | 11.78× faster | 492 |
| EJS | 38,708 | 0.026 | 11.05× faster | 492 |
| Eta | 27,577 | 0.036 | 7.87× faster | 478 |
| Squirrelly | 20,676 | 0.048 | 5.90× faster | 478 |
| art-template | 19,557 | 0.051 | 5.58× faster | 492 |
| Mustache | 13,809 | 0.072 | 3.94× faster | 454 |
| LiquidJS | 8,468 | 0.118 | 2.42× faster | 492 |
| Nunjucks | 8,231 | 0.121 | 2.35× faster | 492 |
| Handlebars | 4,271 | 0.234 | 1.22× faster | 453 |
| Teddy | 3,503 | 0.285 | same | 410 |
| Dust.js | 3,404 | 0.294 | 1.03× slower | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 77,042 | 0.013 | 14.97× faster | 11,627 |
| Eta | 41,574 | 0.024 | 8.08× faster | 11,425 |
| Squirrelly | 26,397 | 0.038 | 5.13× faster | 11,425 |
| art-template | 25,929 | 0.039 | 5.04× faster | 11,627 |
| Lodash template | 22,416 | 0.045 | 4.36× faster | 11,627 |
| EJS | 14,798 | 0.068 | 2.88× faster | 11,627 |
| Mustache | 14,206 | 0.070 | 2.76× faster | 10,121 |
| Nunjucks | 8,066 | 0.124 | 1.57× faster | 11,627 |
| Handlebars | 6,645 | 0.150 | 1.29× faster | 10,121 |
| Teddy | 5,145 | 0.194 | same | 7,782 |
| Dust.js | 4,377 | 0.228 | 1.18× slower | 11,627 |
| LiquidJS | 1,150 | 0.869 | 4.47× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 7,145 | 0.140 | 4.85× faster | 237,757 |
| art-template | 6,299 | 0.159 | 4.28× faster | 238,758 |
| Squirrelly | 5,418 | 0.185 | 3.68× faster | 237,757 |
| doT | 3,873 | 0.258 | 2.63× faster | 238,758 |
| Handlebars | 2,231 | 0.448 | 1.51× faster | 233,753 |
| Lodash template | 1,798 | 0.556 | 1.22× faster | 238,758 |
| Mustache | 1,720 | 0.581 | 1.17× faster | 233,753 |
| Dust.js | 1,700 | 0.588 | 1.15× faster | 238,758 |
| Nunjucks | 1,520 | 0.658 | 1.03× faster | 238,758 |
| Teddy | 1,473 | 0.679 | same | 156,734 |
| EJS | 754 | 1.33 | 1.96× slower | 238,758 |
| LiquidJS | 48.7 | 20.51 | 30.23× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 39,327 | 0.025 | 13.03× faster | 10,672 |
| doT | 33,726 | 0.030 | 11.17× faster | 10,931 |
| Squirrelly | 20,334 | 0.049 | 6.74× faster | 10,672 |
| Lodash template | 17,107 | 0.058 | 5.67× faster | 10,883 |
| Mustache | 8,632 | 0.116 | 2.86× faster | 11,708 |
| EJS | 6,201 | 0.161 | 2.05× faster | 10,883 |
| Dust.js | 5,491 | 0.182 | 1.82× faster | 10,883 |
| art-template | 5,394 | 0.185 | 1.79× faster | 10,883 |
| Nunjucks | 4,003 | 0.250 | 1.33× faster | 10,883 |
| Teddy | 3,019 | 0.331 | same | 8,611 |
| Handlebars | 2,824 | 0.354 | 1.07× slower | 11,648 |
| LiquidJS | 660 | 1.52 | 4.58× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 27,889 | 0.036 | 30.39× faster | 17,364 |
| Eta | 24,894 | 0.040 | 27.13× faster | 17,067 |
| Squirrelly | 17,976 | 0.056 | 19.59× faster | 17,067 |
| Lodash template | 12,396 | 0.081 | 13.51× faster | 17,308 |
| Mustache | 5,304 | 0.189 | 5.78× faster | 18,837 |
| EJS | 4,652 | 0.215 | 5.07× faster | 17,308 |
| art-template | 3,845 | 0.260 | 4.19× faster | 17,308 |
| Dust.js | 2,847 | 0.351 | 3.10× faster | 17,328 |
| Nunjucks | 2,473 | 0.404 | 2.69× faster | 17,308 |
| Handlebars | 1,477 | 0.677 | 1.61× faster | 18,765 |
| Teddy | 918 | 1.09 | same | 11,825 |
| LiquidJS | 478 | 2.09 | 1.92× slower | 17,308 |
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

