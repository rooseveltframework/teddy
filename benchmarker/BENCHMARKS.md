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
| Pug | 6 | 1.24× slower |
| Eta | 6 | 1.29× slower |
| Squirrelly | 6 | 1.35× slower |
| Marko | 6 | 1.95× slower |
| doT | 6 | 2.64× slower |
| art-template | 6 | 3.01× slower |
| Dust.js | 6 | 5.77× slower |
| Handlebars | 6 | 6.33× slower |
| Lodash template | 6 | 7.39× slower |
| Mustache | 6 | 8.99× slower |
| Nunjucks | 6 | 9.51× slower |
| EJS | 6 | 17.30× slower |
| PHP (node-php-runner) | 6 | 30.81× slower |
| LiquidJS | 6 | 83.08× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 16.04× faster |
| Eta | 6 | 13.10× faster |
| Squirrelly | 6 | 9.89× faster |
| art-template | 6 | 3.96× faster |
| Mustache | 6 | 3.85× faster |
| Lodash template | 6 | 3.53× faster |
| EJS | 6 | 3.23× faster |
| Handlebars | 6 | 1.48× faster |
| Nunjucks | 6 | 1.48× faster |
| Dust.js | 6 | 1.39× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | same |
| PHP (node-php-runner) | 6 | 1.74× slower |
| Pug | 6 | 2.86× slower |
| Marko | 6 | 6.43× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Teddy (emitted js) | 6 | same |
| Pug | 6 | 1.15× slower |
| Eta | 6 | 1.21× slower |
| Squirrelly | 6 | 1.30× slower |
| doT | 6 | 1.72× slower |
| art-template | 6 | 2.34× slower |
| Marko | 6 | 2.36× slower |
| Dust.js | 6 | 4.10× slower |
| Handlebars | 6 | 5.26× slower |
| Mustache | 6 | 5.89× slower |
| Teddy (tree walk) | 6 | 6.15× slower |
| Lodash template | 6 | 6.23× slower |
| Nunjucks | 6 | 6.78× slower |
| EJS | 6 | 13.18× slower |
| LiquidJS | 6 | 180.39× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 17.29× faster |
| Eta | 6 | 11.13× faster |
| Squirrelly | 6 | 8.00× faster |
| Lodash template | 6 | 6.05× faster |
| art-template | 6 | 3.88× faster |
| EJS | 6 | 3.48× faster |
| Mustache | 6 | 3.17× faster |
| Nunjucks | 6 | 1.79× faster |
| Dust.js | 6 | 1.32× faster |
| Handlebars | 6 | 1.31× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.57× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,204,018 | 8.7e-4 | 0.8 | 1.61× faster | 1,259 |
| Teddy | 2.3.2 | 745,830 | 1.4e-3 | 0.4 | same | 1,258 |
| Eta | 4.6.0 | 639,996 | 1.6e-3 | 0.2 | 1.17× slower | 1,258 |
| Pug | 3.0.4 | 623,050 | 1.6e-3 | 0.2 | 1.20× slower | 1,158 |
| Squirrelly | 9.1.1 | 574,216 | 1.8e-3 | 0.3 | 1.30× slower | 1,258 |
| Marko | 6.3.51 | 529,323 | 1.9e-3 | 0.2 | 1.41× slower | 1,140 |
| doT | 1.1.3 | 400,262 | 2.5e-3 | 0.1 | 1.86× slower | 1,275 |
| Handlebars | 4.7.9 | 343,031 | 2.9e-3 | 0.2 | 2.17× slower | 1,258 |
| Nunjucks | 3.2.4 | 293,453 | 3.4e-3 | 0.1 | 2.54× slower | 1,258 |
| Dust.js | 3.0.1 | 239,335 | 4.2e-3 | 0.2 | 3.12× slower | 1,258 |
| Lodash template | 4.18.1 | 237,778 | 4.2e-3 | 0.1 | 3.14× slower | 1,258 |
| Mustache | 4.2.0 | 162,991 | 6.3e-3 | 0.2 | 4.58× slower | 1,278 |
| EJS | 6.0.1 | 124,222 | 8.1e-3 | 0.7 | 6.00× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 35,950 | 0.030 | 0.5 | 20.75× slower | 1,258 |
| LiquidJS | 10.29.0 | 26,737 | 0.038 | 0.2 | 27.90× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 10,409,548 | 1.0e-4 | 1.7 | 1.63× faster | 478 |
| Eta | 4.6.0 | 9,993,882 | 1.1e-4 | 2.6 | 1.57× faster | 478 |
| art-template | 4.13.4 | 9,731,421 | 1.1e-4 | 1.7 | 1.53× faster | 492 |
| Pug | 3.0.4 | 9,482,917 | 1.2e-4 | 0.5 | 1.49× faster | 410 |
| Teddy | 2.3.2 | 6,373,406 | 1.6e-4 | 0.3 | same | 516 |
| doT | 1.1.3 | 5,108,761 | 2.0e-4 | 0.6 | 1.25× slower | 492 |
| Marko | 6.3.51 | 1,687,628 | 6.2e-4 | 0.4 | 3.78× slower | 392 |
| Nunjucks | 3.2.4 | 1,172,823 | 8.8e-4 | 0.2 | 5.43× slower | 492 |
| Dust.js | 3.0.1 | 922,659 | 1.1e-3 | 1.4 | 6.91× slower | 516 |
| Lodash template | 4.18.1 | 529,486 | 1.9e-3 | 0.1 | 12.04× slower | 492 |
| Mustache | 4.2.0 | 516,033 | 2.0e-3 | 0.2 | 12.35× slower | 454 |
| Handlebars | 4.7.9 | 467,931 | 2.2e-3 | 0.3 | 13.62× slower | 453 |
| EJS | 6.0.1 | 369,337 | 2.8e-3 | 0.3 | 17.26× slower | 492 |
| LiquidJS | 10.29.0 | 65,938 | 0.015 | 0.2 | 96.66× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 65,408 | 0.016 | 0.4 | 97.44× slower | 478 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.2 | 304,506 | 3.4e-3 | 0.2 | same | 11,795 |
| art-template | 4.13.4 | 240,915 | 4.3e-3 | 0.3 | 1.26× slower | 11,627 |
| Eta | 4.6.0 | 229,657 | 4.5e-3 | 0.3 | 1.33× slower | 11,425 |
| Pug | 3.0.4 | 209,245 | 4.9e-3 | 0.2 | 1.46× slower | 7,782 |
| Squirrelly | 9.1.1 | 180,451 | 5.7e-3 | 0.3 | 1.69× slower | 11,425 |
| Marko | 6.3.51 | 157,061 | 6.5e-3 | 0.3 | 1.94× slower | 7,474 |
| doT | 1.1.3 | 82,859 | 0.012 | 0.4 | 3.67× slower | 11,627 |
| Handlebars | 4.7.9 | 45,211 | 0.023 | 0.4 | 6.74× slower | 10,121 |
| Dust.js | 3.0.1 | 40,419 | 0.025 | 0.3 | 7.53× slower | 11,627 |
| Mustache | 4.2.0 | 37,922 | 0.027 | 0.3 | 8.03× slower | 10,121 |
| Lodash template | 4.18.1 | 37,087 | 0.027 | 0.2 | 8.21× slower | 11,627 |
| EJS | 6.0.1 | 17,633 | 0.057 | 0.1 | 17.27× slower | 11,627 |
| Nunjucks | 3.2.4 | 17,180 | 0.059 | 0.2 | 17.72× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 11,840 | 0.086 | 0.3 | 25.72× slower | 11,425 |
| LiquidJS | 10.29.0 | 2,679 | 0.375 | 0.4 | 113.65× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.2 | 9,828 | 0.107 | 0.8 | same | 238,758 |
| Eta | 4.6.0 | 7,860 | 0.129 | 0.4 | 1.25× slower | 237,757 |
| art-template | 4.13.4 | 7,346 | 0.140 | 0.6 | 1.34× slower | 238,758 |
| Marko | 6.3.51 | 6,623 | 0.153 | 0.4 | 1.48× slower | 156,732 |
| Pug | 3.0.4 | 6,510 | 0.159 | 0.7 | 1.51× slower | 156,734 |
| Squirrelly | 9.1.1 | 6,316 | 0.161 | 0.5 | 1.56× slower | 237,757 |
| doT | 1.1.3 | 2,745 | 0.368 | 0.5 | 3.58× slower | 238,758 |
| Handlebars | 4.7.9 | 2,702 | 0.381 | 0.9 | 3.64× slower | 233,753 |
| Dust.js | 3.0.1 | 1,728 | 0.585 | 0.6 | 5.69× slower | 238,758 |
| Lodash template | 4.18.1 | 1,700 | 0.593 | 0.6 | 5.78× slower | 238,758 |
| Mustache | 4.2.0 | 1,323 | 0.762 | 0.6 | 7.43× slower | 233,753 |
| Nunjucks | 3.2.4 | 1,150 | 0.873 | 0.4 | 8.55× slower | 238,758 |
| EJS | 6.0.1 | 651 | 1.55 | 0.8 | 15.09× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 495 | 2.07 | 1.6 | 19.86× slower | 237,757 |
| LiquidJS | 10.29.0 | 100 | 10.01 | 0.9 | 98.24× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.2 | 218,681 | 4.8e-3 | 0.3 | same | 10,958 |
| Pug | 3.0.4 | 151,222 | 6.9e-3 | 0.3 | 1.45× slower | 8,611 |
| Squirrelly | 9.1.1 | 125,815 | 8.1e-3 | 0.3 | 1.74× slower | 10,672 |
| Marko | 6.3.51 | 112,803 | 9.0e-3 | 0.2 | 1.94× slower | 8,247 |
| Eta | 4.6.0 | 108,764 | 9.5e-3 | 0.3 | 2.01× slower | 10,672 |
| doT | 1.1.3 | 66,181 | 0.015 | 0.3 | 3.30× slower | 10,931 |
| Dust.js | 3.0.1 | 34,662 | 0.029 | 0.2 | 6.31× slower | 10,883 |
| Lodash template | 4.18.1 | 21,506 | 0.047 | 0.4 | 10.17× slower | 10,883 |
| Handlebars | 4.7.9 | 20,955 | 0.049 | 0.3 | 10.44× slower | 11,648 |
| Mustache | 4.2.0 | 16,808 | 0.060 | 0.2 | 13.01× slower | 11,708 |
| Nunjucks | 3.2.4 | 9,890 | 0.120 | 3.8 | 22.11× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 6,839 | 0.153 | 0.7 | 31.97× slower | 10,672 |
| EJS | 6.0.1 | 6,211 | 0.162 | 0.2 | 35.21× slower | 10,883 |
| art-template | 4.13.4 | 5,532 | 0.193 | 1.9 | 39.53× slower | 10,883 |
| LiquidJS | 10.29.0 | 2,042 | 0.496 | 0.6 | 107.09× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.2 | 150,070 | 6.8e-3 | 0.3 | same | 17,397 |
| Pug | 3.0.4 | 103,888 | 9.8e-3 | 0.3 | 1.44× slower | 11,824 |
| Squirrelly | 9.1.1 | 88,437 | 0.012 | 0.5 | 1.70× slower | 17,067 |
| Eta | 4.6.0 | 82,567 | 0.013 | 0.5 | 1.82× slower | 17,067 |
| Marko | 6.3.51 | 82,089 | 0.012 | 0.3 | 1.83× slower | 11,438 |
| doT | 1.1.3 | 44,491 | 0.023 | 0.6 | 3.37× slower | 17,364 |
| Dust.js | 3.0.1 | 23,632 | 0.043 | 0.4 | 6.35× slower | 17,328 |
| Handlebars | 4.7.9 | 17,664 | 0.057 | 0.3 | 8.50× slower | 18,765 |
| Lodash template | 4.18.1 | 16,793 | 0.060 | 0.4 | 8.94× slower | 17,308 |
| Mustache | 4.2.0 | 12,454 | 0.081 | 0.2 | 12.05× slower | 18,837 |
| Nunjucks | 3.2.4 | 9,357 | 0.129 | 3.9 | 16.04× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 5,789 | 0.178 | 0.6 | 25.92× slower | 17,067 |
| art-template | 4.13.4 | 5,506 | 0.195 | 1.8 | 27.26× slower | 17,308 |
| EJS | 6.0.1 | 5,316 | 0.189 | 0.2 | 28.23× slower | 17,308 |
| LiquidJS | 10.29.0 | 1,471 | 0.684 | 0.5 | 102.00× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 40,962 | 0.025 | 0.2 | 14.47× faster | 1,275 |
| Eta | 4.6.0 | 20,138 | 0.051 | 0.4 | 7.11× faster | 1,258 |
| EJS | 6.0.1 | 17,169 | 0.061 | 0.5 | 6.07× faster | 1,258 |
| Squirrelly | 9.1.1 | 15,336 | 0.066 | 0.3 | 5.42× faster | 1,258 |
| art-template | 4.13.4 | 11,673 | 0.089 | 0.8 | 4.12× faster | 1,259 |
| Mustache | 4.2.0 | 9,058 | 0.113 | 0.4 | 3.20× faster | 1,278 |
| Lodash template | 4.18.1 | 8,305 | 0.127 | 1.3 | 2.93× faster | 1,258 |
| LiquidJS | 10.29.0 | 6,681 | 0.161 | 1.5 | 2.36× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,663 | 0.152 | 0.4 | 2.35× faster | 1,258 |
| Teddy | 2.3.2 | 2,830 | 0.374 | 1.4 | same | 1,258 |
| Handlebars | 4.7.9 | 2,411 | 0.424 | 0.8 | 1.17× slower | 1,258 |
| Dust.js | 3.0.1 | 1,756 | 0.579 | 0.8 | 1.61× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 789 | 1.31 | 1.4 | 3.59× slower | 1,258 |
| Pug | 3.0.4 | 375 | 2.69 | 1.1 | 7.55× slower | 1,158 |
| Marko | 6.3.51 | 278 | 3.91 | 5.3 | 10.17× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 51,471 | 0.020 | 0.2 | 53.54× faster | 492 |
| EJS | 6.0.1 | 24,876 | 0.041 | 0.3 | 25.88× faster | 492 |
| Eta | 4.6.0 | 23,215 | 0.043 | 0.2 | 24.15× faster | 478 |
| Squirrelly | 9.1.1 | 16,500 | 0.061 | 0.3 | 17.16× faster | 478 |
| art-template | 4.13.4 | 15,727 | 0.067 | 1.0 | 16.36× faster | 492 |
| LiquidJS | 10.29.0 | 12,048 | 0.090 | 1.7 | 12.53× faster | 492 |
| Lodash template | 4.18.1 | 9,330 | 0.114 | 2.1 | 9.71× faster | 492 |
| Mustache | 4.2.0 | 8,438 | 0.120 | 0.5 | 8.78× faster | 454 |
| Nunjucks | 3.2.4 | 5,777 | 0.175 | 0.3 | 6.01× faster | 492 |
| Handlebars | 4.7.9 | 2,335 | 0.439 | 0.8 | 2.43× faster | 453 |
| Dust.js | 3.0.1 | 1,888 | 0.531 | 0.3 | 1.96× faster | 516 |
| PHP (node-php-runner) | 2.0.0 | 1,168 | 1.05 | 1.4 | 1.22× faster | 478 |
| Teddy | 2.3.2 | 961 | 1.07 | 1.4 | same | 516 |
| Pug | 3.0.4 | 696 | 1.45 | 0.9 | 1.38× slower | 410 |
| Marko | 6.3.51 | 183 | 5.73 | 4.2 | 5.24× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 33,804 | 0.031 | 0.6 | 15.64× faster | 11,627 |
| Eta | 4.6.0 | 23,089 | 0.045 | 0.4 | 10.68× faster | 11,425 |
| art-template | 4.13.4 | 21,409 | 0.049 | 0.8 | 9.91× faster | 11,627 |
| Squirrelly | 9.1.1 | 16,452 | 0.063 | 0.5 | 7.61× faster | 11,425 |
| EJS | 6.0.1 | 11,929 | 0.084 | 0.2 | 5.52× faster | 11,627 |
| Mustache | 4.2.0 | 8,914 | 0.113 | 0.3 | 4.12× faster | 10,121 |
| Lodash template | 4.18.1 | 6,577 | 0.161 | 1.3 | 3.04× faster | 11,627 |
| Nunjucks | 3.2.4 | 5,506 | 0.184 | 0.4 | 2.55× faster | 11,627 |
| Handlebars | 4.7.9 | 3,609 | 0.288 | 0.9 | 1.67× faster | 10,121 |
| Dust.js | 3.0.1 | 2,438 | 0.418 | 0.7 | 1.13× faster | 11,627 |
| Teddy | 2.3.2 | 2,161 | 0.485 | 1.4 | same | 11,795 |
| LiquidJS | 10.29.0 | 2,130 | 0.481 | 0.8 | 1.01× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 882 | 1.16 | 1.1 | 2.45× slower | 11,425 |
| Pug | 3.0.4 | 710 | 1.42 | 0.8 | 3.04× slower | 7,782 |
| Marko | 6.3.51 | 389 | 2.72 | 3.4 | 5.56× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Eta | 4.6.0 | 5,855 | 0.175 | 0.6 | 2.43× faster | 237,757 |
| art-template | 4.13.4 | 5,815 | 0.177 | 0.7 | 2.42× faster | 238,758 |
| Squirrelly | 9.1.1 | 4,621 | 0.223 | 0.7 | 1.92× faster | 237,757 |
| doT | 1.1.3 | 2,565 | 0.397 | 0.7 | 1.07× faster | 238,758 |
| Teddy | 2.3.2 | 2,405 | 0.431 | 1.2 | same | 238,758 |
| Handlebars | 4.7.9 | 1,769 | 0.575 | 0.8 | 1.36× slower | 233,753 |
| Mustache | 4.2.0 | 1,162 | 0.866 | 0.6 | 2.07× slower | 233,753 |
| Lodash template | 4.18.1 | 1,086 | 1.37 | 14.3 | 2.22× slower | 238,758 |
| Nunjucks | 3.2.4 | 1,008 | 0.997 | 0.5 | 2.39× slower | 238,758 |
| Dust.js | 3.0.1 | 954 | 1.05 | 0.6 | 2.52× slower | 238,758 |
| Pug | 3.0.4 | 694 | 1.46 | 1.1 | 3.47× slower | 156,734 |
| EJS | 6.0.1 | 644 | 1.56 | 0.7 | 3.73× slower | 238,758 |
| Marko | 6.3.51 | 467 | 2.31 | 3.7 | 5.15× slower | 156,732 |
| PHP (node-php-runner) | 2.0.0 | 439 | 2.33 | 1.6 | 5.47× slower | 237,757 |
| LiquidJS | 10.29.0 | 95.2 | 10.55 | 1.4 | 25.25× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 25,327 | 0.040 | 0.2 | 25.77× faster | 10,931 |
| Eta | 4.6.0 | 22,217 | 0.047 | 0.4 | 22.60× faster | 10,672 |
| Squirrelly | 9.1.1 | 17,621 | 0.058 | 0.7 | 17.93× faster | 10,672 |
| Mustache | 4.2.0 | 5,254 | 0.194 | 0.6 | 5.35× faster | 11,708 |
| Lodash template | 4.18.1 | 4,573 | 0.225 | 1.1 | 4.65× faster | 10,883 |
| Dust.js | 3.0.1 | 2,870 | 0.351 | 0.4 | 2.92× faster | 10,883 |
| Handlebars | 4.7.9 | 1,560 | 0.654 | 0.9 | 1.59× faster | 11,648 |
| EJS | 6.0.1 | 1,307 | 0.768 | 0.4 | 1.33× faster | 10,883 |
| Teddy | 2.3.2 | 983 | 1.06 | 1.7 | same | 10,958 |
| art-template | 4.13.4 | 937 | 1.09 | 1.1 | 1.05× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 743 | 1.36 | 0.8 | 1.32× slower | 10,672 |
| LiquidJS | 10.29.0 | 573 | 1.75 | 0.5 | 1.71× slower | 10,883 |
| Nunjucks | 3.2.4 | 442 | 2.29 | 1.3 | 2.22× slower | 10,883 |
| Pug | 3.0.4 | 363 | 2.76 | 0.7 | 2.70× slower | 8,611 |
| Marko | 6.3.51 | 102 | 10.13 | 4.6 | 9.60× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 16,231 | 0.063 | 0.4 | 51.07× faster | 17,364 |
| Eta | 4.6.0 | 15,927 | 0.064 | 0.4 | 50.11× faster | 17,067 |
| Squirrelly | 9.1.1 | 12,205 | 0.084 | 0.4 | 38.40× faster | 17,067 |
| Mustache | 4.2.0 | 3,472 | 0.293 | 0.6 | 10.92× faster | 18,837 |
| Lodash template | 4.18.1 | 3,380 | 0.305 | 1.2 | 10.64× faster | 17,308 |
| Dust.js | 3.0.1 | 1,434 | 0.709 | 0.9 | 4.51× faster | 17,328 |
| EJS | 6.0.1 | 1,166 | 0.864 | 0.6 | 3.67× faster | 17,308 |
| Handlebars | 4.7.9 | 840 | 1.21 | 1.0 | 2.64× faster | 18,765 |
| art-template | 4.13.4 | 796 | 1.30 | 1.7 | 2.51× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 604 | 1.73 | 1.9 | 1.90× faster | 17,067 |
| Nunjucks | 3.2.4 | 494 | 2.06 | 1.3 | 1.55× faster | 17,308 |
| LiquidJS | 10.29.0 | 461 | 2.19 | 1.0 | 1.45× faster | 17,308 |
| Teddy | 2.3.2 | 318 | 3.22 | 2.0 | same | 17,397 |
| Pug | 3.0.4 | 174 | 5.80 | 1.4 | 1.83× slower | 11,824 |
| Marko | 6.3.51 | 65.8 | 15.72 | 5.0 | 4.83× slower | 11,438 |

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
| art-template | in page | 1,118,552 | 8.9e-4 | 1.40× faster | 1,259 |
| Pug | ahead of time | 838,080 | 1.2e-3 | 1.05× faster | 1,158 |
| Teddy (emitted js) | ahead of time | 800,371 | 1.2e-3 | same | 1,258 |
| Eta | in page | 723,891 | 1.4e-3 | 1.11× slower | 1,258 |
| Squirrelly | in page | 686,701 | 1.5e-3 | 1.17× slower | 1,258 |
| doT | in page | 536,101 | 1.9e-3 | 1.49× slower | 1,275 |
| Marko | ahead of time | 402,558 | 2.5e-3 | 1.99× slower | 1,140 |
| Teddy (tree walk) | in page | 394,568 | 2.5e-3 | 2.03× slower | 1,258 |
| Handlebars | in page | 382,718 | 2.6e-3 | 2.09× slower | 1,258 |
| Nunjucks | in page | 325,064 | 3.1e-3 | 2.46× slower | 1,258 |
| Dust.js | in page | 293,627 | 3.4e-3 | 2.73× slower | 1,258 |
| Lodash template | in page | 284,976 | 3.5e-3 | 2.81× slower | 1,258 |
| Mustache | in page | 239,945 | 4.2e-3 | 3.34× slower | 1,278 |
| EJS | in page | 141,529 | 7.1e-3 | 5.66× slower | 1,258 |
| LiquidJS | in page | 13,416 | 0.075 | 59.66× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Eta | in page | 5,691,645 | 1.8e-4 | 1.69× faster | 478 |
| art-template | in page | 5,672,860 | 1.8e-4 | 1.68× faster | 492 |
| Squirrelly | in page | 5,382,795 | 1.9e-4 | 1.59× faster | 478 |
| Pug | ahead of time | 4,756,946 | 2.1e-4 | 1.41× faster | 410 |
| doT | in page | 4,683,580 | 2.1e-4 | 1.39× faster | 492 |
| Teddy (emitted js) | ahead of time | 3,377,715 | 3.0e-4 | same | 516 |
| Nunjucks | in page | 1,138,533 | 8.8e-4 | 2.97× slower | 492 |
| Dust.js | in page | 1,002,299 | 1.0e-3 | 3.37× slower | 516 |
| Teddy (tree walk) | in page | 693,014 | 1.4e-3 | 4.87× slower | 516 |
| Mustache | in page | 605,389 | 1.7e-3 | 5.58× slower | 454 |
| Marko | ahead of time | 587,669 | 1.7e-3 | 5.75× slower | 392 |
| Lodash template | in page | 555,057 | 1.8e-3 | 6.09× slower | 492 |
| Handlebars | in page | 525,829 | 1.9e-3 | 6.42× slower | 453 |
| EJS | in page | 400,979 | 2.5e-3 | 8.42× slower | 492 |
| LiquidJS | in page | 30,573 | 0.033 | 110.48× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 323,793 | 3.1e-3 | same | 11,795 |
| art-template | in page | 239,052 | 4.2e-3 | 1.35× slower | 11,627 |
| Pug | ahead of time | 217,777 | 4.6e-3 | 1.49× slower | 7,782 |
| Eta | in page | 215,695 | 4.6e-3 | 1.50× slower | 11,425 |
| Squirrelly | in page | 187,773 | 5.3e-3 | 1.72× slower | 11,425 |
| Marko | ahead of time | 130,242 | 7.7e-3 | 2.49× slower | 7,474 |
| doT | in page | 127,229 | 7.9e-3 | 2.54× slower | 11,627 |
| Dust.js | in page | 63,520 | 0.016 | 5.10× slower | 11,627 |
| Handlebars | in page | 54,209 | 0.018 | 5.97× slower | 10,121 |
| Mustache | in page | 50,478 | 0.020 | 6.41× slower | 10,121 |
| Lodash template | in page | 31,071 | 0.032 | 10.42× slower | 11,627 |
| Nunjucks | in page | 24,975 | 0.040 | 12.96× slower | 11,627 |
| Teddy (tree walk) | in page | 23,217 | 0.043 | 13.95× slower | 11,795 |
| EJS | in page | 19,151 | 0.052 | 16.91× slower | 11,627 |
| LiquidJS | in page | 1,188 | 0.842 | 272.63× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 9,723 | 0.103 | same | 238,758 |
| Eta | in page | 8,139 | 0.123 | 1.19× slower | 237,757 |
| art-template | in page | 7,416 | 0.135 | 1.31× slower | 238,758 |
| Pug | ahead of time | 6,944 | 0.144 | 1.40× slower | 156,734 |
| Squirrelly | in page | 6,527 | 0.153 | 1.49× slower | 237,757 |
| Marko | ahead of time | 6,369 | 0.157 | 1.53× slower | 156,732 |
| doT | in page | 4,125 | 0.242 | 2.36× slower | 238,758 |
| Handlebars | in page | 2,116 | 0.473 | 4.60× slower | 233,753 |
| Dust.js | in page | 1,972 | 0.507 | 4.93× slower | 238,758 |
| Lodash template | in page | 1,845 | 0.542 | 5.27× slower | 238,758 |
| Mustache | in page | 1,715 | 0.583 | 5.67× slower | 233,753 |
| Teddy (tree walk) | in page | 1,639 | 0.610 | 5.93× slower | 238,758 |
| Nunjucks | in page | 1,587 | 0.630 | 6.13× slower | 238,758 |
| EJS | in page | 671 | 1.49 | 14.49× slower | 238,758 |
| LiquidJS | in page | 43.5 | 22.99 | 223.54× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 180,839 | 5.5e-3 | same | 10,958 |
| Pug | ahead of time | 159,267 | 6.3e-3 | 1.14× slower | 8,611 |
| Squirrelly | in page | 125,376 | 8.0e-3 | 1.44× slower | 10,672 |
| Eta | in page | 113,817 | 8.8e-3 | 1.59× slower | 10,672 |
| doT | in page | 101,560 | 9.8e-3 | 1.78× slower | 10,931 |
| Marko | ahead of time | 96,479 | 0.010 | 1.87× slower | 8,247 |
| Dust.js | in page | 51,455 | 0.019 | 3.51× slower | 10,883 |
| Mustache | in page | 24,939 | 0.040 | 7.25× slower | 11,708 |
| Handlebars | in page | 24,562 | 0.041 | 7.36× slower | 11,648 |
| Lodash template | in page | 24,323 | 0.041 | 7.43× slower | 10,883 |
| Teddy (tree walk) | in page | 23,188 | 0.043 | 7.80× slower | 10,958 |
| Nunjucks | in page | 14,041 | 0.071 | 12.88× slower | 10,883 |
| art-template | in page | 11,586 | 0.086 | 15.61× slower | 10,883 |
| EJS | in page | 8,751 | 0.114 | 20.66× slower | 10,883 |
| LiquidJS | in page | 656 | 1.52 | 275.52× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 157,730 | 6.3e-3 | same | 17,397 |
| Pug | ahead of time | 112,004 | 8.9e-3 | 1.41× slower | 11,824 |
| Eta | in page | 93,321 | 0.011 | 1.69× slower | 17,067 |
| Squirrelly | in page | 90,496 | 0.011 | 1.74× slower | 17,067 |
| Marko | ahead of time | 74,436 | 0.013 | 2.12× slower | 11,438 |
| doT | in page | 70,050 | 0.014 | 2.25× slower | 17,364 |
| Dust.js | in page | 27,003 | 0.037 | 5.84× slower | 17,328 |
| Handlebars | in page | 20,300 | 0.049 | 7.77× slower | 18,765 |
| Lodash template | in page | 18,793 | 0.053 | 8.39× slower | 17,308 |
| Teddy (tree walk) | in page | 18,571 | 0.054 | 8.49× slower | 17,397 |
| Mustache | in page | 18,486 | 0.054 | 8.53× slower | 18,837 |
| Nunjucks | in page | 12,150 | 0.082 | 12.98× slower | 17,308 |
| art-template | in page | 11,409 | 0.088 | 13.83× slower | 17,308 |
| EJS | in page | 7,259 | 0.138 | 21.73× slower | 17,308 |
| LiquidJS | in page | 507 | 1.97 | 311.32× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 89,195 | 0.011 | 16.53× faster | 1,275 |
| Eta | 32,892 | 0.030 | 6.10× faster | 1,258 |
| Lodash template | 27,702 | 0.036 | 5.14× faster | 1,258 |
| EJS | 26,462 | 0.038 | 4.91× faster | 1,258 |
| Squirrelly | 23,276 | 0.043 | 4.31× faster | 1,258 |
| Mustache | 13,457 | 0.074 | 2.49× faster | 1,278 |
| art-template | 13,173 | 0.076 | 2.44× faster | 1,259 |
| Nunjucks | 7,354 | 0.136 | 1.36× faster | 1,258 |
| Teddy | 5,394 | 0.185 | same | 1,258 |
| LiquidJS | 5,020 | 0.199 | 1.07× slower | 1,258 |
| Handlebars | 4,017 | 0.249 | 1.34× slower | 1,258 |
| Dust.js | 3,231 | 0.309 | 1.67× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 120,406 | 8.3e-3 | 42.95× faster | 492 |
| Lodash template | 41,227 | 0.024 | 14.70× faster | 492 |
| Eta | 40,168 | 0.025 | 14.33× faster | 478 |
| EJS | 37,786 | 0.026 | 13.48× faster | 492 |
| Squirrelly | 24,616 | 0.041 | 8.78× faster | 478 |
| art-template | 13,650 | 0.073 | 4.87× faster | 492 |
| Mustache | 12,669 | 0.079 | 4.52× faster | 454 |
| LiquidJS | 7,827 | 0.128 | 2.79× faster | 492 |
| Nunjucks | 7,791 | 0.128 | 2.78× faster | 492 |
| Handlebars | 3,899 | 0.256 | 1.39× faster | 453 |
| Dust.js | 3,140 | 0.319 | 1.12× faster | 516 |
| Teddy | 2,804 | 0.357 | same | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 75,325 | 0.013 | 21.93× faster | 11,627 |
| Eta | 38,334 | 0.026 | 11.16× faster | 11,425 |
| Squirrelly | 25,846 | 0.039 | 7.52× faster | 11,425 |
| art-template | 25,466 | 0.039 | 7.41× faster | 11,627 |
| Lodash template | 21,434 | 0.047 | 6.24× faster | 11,627 |
| EJS | 12,733 | 0.079 | 3.71× faster | 11,627 |
| Mustache | 11,968 | 0.084 | 3.48× faster | 10,121 |
| Nunjucks | 6,305 | 0.159 | 1.84× faster | 11,627 |
| Handlebars | 5,535 | 0.181 | 1.61× faster | 10,121 |
| Dust.js | 3,595 | 0.278 | 1.05× faster | 11,627 |
| Teddy | 3,435 | 0.291 | same | 11,795 |
| LiquidJS | 1,061 | 0.942 | 3.24× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 6,814 | 0.147 | 4.38× faster | 237,757 |
| art-template | 5,838 | 0.171 | 3.75× faster | 238,758 |
| Squirrelly | 5,290 | 0.189 | 3.40× faster | 237,757 |
| doT | 3,674 | 0.272 | 2.36× faster | 238,758 |
| Handlebars | 2,157 | 0.464 | 1.39× faster | 233,753 |
| Lodash template | 1,787 | 0.560 | 1.15× faster | 238,758 |
| Mustache | 1,678 | 0.596 | 1.08× faster | 233,753 |
| Dust.js | 1,657 | 0.603 | 1.07× faster | 238,758 |
| Teddy | 1,555 | 0.643 | same | 238,758 |
| Nunjucks | 1,477 | 0.677 | 1.05× slower | 238,758 |
| EJS | 728 | 1.37 | 2.14× slower | 238,758 |
| LiquidJS | 47.3 | 21.14 | 32.87× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 46,572 | 0.021 | 19.44× faster | 10,931 |
| Eta | 31,942 | 0.031 | 13.33× faster | 10,672 |
| Squirrelly | 27,367 | 0.037 | 11.42× faster | 10,672 |
| Lodash template | 13,192 | 0.076 | 5.51× faster | 10,883 |
| Mustache | 8,303 | 0.120 | 3.47× faster | 11,708 |
| EJS | 6,240 | 0.160 | 2.60× faster | 10,883 |
| art-template | 4,783 | 0.209 | 2.00× faster | 10,883 |
| Dust.js | 4,732 | 0.211 | 1.98× faster | 10,883 |
| Nunjucks | 3,798 | 0.263 | 1.59× faster | 10,883 |
| Handlebars | 2,681 | 0.373 | 1.12× faster | 11,648 |
| Teddy | 2,396 | 0.417 | same | 10,958 |
| LiquidJS | 545 | 1.83 | 4.40× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 28,069 | 0.036 | 37.30× faster | 17,364 |
| Eta | 25,148 | 0.040 | 33.42× faster | 17,067 |
| Squirrelly | 17,789 | 0.056 | 23.64× faster | 17,067 |
| Lodash template | 12,380 | 0.081 | 16.45× faster | 17,308 |
| Mustache | 5,159 | 0.194 | 6.86× faster | 18,837 |
| EJS | 4,482 | 0.223 | 5.96× faster | 17,308 |
| art-template | 3,883 | 0.258 | 5.16× faster | 17,308 |
| Dust.js | 2,738 | 0.365 | 3.64× faster | 17,328 |
| Nunjucks | 2,376 | 0.421 | 3.16× faster | 17,308 |
| Handlebars | 1,459 | 0.685 | 1.94× faster | 18,765 |
| Teddy | 752 | 1.33 | same | 17,397 |
| LiquidJS | 470 | 2.13 | 1.60× slower | 17,308 |
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

