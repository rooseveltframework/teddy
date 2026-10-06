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
| Pug | 6 | 1.29× slower |
| Eta | 6 | 1.31× slower |
| Squirrelly | 6 | 1.39× slower |
| Marko | 6 | 1.96× slower |
| doT | 6 | 2.77× slower |
| art-template | 6 | 3.07× slower |
| Dust.js | 6 | 5.94× slower |
| Handlebars | 6 | 6.42× slower |
| Lodash template | 6 | 7.60× slower |
| Mustache | 6 | 9.14× slower |
| Nunjucks | 6 | 9.69× slower |
| EJS | 6 | 17.63× slower |
| PHP (node-php-runner) | 6 | 27.76× slower |
| LiquidJS | 6 | 83.86× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 15.45× faster |
| Eta | 6 | 12.67× faster |
| Squirrelly | 6 | 9.65× faster |
| art-template | 6 | 3.85× faster |
| Mustache | 6 | 3.78× faster |
| Lodash template | 6 | 3.47× faster |
| EJS | 6 | 3.10× faster |
| Handlebars | 6 | 1.48× faster |
| Nunjucks | 6 | 1.44× faster |
| Dust.js | 6 | 1.35× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 1.02× slower |
| PHP (node-php-runner) | 6 | 1.03× slower |
| Pug | 6 | 2.87× slower |
| Marko | 6 | 6.24× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Pug | 6 | 1.31× faster |
| Eta | 6 | 1.26× faster |
| Squirrelly | 6 | 1.13× faster |
| Teddy (emitted js) | 6 | same |
| doT | 6 | 1.19× slower |
| Marko | 6 | 1.55× slower |
| art-template | 6 | 1.56× slower |
| Dust.js | 6 | 2.55× slower |
| Handlebars | 6 | 3.37× slower |
| Mustache | 6 | 3.98× slower |
| Lodash template | 6 | 4.16× slower |
| Teddy (tree walk) | 6 | 4.27× slower |
| Nunjucks | 6 | 4.56× slower |
| EJS | 6 | 8.80× slower |
| LiquidJS | 6 | 116.68× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 15.13× faster |
| Eta | 6 | 9.76× faster |
| Squirrelly | 6 | 6.73× faster |
| Lodash template | 6 | 5.25× faster |
| art-template | 6 | 3.49× faster |
| EJS | 6 | 2.97× faster |
| Mustache | 6 | 2.75× faster |
| Nunjucks | 6 | 1.56× faster |
| Dust.js | 6 | 1.19× faster |
| Handlebars | 6 | 1.13× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.91× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,204,579 | 8.4e-4 | 0.1 | 1.64× faster | 1,259 |
| Teddy | 2.1.0 | 732,766 | 1.4e-3 | 0.2 | same | 1,258 |
| Eta | 4.6.0 | 650,347 | 1.6e-3 | 0.1 | 1.13× slower | 1,258 |
| Pug | 3.0.4 | 613,966 | 1.6e-3 | 0.1 | 1.19× slower | 1,158 |
| Squirrelly | 9.1.1 | 588,569 | 1.7e-3 | 0.1 | 1.24× slower | 1,258 |
| Marko | 6.3.51 | 543,349 | 1.9e-3 | 0.1 | 1.35× slower | 1,140 |
| doT | 1.1.3 | 392,802 | 2.6e-3 | 0.1 | 1.87× slower | 1,275 |
| Handlebars | 4.7.9 | 352,661 | 2.9e-3 | 0.1 | 2.08× slower | 1,258 |
| Nunjucks | 3.2.4 | 296,720 | 3.4e-3 | 0.1 | 2.47× slower | 1,258 |
| Dust.js | 3.0.1 | 239,861 | 4.2e-3 | 0.2 | 3.05× slower | 1,258 |
| Lodash template | 4.18.1 | 230,493 | 4.4e-3 | 0.1 | 3.18× slower | 1,258 |
| Mustache | 4.2.0 | 167,924 | 6.0e-3 | 0.1 | 4.36× slower | 1,278 |
| EJS | 6.0.1 | 124,491 | 8.1e-3 | 0.1 | 5.89× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 45,195 | 0.023 | 0.3 | 16.21× slower | 1,258 |
| LiquidJS | 10.29.0 | 26,928 | 0.038 | 0.2 | 27.21× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 10,206,129 | 1.0e-4 | 0.1 | 1.42× faster | 478 |
| Eta | 4.6.0 | 9,763,368 | 1.1e-4 | 0.2 | 1.36× faster | 478 |
| art-template | 4.13.4 | 9,602,343 | 1.1e-4 | 0.2 | 1.34× faster | 492 |
| Pug | 3.0.4 | 9,131,117 | 1.2e-4 | 0.2 | 1.27× faster | 410 |
| Teddy | 2.1.0 | 7,190,271 | 1.5e-4 | 1.4 | same | 516 |
| doT | 1.1.3 | 4,876,032 | 2.1e-4 | 0.6 | 1.47× slower | 492 |
| Marko | 6.3.51 | 1,700,387 | 6.1e-4 | 0.8 | 4.23× slower | 392 |
| Nunjucks | 3.2.4 | 1,172,069 | 8.6e-4 | 0.1 | 6.13× slower | 492 |
| Dust.js | 3.0.1 | 939,251 | 1.1e-3 | 0.2 | 7.66× slower | 516 |
| Mustache | 4.2.0 | 528,173 | 1.9e-3 | 0.1 | 13.61× slower | 454 |
| Lodash template | 4.18.1 | 514,542 | 2.0e-3 | 0.1 | 13.97× slower | 492 |
| Handlebars | 4.7.9 | 484,384 | 2.1e-3 | 0.2 | 14.84× slower | 453 |
| EJS | 6.0.1 | 378,499 | 2.7e-3 | 0.1 | 19.00× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 69,044 | 0.015 | 0.3 | 104.14× slower | 478 |
| LiquidJS | 10.29.0 | 68,192 | 0.015 | 0.1 | 105.44× slower | 492 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.1.0 | 308,877 | 3.3e-3 | 0.2 | same | 11,795 |
| art-template | 4.13.4 | 237,903 | 4.3e-3 | 0.2 | 1.30× slower | 11,627 |
| Eta | 4.6.0 | 235,893 | 4.4e-3 | 0.3 | 1.31× slower | 11,425 |
| Pug | 3.0.4 | 207,651 | 4.9e-3 | 0.2 | 1.49× slower | 7,782 |
| Squirrelly | 9.1.1 | 180,318 | 5.6e-3 | 0.2 | 1.71× slower | 11,425 |
| Marko | 6.3.51 | 164,121 | 6.2e-3 | 0.2 | 1.88× slower | 7,474 |
| doT | 1.1.3 | 82,019 | 0.012 | 0.2 | 3.77× slower | 11,627 |
| Handlebars | 4.7.9 | 46,963 | 0.022 | 0.2 | 6.58× slower | 10,121 |
| Dust.js | 3.0.1 | 39,214 | 0.026 | 0.1 | 7.88× slower | 11,627 |
| Mustache | 4.2.0 | 38,049 | 0.026 | 0.1 | 8.12× slower | 10,121 |
| Lodash template | 4.18.1 | 36,179 | 0.028 | 0.1 | 8.54× slower | 11,627 |
| Nunjucks | 3.2.4 | 17,613 | 0.057 | 0.2 | 17.54× slower | 11,627 |
| EJS | 6.0.1 | 17,513 | 0.057 | 0.1 | 17.64× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 13,241 | 0.077 | 0.3 | 23.33× slower | 11,425 |
| LiquidJS | 10.29.0 | 2,678 | 0.374 | 0.2 | 115.34× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.1.0 | 10,217 | 0.100 | 0.5 | same | 238,758 |
| Eta | 4.6.0 | 7,967 | 0.127 | 0.3 | 1.28× slower | 237,757 |
| art-template | 4.13.4 | 7,535 | 0.135 | 0.5 | 1.36× slower | 238,758 |
| Marko | 6.3.51 | 6,904 | 0.146 | 0.3 | 1.48× slower | 156,732 |
| Squirrelly | 9.1.1 | 6,538 | 0.154 | 0.3 | 1.56× slower | 237,757 |
| Pug | 3.0.4 | 6,497 | 0.157 | 0.5 | 1.57× slower | 156,734 |
| Handlebars | 4.7.9 | 2,782 | 0.364 | 0.5 | 3.67× slower | 233,753 |
| doT | 1.1.3 | 2,651 | 0.381 | 0.5 | 3.85× slower | 238,758 |
| Lodash template | 4.18.1 | 1,747 | 0.574 | 0.3 | 5.85× slower | 238,758 |
| Dust.js | 3.0.1 | 1,737 | 0.577 | 0.2 | 5.88× slower | 238,758 |
| Mustache | 4.2.0 | 1,374 | 0.731 | 0.4 | 7.44× slower | 233,753 |
| Nunjucks | 3.2.4 | 1,134 | 0.884 | 0.3 | 9.01× slower | 238,758 |
| EJS | 6.0.1 | 684 | 1.46 | 0.4 | 14.94× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 597 | 1.71 | 1.6 | 17.11× slower | 237,757 |
| LiquidJS | 10.29.0 | 103 | 9.71 | 0.7 | 99.13× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.1.0 | 224,083 | 4.5e-3 | 0.2 | same | 10,958 |
| Pug | 3.0.4 | 157,723 | 6.4e-3 | 0.2 | 1.42× slower | 8,611 |
| Squirrelly | 9.1.1 | 124,315 | 8.1e-3 | 0.1 | 1.80× slower | 10,672 |
| Marko | 6.3.51 | 112,811 | 9.0e-3 | 0.2 | 1.99× slower | 8,247 |
| Eta | 4.6.0 | 109,276 | 9.3e-3 | 0.2 | 2.05× slower | 10,672 |
| doT | 1.1.3 | 65,931 | 0.015 | 0.2 | 3.40× slower | 10,931 |
| Dust.js | 3.0.1 | 34,959 | 0.029 | 0.2 | 6.41× slower | 10,883 |
| Lodash template | 4.18.1 | 22,782 | 0.044 | 0.1 | 9.84× slower | 10,883 |
| Handlebars | 4.7.9 | 20,949 | 0.048 | 0.2 | 10.70× slower | 11,648 |
| Mustache | 4.2.0 | 16,145 | 0.062 | 0.1 | 13.88× slower | 11,708 |
| Nunjucks | 3.2.4 | 10,118 | 0.113 | 3.0 | 22.15× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 8,305 | 0.121 | 0.2 | 26.98× slower | 10,672 |
| EJS | 6.0.1 | 6,265 | 0.160 | 0.4 | 35.77× slower | 10,883 |
| art-template | 4.13.4 | 5,802 | 0.180 | 1.4 | 38.62× slower | 10,883 |
| LiquidJS | 10.29.0 | 2,126 | 0.473 | 0.4 | 105.39× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.1.0 | 151,635 | 6.7e-3 | 0.2 | same | 17,397 |
| Pug | 3.0.4 | 104,036 | 9.8e-3 | 0.2 | 1.46× slower | 11,824 |
| Squirrelly | 9.1.1 | 89,137 | 0.011 | 0.2 | 1.70× slower | 17,067 |
| Eta | 4.6.0 | 85,606 | 0.012 | 0.2 | 1.77× slower | 17,067 |
| Marko | 6.3.51 | 84,858 | 0.012 | 0.2 | 1.79× slower | 11,438 |
| doT | 1.1.3 | 45,541 | 0.022 | 0.2 | 3.33× slower | 17,364 |
| Dust.js | 3.0.1 | 24,076 | 0.042 | 0.2 | 6.30× slower | 17,328 |
| Lodash template | 4.18.1 | 17,213 | 0.058 | 0.1 | 8.81× slower | 17,308 |
| Handlebars | 4.7.9 | 17,207 | 0.058 | 0.2 | 8.81× slower | 18,765 |
| Mustache | 4.2.0 | 12,989 | 0.077 | 0.1 | 11.67× slower | 18,837 |
| Nunjucks | 3.2.4 | 9,738 | 0.118 | 3.1 | 15.57× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 6,027 | 0.170 | 0.6 | 25.16× slower | 17,067 |
| art-template | 4.13.4 | 5,654 | 0.183 | 1.3 | 26.82× slower | 17,308 |
| EJS | 6.0.1 | 5,325 | 0.188 | 0.1 | 28.48× slower | 17,308 |
| LiquidJS | 10.29.0 | 1,507 | 0.666 | 0.3 | 100.60× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 41,140 | 0.025 | 0.2 | 13.52× faster | 1,275 |
| Eta | 4.6.0 | 20,737 | 0.048 | 0.2 | 6.82× faster | 1,258 |
| EJS | 6.0.1 | 18,556 | 0.054 | 0.2 | 6.10× faster | 1,258 |
| Squirrelly | 9.1.1 | 15,488 | 0.065 | 0.2 | 5.09× faster | 1,258 |
| art-template | 4.13.4 | 11,969 | 0.086 | 0.9 | 3.93× faster | 1,259 |
| Mustache | 4.2.0 | 9,277 | 0.109 | 0.2 | 3.05× faster | 1,278 |
| Lodash template | 4.18.1 | 8,628 | 0.120 | 1.4 | 2.84× faster | 1,258 |
| LiquidJS | 10.29.0 | 7,061 | 0.147 | 1.0 | 2.32× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,665 | 0.151 | 0.3 | 2.19× faster | 1,258 |
| Teddy | 2.1.0 | 3,042 | 0.341 | 1.1 | same | 1,258 |
| Handlebars | 4.7.9 | 2,503 | 0.403 | 0.4 | 1.22× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 2,316 | 0.876 | 2.3 | 1.31× slower | 1,258 |
| Dust.js | 3.0.1 | 1,878 | 0.534 | 0.3 | 1.62× slower | 1,258 |
| Pug | 3.0.4 | 405 | 2.48 | 0.8 | 7.50× slower | 1,158 |
| Marko | 6.3.51 | 312 | 3.37 | 3.5 | 9.74× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 52,548 | 0.019 | 0.2 | 53.58× faster | 492 |
| EJS | 6.0.1 | 24,837 | 0.041 | 0.2 | 25.32× faster | 492 |
| Eta | 4.6.0 | 23,527 | 0.043 | 0.2 | 23.99× faster | 478 |
| Squirrelly | 9.1.1 | 16,629 | 0.060 | 0.2 | 16.96× faster | 478 |
| art-template | 4.13.4 | 16,478 | 0.062 | 0.6 | 16.80× faster | 492 |
| LiquidJS | 10.29.0 | 12,005 | 0.089 | 1.5 | 12.24× faster | 492 |
| Lodash template | 4.18.1 | 9,509 | 0.109 | 1.5 | 9.70× faster | 492 |
| Mustache | 4.2.0 | 8,454 | 0.119 | 0.3 | 8.62× faster | 454 |
| Nunjucks | 3.2.4 | 5,807 | 0.174 | 0.3 | 5.92× faster | 492 |
| PHP (node-php-runner) | 2.0.0 | 5,427 | 0.642 | 3.3 | 5.53× faster | 478 |
| Handlebars | 4.7.9 | 2,457 | 0.412 | 0.5 | 2.51× faster | 453 |
| Dust.js | 3.0.1 | 1,916 | 0.524 | 0.3 | 1.95× faster | 516 |
| Teddy | 2.1.0 | 981 | 1.04 | 1.4 | same | 516 |
| Pug | 3.0.4 | 724 | 1.39 | 0.5 | 1.35× slower | 410 |
| Marko | 6.3.51 | 196 | 5.30 | 3.4 | 5.01× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 34,805 | 0.029 | 0.1 | 15.29× faster | 11,627 |
| Eta | 4.6.0 | 23,596 | 0.043 | 0.2 | 10.36× faster | 11,425 |
| art-template | 4.13.4 | 20,977 | 0.049 | 0.6 | 9.21× faster | 11,627 |
| Squirrelly | 9.1.1 | 17,071 | 0.059 | 0.3 | 7.50× faster | 11,425 |
| EJS | 6.0.1 | 11,792 | 0.085 | 0.2 | 5.18× faster | 11,627 |
| Mustache | 4.2.0 | 9,065 | 0.111 | 0.1 | 3.98× faster | 10,121 |
| Lodash template | 4.18.1 | 6,930 | 0.149 | 1.1 | 3.04× faster | 11,627 |
| Nunjucks | 3.2.4 | 5,781 | 0.174 | 0.4 | 2.54× faster | 11,627 |
| Handlebars | 4.7.9 | 3,803 | 0.270 | 0.7 | 1.67× faster | 10,121 |
| Dust.js | 3.0.1 | 2,468 | 0.407 | 0.3 | 1.08× faster | 11,627 |
| Teddy | 2.1.0 | 2,277 | 0.449 | 1.0 | same | 11,795 |
| LiquidJS | 10.29.0 | 2,214 | 0.459 | 0.7 | 1.03× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 1,219 | 0.963 | 1.2 | 1.87× slower | 11,425 |
| Pug | 3.0.4 | 717 | 1.40 | 0.5 | 3.18× slower | 7,782 |
| Marko | 6.3.51 | 403 | 2.66 | 4.4 | 5.65× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Eta | 4.6.0 | 5,929 | 0.173 | 0.6 | 2.42× faster | 237,757 |
| art-template | 4.13.4 | 5,895 | 0.174 | 0.6 | 2.40× faster | 238,758 |
| Squirrelly | 9.1.1 | 4,855 | 0.209 | 0.5 | 1.98× faster | 237,757 |
| doT | 1.1.3 | 2,631 | 0.383 | 0.5 | 1.07× faster | 238,758 |
| Teddy | 2.1.0 | 2,452 | 0.420 | 1.0 | same | 238,758 |
| Handlebars | 4.7.9 | 1,814 | 0.557 | 0.6 | 1.35× slower | 233,753 |
| Mustache | 4.2.0 | 1,257 | 0.800 | 0.5 | 1.95× slower | 233,753 |
| Lodash template | 4.18.1 | 1,151 | 1.27 | 13.4 | 2.13× slower | 238,758 |
| Nunjucks | 3.2.4 | 1,036 | 0.968 | 0.3 | 2.37× slower | 238,758 |
| Dust.js | 3.0.1 | 963 | 1.04 | 0.6 | 2.55× slower | 238,758 |
| Pug | 3.0.4 | 741 | 1.36 | 0.6 | 3.31× slower | 156,734 |
| EJS | 6.0.1 | 633 | 1.58 | 0.4 | 3.88× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 534 | 1.91 | 2.2 | 4.59× slower | 237,757 |
| Marko | 6.3.51 | 514 | 2.05 | 3.0 | 4.77× slower | 156,732 |
| LiquidJS | 10.29.0 | 102 | 9.87 | 0.9 | 24.16× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 25,350 | 0.040 | 0.2 | 24.11× faster | 10,931 |
| Eta | 4.6.0 | 23,170 | 0.044 | 0.2 | 22.04× faster | 10,672 |
| Squirrelly | 9.1.1 | 18,447 | 0.054 | 0.2 | 17.54× faster | 10,672 |
| Mustache | 4.2.0 | 5,420 | 0.185 | 0.2 | 5.15× faster | 11,708 |
| Lodash template | 4.18.1 | 4,749 | 0.216 | 1.2 | 4.52× faster | 10,883 |
| Dust.js | 3.0.1 | 2,903 | 0.346 | 0.3 | 2.76× faster | 10,883 |
| Handlebars | 4.7.9 | 1,607 | 0.628 | 0.6 | 1.53× faster | 11,648 |
| EJS | 6.0.1 | 1,327 | 0.754 | 0.2 | 1.26× faster | 10,883 |
| Teddy | 2.1.0 | 1,051 | 0.967 | 1.0 | same | 10,958 |
| art-template | 4.13.4 | 961 | 1.05 | 0.9 | 1.09× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 815 | 1.24 | 0.7 | 1.29× slower | 10,672 |
| LiquidJS | 10.29.0 | 579 | 1.73 | 0.4 | 1.82× slower | 10,883 |
| Nunjucks | 3.2.4 | 461 | 2.18 | 0.6 | 2.28× slower | 10,883 |
| Pug | 3.0.4 | 364 | 2.76 | 0.5 | 2.89× slower | 8,611 |
| Marko | 6.3.51 | 106 | 9.76 | 4.1 | 9.92× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 16,804 | 0.060 | 0.2 | 47.51× faster | 17,364 |
| Eta | 4.6.0 | 16,201 | 0.063 | 0.3 | 45.81× faster | 17,067 |
| Squirrelly | 9.1.1 | 12,701 | 0.079 | 0.2 | 35.91× faster | 17,067 |
| Mustache | 4.2.0 | 3,739 | 0.269 | 0.3 | 10.57× faster | 18,837 |
| Lodash template | 4.18.1 | 3,481 | 0.291 | 0.8 | 9.84× faster | 17,308 |
| Dust.js | 3.0.1 | 1,495 | 0.674 | 0.5 | 4.23× faster | 17,328 |
| EJS | 6.0.1 | 1,203 | 0.833 | 0.3 | 3.40× faster | 17,308 |
| Handlebars | 4.7.9 | 943 | 1.07 | 0.5 | 2.67× faster | 18,765 |
| art-template | 4.13.4 | 856 | 1.19 | 1.1 | 2.42× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 791 | 1.27 | 0.5 | 2.24× faster | 17,067 |
| Nunjucks | 3.2.4 | 525 | 1.92 | 0.9 | 1.48× faster | 17,308 |
| LiquidJS | 10.29.0 | 502 | 1.99 | 0.4 | 1.42× faster | 17,308 |
| Teddy | 2.1.0 | 354 | 2.86 | 1.2 | same | 17,397 |
| Pug | 3.0.4 | 194 | 5.15 | 0.7 | 1.82× slower | 11,824 |
| Marko | 6.3.51 | 78.6 | 12.94 | 3.2 | 4.50× slower | 11,438 |

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
| art-template | in page | 1,116,919 | 9.0e-4 | 2.06× faster | 1,259 |
| Pug | ahead of time | 862,398 | 1.2e-3 | 1.59× faster | 1,158 |
| Eta | in page | 744,133 | 1.3e-3 | 1.37× faster | 1,258 |
| Squirrelly | in page | 686,439 | 1.5e-3 | 1.26× faster | 1,258 |
| doT | in page | 548,351 | 1.8e-3 | 1.01× faster | 1,275 |
| Teddy (emitted js) | ahead of time | 543,503 | 1.8e-3 | same | 1,258 |
| Handlebars | in page | 420,572 | 2.4e-3 | 1.29× slower | 1,258 |
| Marko | ahead of time | 406,656 | 2.5e-3 | 1.34× slower | 1,140 |
| Nunjucks | in page | 338,949 | 3.0e-3 | 1.60× slower | 1,258 |
| Teddy (tree walk) | in page | 338,634 | 3.0e-3 | 1.60× slower | 1,158 |
| Dust.js | in page | 313,367 | 3.2e-3 | 1.73× slower | 1,258 |
| Lodash template | in page | 280,337 | 3.6e-3 | 1.94× slower | 1,258 |
| Mustache | in page | 244,672 | 4.1e-3 | 2.22× slower | 1,278 |
| EJS | in page | 145,491 | 6.9e-3 | 3.74× slower | 1,258 |
| LiquidJS | in page | 13,453 | 0.074 | 40.40× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 5,802,463 | 1.7e-4 | 2.00× faster | 492 |
| Eta | in page | 5,731,135 | 1.7e-4 | 1.98× faster | 478 |
| Squirrelly | in page | 5,659,570 | 1.8e-4 | 1.95× faster | 478 |
| Pug | ahead of time | 5,361,562 | 1.9e-4 | 1.85× faster | 410 |
| doT | in page | 4,747,000 | 2.1e-4 | 1.64× faster | 492 |
| Teddy (emitted js) | ahead of time | 2,899,954 | 3.4e-4 | same | 516 |
| Nunjucks | in page | 1,125,960 | 8.9e-4 | 2.58× slower | 492 |
| Dust.js | in page | 1,001,326 | 1.0e-3 | 2.90× slower | 516 |
| Marko | ahead of time | 733,926 | 1.4e-3 | 3.95× slower | 392 |
| Teddy (tree walk) | in page | 681,331 | 1.5e-3 | 4.26× slower | 410 |
| Mustache | in page | 608,571 | 1.6e-3 | 4.77× slower | 454 |
| Lodash template | in page | 550,392 | 1.8e-3 | 5.27× slower | 492 |
| Handlebars | in page | 477,822 | 2.1e-3 | 6.07× slower | 453 |
| EJS | in page | 408,252 | 2.4e-3 | 7.10× slower | 492 |
| LiquidJS | in page | 31,916 | 0.031 | 90.86× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 276,681 | 3.6e-3 | 1.36× faster | 11,627 |
| Eta | in page | 266,114 | 3.8e-3 | 1.31× faster | 11,425 |
| Pug | ahead of time | 221,572 | 4.5e-3 | 1.09× faster | 7,782 |
| Teddy (emitted js) | ahead of time | 203,907 | 4.9e-3 | same | 11,795 |
| Squirrelly | in page | 188,478 | 5.3e-3 | 1.08× slower | 11,425 |
| Marko | ahead of time | 132,136 | 7.6e-3 | 1.54× slower | 7,474 |
| doT | in page | 131,727 | 7.6e-3 | 1.55× slower | 11,627 |
| Dust.js | in page | 65,463 | 0.015 | 3.11× slower | 11,627 |
| Handlebars | in page | 54,412 | 0.018 | 3.75× slower | 10,121 |
| Mustache | in page | 51,681 | 0.019 | 3.95× slower | 10,121 |
| Lodash template | in page | 39,329 | 0.025 | 5.18× slower | 11,627 |
| Nunjucks | in page | 26,231 | 0.038 | 7.77× slower | 11,627 |
| Teddy (tree walk) | in page | 24,045 | 0.042 | 8.48× slower | 7,782 |
| EJS | in page | 19,346 | 0.052 | 10.54× slower | 11,627 |
| LiquidJS | in page | 1,320 | 0.757 | 154.42× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Eta | in page | 8,329 | 0.120 | 1.21× faster | 237,757 |
| art-template | in page | 7,611 | 0.131 | 1.10× faster | 238,758 |
| Pug | ahead of time | 6,917 | 0.145 | same | 156,734 |
| Teddy (emitted js) | ahead of time | 6,892 | 0.145 | same | 238,758 |
| Squirrelly | in page | 6,639 | 0.151 | 1.04× slower | 237,757 |
| Marko | ahead of time | 6,589 | 0.152 | 1.05× slower | 156,732 |
| doT | in page | 4,080 | 0.245 | 1.69× slower | 238,758 |
| Handlebars | in page | 3,090 | 0.324 | 2.23× slower | 233,753 |
| Dust.js | in page | 2,596 | 0.385 | 2.66× slower | 238,758 |
| Teddy (tree walk) | in page | 2,035 | 0.491 | 3.39× slower | 156,734 |
| Lodash template | in page | 1,883 | 0.531 | 3.66× slower | 238,758 |
| Mustache | in page | 1,877 | 0.533 | 3.67× slower | 233,753 |
| Nunjucks | in page | 1,724 | 0.580 | 4.00× slower | 238,758 |
| EJS | in page | 762 | 1.31 | 9.05× slower | 238,758 |
| LiquidJS | in page | 50.5 | 19.79 | 136.38× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Pug | ahead of time | 167,410 | 6.0e-3 | 1.24× faster | 8,611 |
| Teddy (emitted js) | ahead of time | 134,945 | 7.4e-3 | same | 10,958 |
| Squirrelly | in page | 126,414 | 7.9e-3 | 1.07× slower | 10,672 |
| Eta | in page | 119,547 | 8.4e-3 | 1.13× slower | 10,672 |
| Marko | ahead of time | 101,033 | 9.9e-3 | 1.34× slower | 8,247 |
| doT | in page | 100,065 | 1.0e-2 | 1.35× slower | 10,931 |
| Dust.js | in page | 51,575 | 0.019 | 2.62× slower | 10,883 |
| Handlebars | in page | 25,342 | 0.039 | 5.32× slower | 11,648 |
| Mustache | in page | 25,306 | 0.040 | 5.33× slower | 11,708 |
| Lodash template | in page | 24,444 | 0.041 | 5.52× slower | 10,883 |
| Teddy (tree walk) | in page | 21,934 | 0.046 | 6.15× slower | 8,611 |
| Nunjucks | in page | 14,389 | 0.069 | 9.38× slower | 10,883 |
| art-template | in page | 11,768 | 0.085 | 11.47× slower | 10,883 |
| EJS | in page | 9,075 | 0.110 | 14.87× slower | 10,883 |
| LiquidJS | in page | 699 | 1.43 | 193.17× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Pug | ahead of time | 112,070 | 8.9e-3 | 1.25× faster | 11,824 |
| Eta | in page | 95,484 | 0.010 | 1.06× faster | 17,067 |
| Squirrelly | in page | 93,323 | 0.011 | 1.04× faster | 17,067 |
| Teddy (emitted js) | ahead of time | 89,785 | 0.011 | same | 17,397 |
| Marko | ahead of time | 72,308 | 0.014 | 1.24× slower | 11,438 |
| doT | in page | 68,615 | 0.015 | 1.31× slower | 17,364 |
| Dust.js | in page | 35,767 | 0.028 | 2.51× slower | 17,328 |
| Handlebars | in page | 21,285 | 0.047 | 4.22× slower | 18,765 |
| Lodash template | in page | 18,535 | 0.054 | 4.84× slower | 17,308 |
| Mustache | in page | 18,460 | 0.054 | 4.86× slower | 18,837 |
| Teddy (tree walk) | in page | 17,905 | 0.056 | 5.01× slower | 11,825 |
| Nunjucks | in page | 11,998 | 0.083 | 7.48× slower | 17,308 |
| art-template | in page | 11,486 | 0.087 | 7.82× slower | 17,308 |
| EJS | in page | 7,280 | 0.137 | 12.33× slower | 17,308 |
| LiquidJS | in page | 531 | 1.88 | 169.01× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 93,563 | 0.011 | 14.85× faster | 1,275 |
| Eta | 34,421 | 0.029 | 5.46× faster | 1,258 |
| Lodash template | 28,442 | 0.035 | 4.51× faster | 1,258 |
| EJS | 26,599 | 0.038 | 4.22× faster | 1,258 |
| Squirrelly | 23,495 | 0.043 | 3.73× faster | 1,258 |
| Mustache | 13,660 | 0.073 | 2.17× faster | 1,278 |
| art-template | 13,463 | 0.074 | 2.14× faster | 1,259 |
| Nunjucks | 7,242 | 0.138 | 1.15× faster | 1,258 |
| Teddy | 6,300 | 0.159 | same | 1,158 |
| LiquidJS | 5,268 | 0.190 | 1.20× slower | 1,258 |
| Handlebars | 4,237 | 0.236 | 1.49× slower | 1,258 |
| Dust.js | 3,366 | 0.297 | 1.87× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 143,528 | 7.0e-3 | 40.46× faster | 492 |
| Eta | 42,489 | 0.024 | 11.98× faster | 478 |
| Lodash template | 41,454 | 0.024 | 11.69× faster | 492 |
| EJS | 39,491 | 0.025 | 11.13× faster | 492 |
| Squirrelly | 26,467 | 0.038 | 7.46× faster | 478 |
| art-template | 19,825 | 0.050 | 5.59× faster | 492 |
| Mustache | 13,636 | 0.073 | 3.84× faster | 454 |
| LiquidJS | 8,844 | 0.113 | 2.49× faster | 492 |
| Nunjucks | 8,421 | 0.119 | 2.37× faster | 492 |
| Handlebars | 4,240 | 0.236 | 1.20× faster | 453 |
| Teddy | 3,547 | 0.282 | same | 410 |
| Dust.js | 3,438 | 0.291 | 1.03× slower | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 77,577 | 0.013 | 14.96× faster | 11,627 |
| Eta | 41,856 | 0.024 | 8.07× faster | 11,425 |
| Squirrelly | 27,082 | 0.037 | 5.22× faster | 11,425 |
| art-template | 25,802 | 0.039 | 4.97× faster | 11,627 |
| Lodash template | 22,200 | 0.045 | 4.28× faster | 11,627 |
| EJS | 14,723 | 0.068 | 2.84× faster | 11,627 |
| Mustache | 14,626 | 0.068 | 2.82× faster | 10,121 |
| Nunjucks | 7,946 | 0.126 | 1.53× faster | 11,627 |
| Handlebars | 6,368 | 0.157 | 1.23× faster | 10,121 |
| Teddy | 5,187 | 0.193 | same | 7,782 |
| Dust.js | 4,416 | 0.226 | 1.17× slower | 11,627 |
| LiquidJS | 1,119 | 0.893 | 4.63× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 7,225 | 0.138 | 4.77× faster | 237,757 |
| art-template | 6,120 | 0.163 | 4.04× faster | 238,758 |
| Squirrelly | 5,374 | 0.186 | 3.55× faster | 237,757 |
| doT | 3,935 | 0.254 | 2.60× faster | 238,758 |
| Handlebars | 2,178 | 0.459 | 1.44× faster | 233,753 |
| Lodash template | 1,814 | 0.551 | 1.20× faster | 238,758 |
| Dust.js | 1,740 | 0.575 | 1.15× faster | 238,758 |
| Mustache | 1,685 | 0.593 | 1.11× faster | 233,753 |
| Teddy | 1,515 | 0.660 | same | 156,734 |
| Nunjucks | 1,509 | 0.663 | same | 238,758 |
| EJS | 752 | 1.33 | 2.01× slower | 238,758 |
| LiquidJS | 49.4 | 20.25 | 30.68× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 49,071 | 0.020 | 16.69× faster | 10,931 |
| Eta | 39,355 | 0.025 | 13.38× faster | 10,672 |
| Squirrelly | 28,503 | 0.035 | 9.69× faster | 10,672 |
| Lodash template | 17,473 | 0.057 | 5.94× faster | 10,883 |
| Mustache | 8,823 | 0.113 | 3.00× faster | 11,708 |
| EJS | 6,368 | 0.157 | 2.17× faster | 10,883 |
| Dust.js | 5,535 | 0.181 | 1.88× faster | 10,883 |
| art-template | 5,496 | 0.182 | 1.87× faster | 10,883 |
| Nunjucks | 4,024 | 0.249 | 1.37× faster | 10,883 |
| Teddy | 2,940 | 0.340 | same | 8,611 |
| Handlebars | 2,779 | 0.360 | 1.06× slower | 11,648 |
| LiquidJS | 649 | 1.54 | 4.53× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 29,882 | 0.033 | 30.75× faster | 17,364 |
| Eta | 24,890 | 0.040 | 25.61× faster | 17,067 |
| Squirrelly | 18,013 | 0.056 | 18.54× faster | 17,067 |
| Lodash template | 12,702 | 0.079 | 13.07× faster | 17,308 |
| Mustache | 5,383 | 0.186 | 5.54× faster | 18,837 |
| EJS | 4,663 | 0.214 | 4.80× faster | 17,308 |
| art-template | 3,932 | 0.254 | 4.05× faster | 17,308 |
| Dust.js | 2,840 | 0.352 | 2.92× faster | 17,328 |
| Nunjucks | 2,491 | 0.401 | 2.56× faster | 17,308 |
| Handlebars | 1,497 | 0.668 | 1.54× faster | 18,765 |
| Teddy | 972 | 1.03 | same | 11,825 |
| LiquidJS | 489 | 2.04 | 1.99× slower | 17,308 |
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

