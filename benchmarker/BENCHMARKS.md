# Templating engine benchmarks

These benchmarks were ran on the following hardware:

| | |
| --- | --- |
| Node | v26.9.0 (V8 14.6.202.34-node.32) |
| Platform | Linux 7.0.0-42-generic x64 |
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
| Squirrelly | 6 | 1.35× slower |
| Marko | 6 | 1.96× slower |
| doT | 6 | 2.64× slower |
| art-template | 6 | 2.99× slower |
| Dust.js | 6 | 5.80× slower |
| Handlebars | 6 | 6.64× slower |
| Lodash template | 6 | 7.45× slower |
| Mustache | 6 | 9.51× slower |
| Nunjucks | 6 | 9.64× slower |
| EJS | 6 | 17.43× slower |
| PHP (node-php-runner) | 6 | 29.05× slower |
| LiquidJS | 6 | 84.13× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 15.56× faster |
| Eta | 6 | 12.86× faster |
| Squirrelly | 6 | 9.57× faster |
| art-template | 6 | 3.86× faster |
| Mustache | 6 | 3.77× faster |
| Lodash template | 6 | 3.43× faster |
| EJS | 6 | 3.14× faster |
| Handlebars | 6 | 1.46× faster |
| Nunjucks | 6 | 1.44× faster |
| Dust.js | 6 | 1.36× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 1.02× slower |
| PHP (node-php-runner) | 6 | 1.46× slower |
| Pug | 6 | 2.87× slower |
| Marko | 6 | 6.23× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Teddy (emitted js) | 6 | same |
| Pug | 6 | 1.23× slower |
| Eta | 6 | 1.30× slower |
| Squirrelly | 6 | 1.42× slower |
| doT | 6 | 1.89× slower |
| Marko | 6 | 2.52× slower |
| art-template | 6 | 2.52× slower |
| Dust.js | 6 | 4.09× slower |
| Handlebars | 6 | 5.37× slower |
| Mustache | 6 | 6.37× slower |
| Teddy (tree walk) | 6 | 6.49× slower |
| Lodash template | 6 | 6.64× slower |
| Nunjucks | 6 | 7.38× slower |
| EJS | 6 | 14.16× slower |
| LiquidJS | 6 | 189.32× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 16.36× faster |
| Eta | 6 | 10.54× faster |
| Squirrelly | 6 | 7.23× faster |
| Lodash template | 6 | 5.71× faster |
| art-template | 6 | 3.74× faster |
| EJS | 6 | 3.23× faster |
| Mustache | 6 | 3.01× faster |
| Nunjucks | 6 | 1.70× faster |
| Dust.js | 6 | 1.28× faster |
| Handlebars | 6 | 1.26× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.70× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,207,613 | 8.5e-4 | 0.2 | 1.57× faster | 1,259 |
| Teddy | 2.3.1 | 767,780 | 1.3e-3 | 0.4 | same | 1,258 |
| Eta | 4.6.0 | 639,268 | 1.6e-3 | 0.2 | 1.20× slower | 1,258 |
| Pug | 3.0.4 | 610,212 | 1.7e-3 | 0.3 | 1.26× slower | 1,158 |
| Squirrelly | 9.1.1 | 571,365 | 1.8e-3 | 0.2 | 1.34× slower | 1,258 |
| Marko | 6.3.51 | 533,872 | 1.9e-3 | 0.1 | 1.44× slower | 1,140 |
| doT | 1.1.3 | 403,449 | 2.5e-3 | 0.2 | 1.90× slower | 1,275 |
| Handlebars | 4.7.9 | 346,106 | 2.9e-3 | 0.1 | 2.22× slower | 1,258 |
| Nunjucks | 3.2.4 | 298,021 | 3.4e-3 | 0.1 | 2.58× slower | 1,258 |
| Lodash template | 4.18.1 | 236,112 | 4.3e-3 | 0.1 | 3.25× slower | 1,258 |
| Dust.js | 3.0.1 | 235,553 | 4.3e-3 | 0.1 | 3.26× slower | 1,258 |
| Mustache | 4.2.0 | 139,812 | 7.2e-3 | 0.2 | 5.49× slower | 1,278 |
| EJS | 6.0.1 | 125,481 | 8.0e-3 | 0.1 | 6.12× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 44,339 | 0.024 | 0.6 | 17.32× slower | 1,258 |
| LiquidJS | 10.29.0 | 26,330 | 0.039 | 0.2 | 29.16× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 10,640,478 | 9.9e-5 | 2.0 | 1.66× faster | 478 |
| art-template | 4.13.4 | 10,024,746 | 1.1e-4 | 1.9 | 1.57× faster | 492 |
| Eta | 4.6.0 | 9,718,553 | 1.1e-4 | 2.8 | 1.52× faster | 478 |
| Pug | 3.0.4 | 9,581,933 | 1.1e-4 | 0.3 | 1.50× faster | 410 |
| Teddy | 2.3.1 | 6,400,447 | 1.6e-4 | 1.1 | same | 516 |
| doT | 1.1.3 | 5,250,311 | 2.0e-4 | 1.3 | 1.22× slower | 492 |
| Marko | 6.3.51 | 1,722,888 | 5.9e-4 | 0.2 | 3.71× slower | 392 |
| Nunjucks | 3.2.4 | 1,155,820 | 8.7e-4 | 0.1 | 5.54× slower | 492 |
| Dust.js | 3.0.1 | 943,027 | 1.1e-3 | 0.2 | 6.79× slower | 516 |
| Mustache | 4.2.0 | 541,574 | 1.9e-3 | 0.1 | 11.82× slower | 454 |
| Lodash template | 4.18.1 | 505,502 | 2.0e-3 | 0.1 | 12.66× slower | 492 |
| Handlebars | 4.7.9 | 439,794 | 2.3e-3 | 0.3 | 14.55× slower | 453 |
| EJS | 6.0.1 | 373,489 | 2.7e-3 | 0.2 | 17.14× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 68,015 | 0.015 | 0.3 | 94.10× slower | 478 |
| LiquidJS | 10.29.0 | 65,231 | 0.016 | 0.2 | 98.12× slower | 492 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.1 | 307,571 | 3.3e-3 | 0.2 | same | 11,795 |
| art-template | 4.13.4 | 241,497 | 4.2e-3 | 0.2 | 1.27× slower | 11,627 |
| Eta | 4.6.0 | 233,092 | 4.4e-3 | 0.2 | 1.32× slower | 11,425 |
| Pug | 3.0.4 | 208,790 | 4.9e-3 | 0.2 | 1.47× slower | 7,782 |
| Squirrelly | 9.1.1 | 180,414 | 5.6e-3 | 0.2 | 1.70× slower | 11,425 |
| Marko | 6.3.51 | 162,154 | 6.3e-3 | 0.2 | 1.90× slower | 7,474 |
| doT | 1.1.3 | 84,627 | 0.012 | 0.2 | 3.63× slower | 11,627 |
| Handlebars | 4.7.9 | 43,016 | 0.024 | 0.2 | 7.15× slower | 10,121 |
| Dust.js | 3.0.1 | 42,661 | 0.024 | 0.2 | 7.21× slower | 11,627 |
| Lodash template | 4.18.1 | 37,286 | 0.027 | 0.1 | 8.25× slower | 11,627 |
| Mustache | 4.2.0 | 34,926 | 0.029 | 0.3 | 8.81× slower | 10,121 |
| EJS | 6.0.1 | 17,423 | 0.058 | 0.2 | 17.65× slower | 11,627 |
| Nunjucks | 3.2.4 | 17,024 | 0.059 | 0.2 | 18.07× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 11,649 | 0.088 | 0.3 | 26.40× slower | 11,425 |
| LiquidJS | 10.29.0 | 2,655 | 0.378 | 0.3 | 115.85× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.1 | 10,130 | 0.102 | 0.6 | same | 238,758 |
| Eta | 4.6.0 | 7,931 | 0.128 | 0.3 | 1.28× slower | 237,757 |
| art-template | 4.13.4 | 7,443 | 0.137 | 0.5 | 1.36× slower | 238,758 |
| Marko | 6.3.51 | 6,717 | 0.151 | 0.4 | 1.51× slower | 156,732 |
| Squirrelly | 9.1.1 | 6,662 | 0.151 | 0.3 | 1.52× slower | 237,757 |
| Pug | 3.0.4 | 6,593 | 0.155 | 0.6 | 1.54× slower | 156,734 |
| doT | 1.1.3 | 2,741 | 0.368 | 0.4 | 3.70× slower | 238,758 |
| Handlebars | 4.7.9 | 2,512 | 0.403 | 0.6 | 4.03× slower | 233,753 |
| Lodash template | 4.18.1 | 1,748 | 0.574 | 0.3 | 5.80× slower | 238,758 |
| Dust.js | 3.0.1 | 1,743 | 0.575 | 0.2 | 5.81× slower | 238,758 |
| Mustache | 4.2.0 | 1,369 | 0.734 | 0.4 | 7.40× slower | 233,753 |
| Nunjucks | 3.2.4 | 1,116 | 0.898 | 0.3 | 9.07× slower | 238,758 |
| EJS | 6.0.1 | 679 | 1.47 | 0.2 | 14.93× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 529 | 1.94 | 1.6 | 19.16× slower | 237,757 |
| LiquidJS | 10.29.0 | 104 | 9.65 | 0.8 | 97.63× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.1 | 224,247 | 4.6e-3 | 0.2 | same | 10,958 |
| Pug | 3.0.4 | 149,881 | 7.0e-3 | 1.1 | 1.50× slower | 8,611 |
| Squirrelly | 9.1.1 | 125,394 | 8.1e-3 | 0.2 | 1.79× slower | 10,672 |
| Marko | 6.3.51 | 111,999 | 9.1e-3 | 0.3 | 2.00× slower | 8,247 |
| Eta | 4.6.0 | 110,390 | 9.3e-3 | 0.3 | 2.03× slower | 10,672 |
| doT | 1.1.3 | 66,376 | 0.015 | 0.2 | 3.38× slower | 10,931 |
| Dust.js | 3.0.1 | 34,187 | 0.030 | 0.2 | 6.56× slower | 10,883 |
| Lodash template | 4.18.1 | 22,543 | 0.045 | 0.1 | 9.95× slower | 10,883 |
| Handlebars | 4.7.9 | 20,778 | 0.049 | 0.2 | 10.79× slower | 11,648 |
| Mustache | 4.2.0 | 16,256 | 0.062 | 0.2 | 13.79× slower | 11,708 |
| Nunjucks | 3.2.4 | 10,178 | 0.113 | 3.3 | 22.03× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 7,754 | 0.131 | 0.3 | 28.92× slower | 10,672 |
| EJS | 6.0.1 | 6,307 | 0.159 | 0.2 | 35.56× slower | 10,883 |
| art-template | 4.13.4 | 5,825 | 0.178 | 1.4 | 38.49× slower | 10,883 |
| LiquidJS | 10.29.0 | 2,101 | 0.482 | 1.3 | 106.71× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.1 | 150,827 | 6.8e-3 | 0.3 | same | 17,397 |
| Pug | 3.0.4 | 103,411 | 9.8e-3 | 0.2 | 1.46× slower | 11,824 |
| Squirrelly | 9.1.1 | 91,539 | 0.011 | 0.2 | 1.65× slower | 17,067 |
| Eta | 4.6.0 | 87,017 | 0.012 | 0.2 | 1.73× slower | 17,067 |
| Marko | 6.3.51 | 81,471 | 0.013 | 0.2 | 1.85× slower | 11,438 |
| doT | 1.1.3 | 46,398 | 0.022 | 0.2 | 3.25× slower | 17,364 |
| Dust.js | 3.0.1 | 24,030 | 0.042 | 0.2 | 6.28× slower | 17,328 |
| Handlebars | 4.7.9 | 17,613 | 0.057 | 0.2 | 8.56× slower | 18,765 |
| Lodash template | 4.18.1 | 17,326 | 0.058 | 0.2 | 8.71× slower | 17,308 |
| Mustache | 4.2.0 | 11,890 | 0.085 | 0.2 | 12.68× slower | 18,837 |
| Nunjucks | 3.2.4 | 9,659 | 0.119 | 3.2 | 15.61× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 5,983 | 0.169 | 0.4 | 25.21× slower | 17,067 |
| art-template | 4.13.4 | 5,745 | 0.181 | 1.4 | 26.25× slower | 17,308 |
| EJS | 6.0.1 | 5,291 | 0.189 | 0.2 | 28.51× slower | 17,308 |
| LiquidJS | 10.29.0 | 1,469 | 0.685 | 0.4 | 102.68× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 41,752 | 0.024 | 0.2 | 13.90× faster | 1,275 |
| Eta | 4.6.0 | 20,673 | 0.049 | 0.2 | 6.88× faster | 1,258 |
| EJS | 6.0.1 | 18,434 | 0.055 | 0.3 | 6.14× faster | 1,258 |
| Squirrelly | 9.1.1 | 15,472 | 0.065 | 0.2 | 5.15× faster | 1,258 |
| art-template | 4.13.4 | 11,855 | 0.087 | 0.6 | 3.95× faster | 1,259 |
| Mustache | 4.2.0 | 9,128 | 0.111 | 0.3 | 3.04× faster | 1,278 |
| Lodash template | 4.18.1 | 8,557 | 0.121 | 1.3 | 2.85× faster | 1,258 |
| LiquidJS | 10.29.0 | 7,017 | 0.148 | 1.1 | 2.34× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,568 | 0.154 | 0.3 | 2.19× faster | 1,258 |
| Teddy | 2.3.1 | 3,003 | 0.343 | 1.0 | same | 1,258 |
| Handlebars | 4.7.9 | 2,484 | 0.410 | 0.7 | 1.21× slower | 1,258 |
| Dust.js | 3.0.1 | 1,871 | 0.536 | 0.3 | 1.60× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 1,231 | 0.985 | 1.2 | 2.44× slower | 1,258 |
| Pug | 3.0.4 | 398 | 2.52 | 0.7 | 7.54× slower | 1,158 |
| Marko | 6.3.51 | 307 | 3.49 | 4.3 | 9.78× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 52,366 | 0.019 | 0.2 | 52.20× faster | 492 |
| EJS | 6.0.1 | 25,241 | 0.040 | 0.2 | 25.16× faster | 492 |
| Eta | 4.6.0 | 23,346 | 0.043 | 0.2 | 23.27× faster | 478 |
| art-template | 4.13.4 | 16,603 | 0.062 | 0.6 | 16.55× faster | 492 |
| Squirrelly | 9.1.1 | 16,468 | 0.061 | 0.4 | 16.42× faster | 478 |
| LiquidJS | 10.29.0 | 12,033 | 0.088 | 1.4 | 12.00× faster | 492 |
| Lodash template | 4.18.1 | 9,197 | 0.114 | 1.3 | 9.17× faster | 492 |
| Mustache | 4.2.0 | 8,446 | 0.120 | 0.4 | 8.42× faster | 454 |
| Nunjucks | 3.2.4 | 5,771 | 0.175 | 0.3 | 5.75× faster | 492 |
| Handlebars | 4.7.9 | 2,455 | 0.415 | 0.7 | 2.45× faster | 453 |
| Dust.js | 3.0.1 | 1,897 | 0.532 | 0.5 | 1.89× faster | 516 |
| PHP (node-php-runner) | 2.0.0 | 1,762 | 0.936 | 2.1 | 1.76× faster | 478 |
| Teddy | 2.3.1 | 1,003 | 1.01 | 1.0 | same | 516 |
| Pug | 3.0.4 | 722 | 1.39 | 0.5 | 1.39× slower | 410 |
| Marko | 6.3.51 | 194 | 5.38 | 3.7 | 5.17× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 34,748 | 0.029 | 0.2 | 15.26× faster | 11,627 |
| Eta | 4.6.0 | 23,661 | 0.043 | 0.2 | 10.39× faster | 11,425 |
| art-template | 4.13.4 | 21,877 | 0.047 | 0.7 | 9.61× faster | 11,627 |
| Squirrelly | 9.1.1 | 16,586 | 0.061 | 0.3 | 7.28× faster | 11,425 |
| EJS | 6.0.1 | 11,894 | 0.084 | 0.2 | 5.22× faster | 11,627 |
| Mustache | 4.2.0 | 9,017 | 0.112 | 0.2 | 3.96× faster | 10,121 |
| Lodash template | 4.18.1 | 6,840 | 0.152 | 1.2 | 3.00× faster | 11,627 |
| Nunjucks | 3.2.4 | 5,718 | 0.178 | 0.4 | 2.51× faster | 11,627 |
| Handlebars | 4.7.9 | 3,776 | 0.273 | 0.9 | 1.66× faster | 10,121 |
| Dust.js | 3.0.1 | 2,464 | 0.410 | 0.5 | 1.08× faster | 11,627 |
| Teddy | 2.3.1 | 2,277 | 0.450 | 0.9 | same | 11,795 |
| LiquidJS | 10.29.0 | 2,219 | 0.457 | 0.6 | 1.03× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 886 | 1.14 | 0.8 | 2.57× slower | 11,425 |
| Pug | 3.0.4 | 702 | 1.43 | 0.5 | 3.24× slower | 7,782 |
| Marko | 6.3.51 | 403 | 2.60 | 3.1 | 5.66× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Eta | 4.6.0 | 6,017 | 0.169 | 0.5 | 2.46× faster | 237,757 |
| art-template | 4.13.4 | 5,901 | 0.173 | 0.6 | 2.41× faster | 238,758 |
| Squirrelly | 9.1.1 | 4,820 | 0.211 | 0.5 | 1.97× faster | 237,757 |
| doT | 1.1.3 | 2,606 | 0.387 | 0.5 | 1.06× faster | 238,758 |
| Teddy | 2.3.1 | 2,451 | 0.421 | 1.0 | same | 238,758 |
| Handlebars | 4.7.9 | 1,649 | 0.617 | 0.9 | 1.49× slower | 233,753 |
| Mustache | 4.2.0 | 1,207 | 0.832 | 0.5 | 2.03× slower | 233,753 |
| Lodash template | 4.18.1 | 1,109 | 1.30 | 13.2 | 2.21× slower | 238,758 |
| Nunjucks | 3.2.4 | 1,015 | 0.989 | 0.4 | 2.42× slower | 238,758 |
| Dust.js | 3.0.1 | 976 | 1.03 | 0.4 | 2.51× slower | 238,758 |
| Pug | 3.0.4 | 733 | 1.37 | 0.6 | 3.34× slower | 156,734 |
| EJS | 6.0.1 | 670 | 1.49 | 0.2 | 3.66× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 530 | 1.91 | 0.9 | 4.63× slower | 237,757 |
| Marko | 6.3.51 | 510 | 2.09 | 4.5 | 4.80× slower | 156,732 |
| LiquidJS | 10.29.0 | 99.6 | 10.05 | 0.8 | 24.60× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 25,017 | 0.040 | 0.2 | 24.75× faster | 10,931 |
| Eta | 4.6.0 | 23,088 | 0.044 | 0.2 | 22.84× faster | 10,672 |
| Squirrelly | 9.1.1 | 17,903 | 0.057 | 0.3 | 17.71× faster | 10,672 |
| Mustache | 4.2.0 | 5,414 | 0.186 | 0.3 | 5.36× faster | 11,708 |
| Lodash template | 4.18.1 | 4,635 | 0.223 | 1.2 | 4.59× faster | 10,883 |
| Dust.js | 3.0.1 | 2,862 | 0.352 | 0.4 | 2.83× faster | 10,883 |
| Handlebars | 4.7.9 | 1,591 | 0.639 | 0.8 | 1.57× faster | 11,648 |
| EJS | 6.0.1 | 1,296 | 0.779 | 0.6 | 1.28× faster | 10,883 |
| Teddy | 2.3.1 | 1,011 | 1.01 | 1.1 | same | 10,958 |
| art-template | 4.13.4 | 929 | 1.10 | 1.3 | 1.09× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 793 | 1.27 | 0.6 | 1.27× slower | 10,672 |
| LiquidJS | 10.29.0 | 574 | 1.75 | 0.5 | 1.76× slower | 10,883 |
| Nunjucks | 3.2.4 | 458 | 2.20 | 0.9 | 2.21× slower | 10,883 |
| Pug | 3.0.4 | 360 | 2.80 | 1.0 | 2.80× slower | 8,611 |
| Marko | 6.3.51 | 107 | 9.73 | 4.7 | 9.45× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 17,004 | 0.059 | 0.2 | 48.68× faster | 17,364 |
| Eta | 4.6.0 | 16,904 | 0.060 | 0.2 | 48.39× faster | 17,067 |
| Squirrelly | 9.1.1 | 12,469 | 0.081 | 0.4 | 35.70× faster | 17,067 |
| Mustache | 4.2.0 | 3,730 | 0.270 | 0.4 | 10.68× faster | 18,837 |
| Lodash template | 4.18.1 | 3,507 | 0.291 | 1.0 | 10.04× faster | 17,308 |
| Dust.js | 3.0.1 | 1,515 | 0.663 | 0.4 | 4.34× faster | 17,328 |
| EJS | 6.0.1 | 1,184 | 0.847 | 0.3 | 3.39× faster | 17,308 |
| Handlebars | 4.7.9 | 946 | 1.07 | 0.7 | 2.71× faster | 18,765 |
| art-template | 4.13.4 | 832 | 1.22 | 1.0 | 2.38× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 752 | 1.34 | 0.6 | 2.15× faster | 17,067 |
| Nunjucks | 3.2.4 | 519 | 1.95 | 1.0 | 1.49× faster | 17,308 |
| LiquidJS | 10.29.0 | 498 | 2.01 | 0.6 | 1.43× faster | 17,308 |
| Teddy | 2.3.1 | 349 | 2.90 | 1.3 | same | 17,397 |
| Pug | 3.0.4 | 199 | 5.03 | 0.7 | 1.75× slower | 11,824 |
| Marko | 6.3.51 | 77.5 | 13.32 | 5.3 | 4.51× slower | 11,438 |

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
| art-template | in page | 1,113,202 | 9.0e-4 | 1.35× faster | 1,259 |
| Pug | ahead of time | 847,489 | 1.2e-3 | 1.03× faster | 1,158 |
| Teddy (emitted js) | ahead of time | 821,903 | 1.2e-3 | same | 1,258 |
| Eta | in page | 745,922 | 1.3e-3 | 1.10× slower | 1,258 |
| Squirrelly | in page | 693,468 | 1.4e-3 | 1.19× slower | 1,258 |
| doT | in page | 533,433 | 1.9e-3 | 1.54× slower | 1,275 |
| Handlebars | in page | 413,591 | 2.4e-3 | 1.99× slower | 1,258 |
| Teddy (tree walk) | in page | 404,483 | 2.5e-3 | 2.03× slower | 1,258 |
| Marko | ahead of time | 396,780 | 2.5e-3 | 2.07× slower | 1,140 |
| Nunjucks | in page | 339,865 | 2.9e-3 | 2.42× slower | 1,258 |
| Dust.js | in page | 314,417 | 3.2e-3 | 2.61× slower | 1,258 |
| Lodash template | in page | 280,865 | 3.6e-3 | 2.93× slower | 1,258 |
| Mustache | in page | 249,735 | 4.0e-3 | 3.29× slower | 1,278 |
| EJS | in page | 147,025 | 6.8e-3 | 5.59× slower | 1,258 |
| LiquidJS | in page | 13,350 | 0.075 | 61.57× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 5,792,143 | 1.7e-4 | 1.28× faster | 492 |
| Eta | in page | 5,652,502 | 1.8e-4 | 1.25× faster | 478 |
| Squirrelly | in page | 5,592,399 | 1.8e-4 | 1.23× faster | 478 |
| Pug | ahead of time | 5,479,759 | 1.8e-4 | 1.21× faster | 410 |
| doT | in page | 4,780,805 | 2.1e-4 | 1.05× faster | 492 |
| Teddy (emitted js) | ahead of time | 4,533,384 | 2.2e-4 | same | 516 |
| Nunjucks | in page | 1,155,610 | 8.7e-4 | 3.92× slower | 492 |
| Dust.js | in page | 1,007,590 | 9.9e-4 | 4.50× slower | 516 |
| Marko | ahead of time | 736,405 | 1.4e-3 | 6.16× slower | 392 |
| Teddy (tree walk) | in page | 700,088 | 1.4e-3 | 6.48× slower | 516 |
| Mustache | in page | 622,497 | 1.6e-3 | 7.28× slower | 454 |
| Lodash template | in page | 564,924 | 1.8e-3 | 8.02× slower | 492 |
| Handlebars | in page | 524,255 | 1.9e-3 | 8.65× slower | 453 |
| EJS | in page | 407,518 | 2.5e-3 | 11.12× slower | 492 |
| LiquidJS | in page | 31,736 | 0.032 | 142.85× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 329,228 | 3.0e-3 | same | 11,795 |
| art-template | in page | 275,168 | 3.6e-3 | 1.20× slower | 11,627 |
| Eta | in page | 266,155 | 3.8e-3 | 1.24× slower | 11,425 |
| Pug | ahead of time | 221,208 | 4.5e-3 | 1.49× slower | 7,782 |
| Squirrelly | in page | 186,611 | 5.4e-3 | 1.76× slower | 11,425 |
| doT | in page | 131,450 | 7.6e-3 | 2.50× slower | 11,627 |
| Marko | ahead of time | 129,414 | 7.7e-3 | 2.54× slower | 7,474 |
| Dust.js | in page | 65,162 | 0.015 | 5.05× slower | 11,627 |
| Handlebars | in page | 55,810 | 0.018 | 5.90× slower | 10,121 |
| Mustache | in page | 51,279 | 0.020 | 6.42× slower | 10,121 |
| Lodash template | in page | 40,046 | 0.025 | 8.22× slower | 11,627 |
| Nunjucks | in page | 25,762 | 0.039 | 12.78× slower | 11,627 |
| Teddy (tree walk) | in page | 24,915 | 0.040 | 13.21× slower | 11,795 |
| EJS | in page | 19,045 | 0.053 | 17.29× slower | 11,627 |
| LiquidJS | in page | 1,312 | 0.762 | 250.87× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 10,096 | 0.099 | same | 238,758 |
| Eta | in page | 8,335 | 0.120 | 1.21× slower | 237,757 |
| art-template | in page | 7,448 | 0.134 | 1.36× slower | 238,758 |
| Pug | ahead of time | 6,984 | 0.143 | 1.45× slower | 156,734 |
| Marko | ahead of time | 6,596 | 0.152 | 1.53× slower | 156,732 |
| Squirrelly | in page | 6,536 | 0.153 | 1.54× slower | 237,757 |
| doT | in page | 4,225 | 0.237 | 2.39× slower | 238,758 |
| Handlebars | in page | 2,940 | 0.340 | 3.43× slower | 233,753 |
| Dust.js | in page | 2,581 | 0.387 | 3.91× slower | 238,758 |
| Teddy (tree walk) | in page | 2,067 | 0.484 | 4.89× slower | 238,758 |
| Mustache | in page | 1,880 | 0.532 | 5.37× slower | 233,753 |
| Lodash template | in page | 1,878 | 0.533 | 5.38× slower | 238,758 |
| Nunjucks | in page | 1,696 | 0.589 | 5.95× slower | 238,758 |
| EJS | in page | 765 | 1.31 | 13.20× slower | 238,758 |
| LiquidJS | in page | 49.8 | 20.07 | 202.59× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 240,717 | 4.2e-3 | same | 10,958 |
| Pug | ahead of time | 167,378 | 6.0e-3 | 1.44× slower | 8,611 |
| Squirrelly | in page | 129,732 | 7.7e-3 | 1.86× slower | 10,672 |
| Eta | in page | 113,255 | 8.8e-3 | 2.13× slower | 10,672 |
| doT | in page | 104,031 | 9.6e-3 | 2.31× slower | 10,931 |
| Marko | ahead of time | 100,431 | 1.0e-2 | 2.40× slower | 8,247 |
| Dust.js | in page | 52,030 | 0.019 | 4.63× slower | 10,883 |
| Handlebars | in page | 25,707 | 0.039 | 9.36× slower | 11,648 |
| Mustache | in page | 25,070 | 0.040 | 9.60× slower | 11,708 |
| Lodash template | in page | 24,821 | 0.040 | 9.70× slower | 10,883 |
| Teddy (tree walk) | in page | 23,615 | 0.042 | 10.19× slower | 10,958 |
| Nunjucks | in page | 14,407 | 0.069 | 16.71× slower | 10,883 |
| art-template | in page | 11,886 | 0.084 | 20.25× slower | 10,883 |
| EJS | in page | 9,094 | 0.110 | 26.47× slower | 10,883 |
| LiquidJS | in page | 695 | 1.44 | 346.60× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 158,489 | 6.3e-3 | same | 17,397 |
| Pug | ahead of time | 112,093 | 8.9e-3 | 1.41× slower | 11,824 |
| Eta | in page | 94,288 | 0.011 | 1.68× slower | 17,067 |
| Squirrelly | in page | 92,308 | 0.011 | 1.72× slower | 17,067 |
| Marko | ahead of time | 73,350 | 0.014 | 2.16× slower | 11,438 |
| doT | in page | 70,666 | 0.014 | 2.24× slower | 17,364 |
| Dust.js | in page | 36,312 | 0.028 | 4.36× slower | 17,328 |
| Handlebars | in page | 21,571 | 0.046 | 7.35× slower | 18,765 |
| Mustache | in page | 18,828 | 0.053 | 8.42× slower | 18,837 |
| Lodash template | in page | 18,692 | 0.053 | 8.48× slower | 17,308 |
| Teddy (tree walk) | in page | 18,390 | 0.054 | 8.62× slower | 17,397 |
| Nunjucks | in page | 11,840 | 0.084 | 13.39× slower | 17,308 |
| art-template | in page | 11,612 | 0.086 | 13.65× slower | 17,308 |
| EJS | in page | 7,384 | 0.135 | 21.46× slower | 17,308 |
| LiquidJS | in page | 533 | 1.88 | 297.18× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 93,961 | 0.011 | 15.89× faster | 1,275 |
| Eta | 34,187 | 0.029 | 5.78× faster | 1,258 |
| Lodash template | 28,504 | 0.035 | 4.82× faster | 1,258 |
| EJS | 26,915 | 0.037 | 4.55× faster | 1,258 |
| Squirrelly | 23,889 | 0.042 | 4.04× faster | 1,258 |
| Mustache | 14,004 | 0.071 | 2.37× faster | 1,278 |
| art-template | 13,506 | 0.074 | 2.28× faster | 1,259 |
| Nunjucks | 7,412 | 0.135 | 1.25× faster | 1,258 |
| Teddy | 5,911 | 0.169 | same | 1,258 |
| LiquidJS | 5,216 | 0.192 | 1.13× slower | 1,258 |
| Handlebars | 4,266 | 0.234 | 1.39× slower | 1,258 |
| Dust.js | 3,333 | 0.300 | 1.77× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 143,269 | 7.0e-3 | 45.85× faster | 492 |
| Eta | 43,078 | 0.023 | 13.79× faster | 478 |
| Lodash template | 41,523 | 0.024 | 13.29× faster | 492 |
| EJS | 39,121 | 0.026 | 12.52× faster | 492 |
| Squirrelly | 26,514 | 0.038 | 8.49× faster | 478 |
| art-template | 19,228 | 0.052 | 6.15× faster | 492 |
| Mustache | 13,810 | 0.072 | 4.42× faster | 454 |
| LiquidJS | 8,584 | 0.116 | 2.75× faster | 492 |
| Nunjucks | 8,343 | 0.120 | 2.67× faster | 492 |
| Handlebars | 4,249 | 0.235 | 1.36× faster | 453 |
| Dust.js | 3,423 | 0.292 | 1.10× faster | 516 |
| Teddy | 3,125 | 0.320 | same | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 78,198 | 0.013 | 16.82× faster | 11,627 |
| Eta | 41,638 | 0.024 | 8.96× faster | 11,425 |
| Squirrelly | 26,313 | 0.038 | 5.66× faster | 11,425 |
| art-template | 25,732 | 0.039 | 5.54× faster | 11,627 |
| Lodash template | 22,459 | 0.045 | 4.83× faster | 11,627 |
| EJS | 14,836 | 0.067 | 3.19× faster | 11,627 |
| Mustache | 14,767 | 0.068 | 3.18× faster | 10,121 |
| Nunjucks | 7,982 | 0.125 | 1.72× faster | 11,627 |
| Handlebars | 6,851 | 0.146 | 1.47× faster | 10,121 |
| Teddy | 4,648 | 0.215 | same | 11,795 |
| Dust.js | 4,389 | 0.228 | 1.06× slower | 11,627 |
| LiquidJS | 1,152 | 0.868 | 4.04× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 7,127 | 0.140 | 4.30× faster | 237,757 |
| art-template | 6,024 | 0.166 | 3.64× faster | 238,758 |
| Squirrelly | 5,438 | 0.184 | 3.28× faster | 237,757 |
| doT | 3,899 | 0.257 | 2.35× faster | 238,758 |
| Handlebars | 2,336 | 0.428 | 1.41× faster | 233,753 |
| Lodash template | 1,819 | 0.550 | 1.10× faster | 238,758 |
| Dust.js | 1,737 | 0.576 | 1.05× faster | 238,758 |
| Mustache | 1,720 | 0.581 | 1.04× faster | 233,753 |
| Teddy | 1,656 | 0.604 | same | 238,758 |
| Nunjucks | 1,508 | 0.663 | 1.10× slower | 238,758 |
| EJS | 756 | 1.32 | 2.19× slower | 238,758 |
| LiquidJS | 49.5 | 20.21 | 33.47× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 49,028 | 0.020 | 19.06× faster | 10,931 |
| Eta | 39,176 | 0.026 | 15.23× faster | 10,672 |
| Squirrelly | 28,253 | 0.035 | 10.98× faster | 10,672 |
| Lodash template | 17,492 | 0.057 | 6.80× faster | 10,883 |
| Mustache | 8,783 | 0.114 | 3.41× faster | 11,708 |
| EJS | 6,370 | 0.157 | 2.48× faster | 10,883 |
| Dust.js | 5,539 | 0.181 | 2.15× faster | 10,883 |
| art-template | 5,415 | 0.185 | 2.10× faster | 10,883 |
| Nunjucks | 4,039 | 0.248 | 1.57× faster | 10,883 |
| Handlebars | 2,841 | 0.352 | 1.10× faster | 11,648 |
| Teddy | 2,573 | 0.389 | same | 10,958 |
| LiquidJS | 650 | 1.54 | 3.96× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 29,463 | 0.034 | 34.80× faster | 17,364 |
| Eta | 24,870 | 0.040 | 29.37× faster | 17,067 |
| Squirrelly | 17,283 | 0.058 | 20.41× faster | 17,067 |
| Lodash template | 12,713 | 0.079 | 15.01× faster | 17,308 |
| Mustache | 5,366 | 0.186 | 6.34× faster | 18,837 |
| EJS | 4,706 | 0.212 | 5.56× faster | 17,308 |
| art-template | 3,872 | 0.258 | 4.57× faster | 17,308 |
| Dust.js | 2,866 | 0.349 | 3.38× faster | 17,328 |
| Nunjucks | 2,495 | 0.401 | 2.95× faster | 17,308 |
| Handlebars | 1,523 | 0.656 | 1.80× faster | 18,765 |
| Teddy | 847 | 1.18 | same | 17,397 |
| LiquidJS | 479 | 2.09 | 1.77× slower | 17,308 |
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

