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
| Pug | 6 | 1.26× slower |
| Eta | 6 | 1.29× slower |
| Squirrelly | 6 | 1.36× slower |
| Marko | 6 | 1.97× slower |
| doT | 6 | 2.69× slower |
| art-template | 6 | 3.00× slower |
| Dust.js | 6 | 5.82× slower |
| Handlebars | 6 | 6.37× slower |
| Lodash template | 6 | 7.45× slower |
| Mustache | 6 | 9.05× slower |
| Nunjucks | 6 | 9.59× slower |
| EJS | 6 | 17.63× slower |
| PHP (node-php-runner) | 6 | 28.69× slower |
| LiquidJS | 6 | 82.74× slower |

### In Node, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 15.35× faster |
| Eta | 6 | 12.62× faster |
| Squirrelly | 6 | 9.59× faster |
| art-template | 6 | 3.82× faster |
| Mustache | 6 | 3.75× faster |
| Lodash template | 6 | 3.42× faster |
| EJS | 6 | 3.12× faster |
| Handlebars | 6 | 1.47× faster |
| Nunjucks | 6 | 1.43× faster |
| Dust.js | 6 | 1.34× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 1.02× slower |
| PHP (node-php-runner) | 6 | 1.29× slower |
| Pug | 6 | 2.87× slower |
| Marko | 6 | 6.31× slower |

### In a browser, cached

Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-chromium) says more about both.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| Teddy (emitted js) | 6 | same |
| Pug | 6 | 1.23× slower |
| Eta | 6 | 1.29× slower |
| Squirrelly | 6 | 1.41× slower |
| doT | 6 | 1.94× slower |
| Marko | 6 | 2.50× slower |
| art-template | 6 | 2.55× slower |
| Dust.js | 6 | 4.09× slower |
| Handlebars | 6 | 5.35× slower |
| Mustache | 6 | 6.40× slower |
| Teddy (tree walk) | 6 | 6.43× slower |
| Lodash template | 6 | 6.63× slower |
| Nunjucks | 6 | 7.33× slower |
| EJS | 6 | 14.19× slower |
| LiquidJS | 6 | 186.91× slower |
| PHP (node-php-runner) | 0 | cannot run client-side |

### In a browser, cold

Geometric mean of the per scenario ratios to Teddy.

| Engine | Scenarios | vs Teddy |
| --- | --: | --- |
| doT | 6 | 16.44× faster |
| Eta | 6 | 10.70× faster |
| Squirrelly | 6 | 7.28× faster |
| Lodash template | 6 | 5.74× faster |
| art-template | 6 | 3.81× faster |
| EJS | 6 | 3.23× faster |
| Mustache | 6 | 3.02× faster |
| Nunjucks | 6 | 1.71× faster |
| Dust.js | 6 | 1.28× faster |
| Handlebars | 6 | 1.26× faster |
| Teddy | 6 | same |
| LiquidJS | 6 | 2.69× slower |
| Pug | 0 | compiles ahead of time |
| Marko | 0 | compiles ahead of time |
| PHP (node-php-runner) | 0 | cannot run client-side |

## cached (render only, template already compiled)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 1,230,634 | 8.3e-4 | 0.2 | 1.62× faster | 1,259 |
| Teddy | 2.3.0 | 760,408 | 1.3e-3 | 0.2 | same | 1,258 |
| Eta | 4.6.0 | 639,265 | 1.6e-3 | 1.1 | 1.19× slower | 1,258 |
| Pug | 3.0.4 | 618,656 | 1.6e-3 | 0.2 | 1.23× slower | 1,158 |
| Squirrelly | 9.1.1 | 576,786 | 1.8e-3 | 0.2 | 1.32× slower | 1,258 |
| Marko | 6.3.51 | 507,837 | 2.0e-3 | 0.3 | 1.50× slower | 1,140 |
| doT | 1.1.3 | 385,681 | 2.7e-3 | 0.4 | 1.97× slower | 1,275 |
| Handlebars | 4.7.9 | 355,109 | 2.9e-3 | 0.2 | 2.14× slower | 1,258 |
| Nunjucks | 3.2.4 | 297,233 | 3.4e-3 | 0.1 | 2.56× slower | 1,258 |
| Lodash template | 4.18.1 | 240,887 | 4.2e-3 | 0.1 | 3.16× slower | 1,258 |
| Dust.js | 3.0.1 | 240,665 | 4.2e-3 | 0.1 | 3.16× slower | 1,258 |
| Mustache | 4.2.0 | 179,927 | 5.6e-3 | 0.2 | 4.23× slower | 1,278 |
| EJS | 6.0.1 | 125,227 | 8.0e-3 | 0.1 | 6.07× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 44,424 | 0.024 | 1.0 | 17.12× slower | 1,258 |
| LiquidJS | 10.29.0 | 26,818 | 0.038 | 0.2 | 28.35× slower | 1,258 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Squirrelly | 9.1.1 | 10,532,144 | 1.0e-4 | 1.6 | 1.61× faster | 478 |
| art-template | 4.13.4 | 10,046,454 | 1.0e-4 | 1.4 | 1.54× faster | 492 |
| Eta | 4.6.0 | 9,967,094 | 1.1e-4 | 2.6 | 1.53× faster | 478 |
| Pug | 3.0.4 | 9,696,268 | 1.1e-4 | 0.2 | 1.48× faster | 410 |
| Teddy | 2.3.0 | 6,533,758 | 1.6e-4 | 0.2 | same | 516 |
| doT | 1.1.3 | 5,321,162 | 1.9e-4 | 0.6 | 1.23× slower | 492 |
| Marko | 6.3.51 | 1,702,631 | 6.1e-4 | 1.0 | 3.84× slower | 392 |
| Nunjucks | 3.2.4 | 1,160,528 | 8.9e-4 | 0.2 | 5.63× slower | 492 |
| Dust.js | 3.0.1 | 928,847 | 1.1e-3 | 0.9 | 7.03× slower | 516 |
| Mustache | 4.2.0 | 535,201 | 1.9e-3 | 0.1 | 12.21× slower | 454 |
| Lodash template | 4.18.1 | 525,768 | 1.9e-3 | 0.1 | 12.43× slower | 492 |
| Handlebars | 4.7.9 | 490,580 | 2.1e-3 | 0.3 | 13.32× slower | 453 |
| EJS | 6.0.1 | 377,000 | 2.7e-3 | 0.1 | 17.33× slower | 492 |
| PHP (node-php-runner) | 2.0.0 | 69,852 | 0.015 | 0.3 | 93.54× slower | 478 |
| LiquidJS | 10.29.0 | 68,375 | 0.015 | 0.2 | 95.56× slower | 492 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.0 | 310,372 | 3.3e-3 | 0.2 | same | 11,795 |
| art-template | 4.13.4 | 242,857 | 4.2e-3 | 0.2 | 1.28× slower | 11,627 |
| Eta | 4.6.0 | 231,430 | 4.4e-3 | 0.2 | 1.34× slower | 11,425 |
| Pug | 3.0.4 | 213,236 | 4.8e-3 | 0.2 | 1.46× slower | 7,782 |
| Squirrelly | 9.1.1 | 182,813 | 5.6e-3 | 0.2 | 1.70× slower | 11,425 |
| Marko | 6.3.51 | 164,180 | 6.2e-3 | 0.2 | 1.89× slower | 7,474 |
| doT | 1.1.3 | 82,416 | 0.012 | 0.2 | 3.77× slower | 11,627 |
| Handlebars | 4.7.9 | 46,879 | 0.022 | 0.3 | 6.62× slower | 10,121 |
| Dust.js | 3.0.1 | 42,362 | 0.024 | 0.2 | 7.33× slower | 11,627 |
| Mustache | 4.2.0 | 37,126 | 0.027 | 0.1 | 8.36× slower | 10,121 |
| Lodash template | 4.18.1 | 36,705 | 0.028 | 0.2 | 8.46× slower | 11,627 |
| Nunjucks | 3.2.4 | 17,257 | 0.058 | 0.1 | 17.99× slower | 11,627 |
| EJS | 6.0.1 | 17,199 | 0.058 | 0.1 | 18.05× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 12,536 | 0.081 | 0.3 | 24.76× slower | 11,425 |
| LiquidJS | 10.29.0 | 2,707 | 0.370 | 0.2 | 114.66× slower | 11,627 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.0 | 10,243 | 0.100 | 0.5 | same | 238,758 |
| Eta | 4.6.0 | 8,031 | 0.126 | 0.3 | 1.28× slower | 237,757 |
| art-template | 4.13.4 | 7,348 | 0.140 | 0.6 | 1.39× slower | 238,758 |
| Marko | 6.3.51 | 6,944 | 0.145 | 0.3 | 1.48× slower | 156,732 |
| Pug | 3.0.4 | 6,674 | 0.153 | 0.5 | 1.53× slower | 156,734 |
| Squirrelly | 9.1.1 | 6,649 | 0.152 | 0.3 | 1.54× slower | 237,757 |
| doT | 1.1.3 | 2,773 | 0.364 | 0.5 | 3.69× slower | 238,758 |
| Handlebars | 4.7.9 | 2,615 | 0.387 | 0.6 | 3.92× slower | 233,753 |
| Lodash template | 4.18.1 | 1,751 | 0.573 | 0.3 | 5.85× slower | 238,758 |
| Dust.js | 3.0.1 | 1,748 | 0.574 | 0.3 | 5.86× slower | 238,758 |
| Mustache | 4.2.0 | 1,357 | 0.740 | 0.4 | 7.55× slower | 233,753 |
| Nunjucks | 3.2.4 | 1,158 | 0.866 | 0.3 | 8.85× slower | 238,758 |
| EJS | 6.0.1 | 678 | 1.48 | 0.2 | 15.10× slower | 238,758 |
| PHP (node-php-runner) | 2.0.0 | 547 | 1.87 | 1.7 | 18.73× slower | 237,757 |
| LiquidJS | 10.29.0 | 104 | 9.61 | 0.9 | 98.26× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.0 | 221,030 | 4.6e-3 | 0.3 | same | 10,958 |
| Pug | 3.0.4 | 148,836 | 6.8e-3 | 0.2 | 1.49× slower | 8,611 |
| Squirrelly | 9.1.1 | 126,384 | 8.1e-3 | 0.2 | 1.75× slower | 10,672 |
| Eta | 4.6.0 | 110,032 | 9.2e-3 | 0.2 | 2.01× slower | 10,672 |
| Marko | 6.3.51 | 108,715 | 9.3e-3 | 0.2 | 2.03× slower | 8,247 |
| doT | 1.1.3 | 66,446 | 0.015 | 0.1 | 3.33× slower | 10,931 |
| Dust.js | 3.0.1 | 35,024 | 0.029 | 0.2 | 6.31× slower | 10,883 |
| Lodash template | 4.18.1 | 22,207 | 0.045 | 0.1 | 9.95× slower | 10,883 |
| Handlebars | 4.7.9 | 21,051 | 0.048 | 0.2 | 10.50× slower | 11,648 |
| Mustache | 4.2.0 | 16,163 | 0.062 | 0.2 | 13.68× slower | 11,708 |
| Nunjucks | 3.2.4 | 10,340 | 0.112 | 3.3 | 21.38× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 7,778 | 0.130 | 0.3 | 28.42× slower | 10,672 |
| EJS | 6.0.1 | 6,155 | 0.163 | 0.2 | 35.91× slower | 10,883 |
| art-template | 4.13.4 | 5,811 | 0.180 | 1.5 | 38.03× slower | 10,883 |
| LiquidJS | 10.29.0 | 2,116 | 0.476 | 0.4 | 104.44× slower | 10,883 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| Teddy | 2.3.0 | 152,409 | 6.7e-3 | 0.3 | same | 17,397 |
| Pug | 3.0.4 | 104,739 | 9.7e-3 | 0.2 | 1.46× slower | 11,824 |
| Squirrelly | 9.1.1 | 91,748 | 0.011 | 0.2 | 1.66× slower | 17,067 |
| Eta | 4.6.0 | 86,670 | 0.012 | 0.2 | 1.76× slower | 17,067 |
| Marko | 6.3.51 | 83,895 | 0.012 | 0.3 | 1.82× slower | 11,438 |
| doT | 1.1.3 | 45,294 | 0.022 | 0.1 | 3.36× slower | 17,364 |
| Dust.js | 3.0.1 | 23,511 | 0.043 | 0.2 | 6.48× slower | 17,328 |
| Handlebars | 4.7.9 | 17,704 | 0.057 | 0.2 | 8.61× slower | 18,765 |
| Lodash template | 4.18.1 | 17,271 | 0.058 | 0.1 | 8.82× slower | 17,308 |
| Mustache | 4.2.0 | 12,337 | 0.081 | 0.2 | 12.35× slower | 18,837 |
| Nunjucks | 3.2.4 | 9,568 | 0.121 | 3.3 | 15.93× slower | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 5,762 | 0.176 | 0.3 | 26.45× slower | 17,067 |
| art-template | 4.13.4 | 5,729 | 0.182 | 1.4 | 26.60× slower | 17,308 |
| EJS | 6.0.1 | 5,223 | 0.192 | 0.2 | 29.18× slower | 17,308 |
| LiquidJS | 10.29.0 | 1,514 | 0.663 | 0.4 | 100.65× slower | 17,308 |

## cold (compile and render together, engine cache off)

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 41,137 | 0.024 | 0.1 | 13.54× faster | 1,275 |
| Eta | 4.6.0 | 20,898 | 0.048 | 0.2 | 6.88× faster | 1,258 |
| EJS | 6.0.1 | 18,228 | 0.056 | 0.4 | 6.00× faster | 1,258 |
| Squirrelly | 9.1.1 | 15,830 | 0.064 | 0.2 | 5.21× faster | 1,258 |
| art-template | 4.13.4 | 11,748 | 0.087 | 0.5 | 3.87× faster | 1,259 |
| Mustache | 4.2.0 | 9,225 | 0.110 | 0.4 | 3.04× faster | 1,278 |
| Lodash template | 4.18.1 | 8,573 | 0.121 | 1.6 | 2.82× faster | 1,258 |
| LiquidJS | 10.29.0 | 7,213 | 0.144 | 1.1 | 2.37× faster | 1,258 |
| Nunjucks | 3.2.4 | 6,681 | 0.151 | 0.5 | 2.20× faster | 1,258 |
| Teddy | 2.3.0 | 3,037 | 0.341 | 1.1 | same | 1,258 |
| Handlebars | 4.7.9 | 2,491 | 0.411 | 1.0 | 1.22× slower | 1,258 |
| Dust.js | 3.0.1 | 1,847 | 0.548 | 0.7 | 1.64× slower | 1,258 |
| PHP (node-php-runner) | 2.0.0 | 1,733 | 0.934 | 2.1 | 1.75× slower | 1,258 |
| Pug | 3.0.4 | 403 | 2.50 | 1.0 | 7.54× slower | 1,158 |
| Marko | 6.3.51 | 309 | 3.43 | 3.7 | 9.83× slower | 1,140 |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 52,323 | 0.019 | 0.2 | 52.76× faster | 492 |
| EJS | 6.0.1 | 25,048 | 0.040 | 0.2 | 25.26× faster | 492 |
| Eta | 4.6.0 | 23,729 | 0.042 | 0.2 | 23.93× faster | 478 |
| Squirrelly | 9.1.1 | 16,572 | 0.061 | 0.2 | 16.71× faster | 478 |
| art-template | 4.13.4 | 16,313 | 0.063 | 0.5 | 16.45× faster | 492 |
| LiquidJS | 10.29.0 | 12,186 | 0.088 | 1.7 | 12.29× faster | 492 |
| Lodash template | 4.18.1 | 9,313 | 0.113 | 1.7 | 9.39× faster | 492 |
| Mustache | 4.2.0 | 8,462 | 0.119 | 0.3 | 8.53× faster | 454 |
| Nunjucks | 3.2.4 | 5,814 | 0.173 | 0.2 | 5.86× faster | 492 |
| PHP (node-php-runner) | 2.0.0 | 3,056 | 0.820 | 2.6 | 3.08× faster | 478 |
| Handlebars | 4.7.9 | 2,451 | 0.416 | 0.7 | 2.47× faster | 453 |
| Dust.js | 3.0.1 | 1,865 | 0.538 | 0.3 | 1.88× faster | 516 |
| Teddy | 2.3.0 | 992 | 1.03 | 1.0 | same | 516 |
| Pug | 3.0.4 | 727 | 1.38 | 0.6 | 1.36× slower | 410 |
| Marko | 6.3.51 | 191 | 5.47 | 3.8 | 5.20× slower | 392 |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 34,391 | 0.029 | 0.2 | 14.81× faster | 11,627 |
| Eta | 4.6.0 | 23,288 | 0.044 | 0.3 | 10.03× faster | 11,425 |
| art-template | 4.13.4 | 20,899 | 0.050 | 0.6 | 9.00× faster | 11,627 |
| Squirrelly | 9.1.1 | 17,039 | 0.059 | 0.2 | 7.34× faster | 11,425 |
| EJS | 6.0.1 | 11,866 | 0.085 | 0.2 | 5.11× faster | 11,627 |
| Mustache | 4.2.0 | 8,914 | 0.113 | 0.2 | 3.84× faster | 10,121 |
| Lodash template | 4.18.1 | 6,681 | 0.157 | 1.4 | 2.88× faster | 11,627 |
| Nunjucks | 3.2.4 | 5,768 | 0.175 | 0.3 | 2.48× faster | 11,627 |
| Handlebars | 4.7.9 | 3,890 | 0.262 | 0.8 | 1.68× faster | 10,121 |
| Dust.js | 3.0.1 | 2,483 | 0.405 | 0.4 | 1.07× faster | 11,627 |
| Teddy | 2.3.0 | 2,322 | 0.441 | 0.9 | same | 11,795 |
| LiquidJS | 10.29.0 | 2,213 | 0.459 | 0.6 | 1.05× slower | 11,627 |
| PHP (node-php-runner) | 2.0.0 | 942 | 1.08 | 0.7 | 2.46× slower | 11,425 |
| Pug | 3.0.4 | 729 | 1.38 | 0.6 | 3.19× slower | 7,782 |
| Marko | 6.3.51 | 399 | 2.65 | 3.5 | 5.82× slower | 7,474 |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| art-template | 4.13.4 | 5,900 | 0.173 | 0.5 | 2.39× faster | 238,758 |
| Eta | 4.6.0 | 5,655 | 0.180 | 0.5 | 2.29× faster | 237,757 |
| Squirrelly | 9.1.1 | 4,753 | 0.213 | 0.4 | 1.92× faster | 237,757 |
| doT | 1.1.3 | 2,620 | 0.385 | 0.5 | 1.06× faster | 238,758 |
| Teddy | 2.3.0 | 2,470 | 0.416 | 1.0 | same | 238,758 |
| Handlebars | 4.7.9 | 1,787 | 0.569 | 0.9 | 1.38× slower | 233,753 |
| Mustache | 4.2.0 | 1,230 | 0.818 | 0.5 | 2.01× slower | 233,753 |
| Lodash template | 4.18.1 | 1,160 | 1.26 | 13.7 | 2.13× slower | 238,758 |
| Nunjucks | 3.2.4 | 1,007 | 0.996 | 0.4 | 2.45× slower | 238,758 |
| Dust.js | 3.0.1 | 983 | 1.03 | 1.3 | 2.51× slower | 238,758 |
| Pug | 3.0.4 | 723 | 1.40 | 1.0 | 3.42× slower | 156,734 |
| EJS | 6.0.1 | 665 | 1.50 | 0.2 | 3.71× slower | 238,758 |
| Marko | 6.3.51 | 505 | 2.08 | 3.3 | 4.89× slower | 156,732 |
| PHP (node-php-runner) | 2.0.0 | 487 | 2.09 | 1.4 | 5.07× slower | 237,757 |
| LiquidJS | 10.29.0 | 98.9 | 10.13 | 0.8 | 24.98× slower | 238,758 |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 25,069 | 0.041 | 0.3 | 24.65× faster | 10,931 |
| Eta | 4.6.0 | 23,076 | 0.044 | 0.2 | 22.69× faster | 10,672 |
| Squirrelly | 9.1.1 | 18,263 | 0.055 | 0.2 | 17.96× faster | 10,672 |
| Mustache | 4.2.0 | 5,397 | 0.187 | 0.3 | 5.31× faster | 11,708 |
| Lodash template | 4.18.1 | 4,604 | 0.223 | 0.9 | 4.53× faster | 10,883 |
| Dust.js | 3.0.1 | 2,859 | 0.353 | 0.4 | 2.81× faster | 10,883 |
| Handlebars | 4.7.9 | 1,574 | 0.649 | 1.0 | 1.55× faster | 11,648 |
| EJS | 6.0.1 | 1,325 | 0.756 | 0.2 | 1.30× faster | 10,883 |
| Teddy | 2.3.0 | 1,017 | 1.01 | 1.4 | same | 10,958 |
| art-template | 4.13.4 | 958 | 1.06 | 1.2 | 1.06× slower | 10,883 |
| PHP (node-php-runner) | 2.0.0 | 755 | 1.35 | 1.1 | 1.35× slower | 10,672 |
| LiquidJS | 10.29.0 | 574 | 1.76 | 0.9 | 1.77× slower | 10,883 |
| Nunjucks | 3.2.4 | 459 | 2.19 | 0.7 | 2.22× slower | 10,883 |
| Pug | 3.0.4 | 370 | 2.71 | 0.6 | 2.75× slower | 8,611 |
| Marko | 6.3.51 | 106 | 9.78 | 5.2 | 9.59× slower | 8,247 |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |
| --- | --- | --: | --: | --: | --- | --: |
| doT | 1.1.3 | 16,815 | 0.060 | 0.2 | 47.20× faster | 17,364 |
| Eta | 4.6.0 | 16,757 | 0.060 | 0.2 | 47.04× faster | 17,067 |
| Squirrelly | 9.1.1 | 12,539 | 0.080 | 0.2 | 35.20× faster | 17,067 |
| Mustache | 4.2.0 | 3,750 | 0.268 | 0.4 | 10.53× faster | 18,837 |
| Lodash template | 4.18.1 | 3,504 | 0.290 | 0.8 | 9.84× faster | 17,308 |
| Dust.js | 3.0.1 | 1,517 | 0.668 | 2.1 | 4.26× faster | 17,328 |
| EJS | 6.0.1 | 1,205 | 0.831 | 0.2 | 3.38× faster | 17,308 |
| Handlebars | 4.7.9 | 944 | 1.07 | 0.8 | 2.65× faster | 18,765 |
| art-template | 4.13.4 | 861 | 1.17 | 0.8 | 2.42× faster | 17,308 |
| PHP (node-php-runner) | 2.0.0 | 754 | 1.33 | 0.5 | 2.12× faster | 17,067 |
| Nunjucks | 3.2.4 | 519 | 1.95 | 1.1 | 1.46× faster | 17,308 |
| LiquidJS | 10.29.0 | 501 | 2.00 | 0.4 | 1.41× faster | 17,308 |
| Teddy | 2.3.0 | 356 | 2.83 | 1.0 | same | 17,397 |
| Pug | 3.0.4 | 198 | 5.06 | 0.6 | 1.80× slower | 11,824 |
| Marko | 6.3.51 | 78.8 | 12.93 | 3.3 | 4.52× slower | 11,438 |

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
| art-template | in page | 1,122,272 | 8.9e-4 | 1.38× faster | 1,259 |
| Pug | ahead of time | 848,710 | 1.2e-3 | 1.05× faster | 1,158 |
| Teddy (emitted js) | ahead of time | 811,021 | 1.2e-3 | same | 1,258 |
| Eta | in page | 739,130 | 1.4e-3 | 1.10× slower | 1,258 |
| Squirrelly | in page | 700,332 | 1.4e-3 | 1.16× slower | 1,258 |
| doT | in page | 550,174 | 1.8e-3 | 1.47× slower | 1,275 |
| Teddy (tree walk) | in page | 422,305 | 2.4e-3 | 1.92× slower | 1,258 |
| Handlebars | in page | 413,496 | 2.4e-3 | 1.96× slower | 1,258 |
| Marko | ahead of time | 408,659 | 2.4e-3 | 1.98× slower | 1,140 |
| Nunjucks | in page | 347,046 | 2.9e-3 | 2.34× slower | 1,258 |
| Dust.js | in page | 311,203 | 3.2e-3 | 2.61× slower | 1,258 |
| Lodash template | in page | 279,439 | 3.6e-3 | 2.90× slower | 1,258 |
| Mustache | in page | 244,528 | 4.1e-3 | 3.32× slower | 1,278 |
| EJS | in page | 146,116 | 6.8e-3 | 5.55× slower | 1,258 |
| LiquidJS | in page | 14,046 | 0.071 | 57.74× slower | 1,258 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| art-template | in page | 5,691,407 | 1.8e-4 | 1.26× faster | 492 |
| Eta | in page | 5,681,277 | 1.8e-4 | 1.26× faster | 478 |
| Squirrelly | in page | 5,597,673 | 1.8e-4 | 1.24× faster | 478 |
| Pug | ahead of time | 5,473,833 | 1.8e-4 | 1.21× faster | 410 |
| doT | in page | 4,618,051 | 2.2e-4 | 1.02× faster | 492 |
| Teddy (emitted js) | ahead of time | 4,515,713 | 2.2e-4 | same | 516 |
| Nunjucks | in page | 1,143,211 | 8.7e-4 | 3.95× slower | 492 |
| Dust.js | in page | 1,026,219 | 9.7e-4 | 4.40× slower | 516 |
| Marko | ahead of time | 741,186 | 1.3e-3 | 6.09× slower | 392 |
| Teddy (tree walk) | in page | 721,229 | 1.4e-3 | 6.26× slower | 516 |
| Mustache | in page | 625,301 | 1.6e-3 | 7.22× slower | 454 |
| Lodash template | in page | 568,188 | 1.8e-3 | 7.95× slower | 492 |
| Handlebars | in page | 535,234 | 1.9e-3 | 8.44× slower | 453 |
| EJS | in page | 407,891 | 2.5e-3 | 11.07× slower | 492 |
| LiquidJS | in page | 31,390 | 0.032 | 143.86× slower | 492 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 331,724 | 3.0e-3 | same | 11,795 |
| art-template | in page | 279,436 | 3.6e-3 | 1.19× slower | 11,627 |
| Eta | in page | 266,760 | 3.7e-3 | 1.24× slower | 11,425 |
| Pug | ahead of time | 220,775 | 4.5e-3 | 1.50× slower | 7,782 |
| Squirrelly | in page | 187,251 | 5.3e-3 | 1.77× slower | 11,425 |
| Marko | ahead of time | 136,009 | 7.4e-3 | 2.44× slower | 7,474 |
| doT | in page | 127,488 | 7.8e-3 | 2.60× slower | 11,627 |
| Dust.js | in page | 64,570 | 0.015 | 5.14× slower | 11,627 |
| Handlebars | in page | 54,332 | 0.018 | 6.11× slower | 10,121 |
| Mustache | in page | 51,653 | 0.019 | 6.42× slower | 10,121 |
| Lodash template | in page | 40,311 | 0.025 | 8.23× slower | 11,627 |
| Nunjucks | in page | 26,229 | 0.038 | 12.65× slower | 11,627 |
| Teddy (tree walk) | in page | 24,503 | 0.041 | 13.54× slower | 11,795 |
| EJS | in page | 19,416 | 0.052 | 17.09× slower | 11,627 |
| LiquidJS | in page | 1,287 | 0.777 | 257.80× slower | 11,627 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 10,162 | 0.098 | same | 238,758 |
| Eta | in page | 8,272 | 0.121 | 1.23× slower | 237,757 |
| art-template | in page | 7,445 | 0.134 | 1.36× slower | 238,758 |
| Pug | ahead of time | 7,026 | 0.142 | 1.45× slower | 156,734 |
| Squirrelly | in page | 6,611 | 0.151 | 1.54× slower | 237,757 |
| Marko | ahead of time | 6,568 | 0.152 | 1.55× slower | 156,732 |
| doT | in page | 3,999 | 0.250 | 2.54× slower | 238,758 |
| Handlebars | in page | 3,092 | 0.323 | 3.29× slower | 233,753 |
| Dust.js | in page | 2,587 | 0.387 | 3.93× slower | 238,758 |
| Teddy (tree walk) | in page | 2,100 | 0.476 | 4.84× slower | 238,758 |
| Mustache | in page | 1,899 | 0.527 | 5.35× slower | 233,753 |
| Lodash template | in page | 1,878 | 0.533 | 5.41× slower | 238,758 |
| Nunjucks | in page | 1,698 | 0.589 | 5.99× slower | 238,758 |
| EJS | in page | 763 | 1.31 | 13.33× slower | 238,758 |
| LiquidJS | in page | 50.6 | 19.78 | 200.99× slower | 238,758 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 240,230 | 4.2e-3 | same | 10,958 |
| Pug | ahead of time | 167,231 | 6.0e-3 | 1.44× slower | 8,611 |
| Squirrelly | in page | 129,850 | 7.7e-3 | 1.85× slower | 10,672 |
| Eta | in page | 115,210 | 8.7e-3 | 2.09× slower | 10,672 |
| doT | in page | 100,926 | 9.9e-3 | 2.38× slower | 10,931 |
| Marko | ahead of time | 95,199 | 0.011 | 2.52× slower | 8,247 |
| Dust.js | in page | 52,750 | 0.019 | 4.55× slower | 10,883 |
| Handlebars | in page | 25,888 | 0.039 | 9.28× slower | 11,648 |
| Mustache | in page | 25,532 | 0.039 | 9.41× slower | 11,708 |
| Lodash template | in page | 24,746 | 0.040 | 9.71× slower | 10,883 |
| Teddy (tree walk) | in page | 22,712 | 0.044 | 10.58× slower | 10,958 |
| Nunjucks | in page | 14,305 | 0.070 | 16.79× slower | 10,883 |
| art-template | in page | 11,244 | 0.089 | 21.37× slower | 10,883 |
| EJS | in page | 8,985 | 0.111 | 26.74× slower | 10,883 |
| LiquidJS | in page | 708 | 1.41 | 339.27× slower | 10,883 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --- | --: | --: | --- | --: |
| Teddy (emitted js) | ahead of time | 158,516 | 6.3e-3 | same | 17,397 |
| Pug | ahead of time | 112,172 | 8.9e-3 | 1.41× slower | 11,824 |
| Eta | in page | 94,129 | 0.011 | 1.68× slower | 17,067 |
| Squirrelly | in page | 93,661 | 0.011 | 1.69× slower | 17,067 |
| Marko | ahead of time | 73,881 | 0.014 | 2.15× slower | 11,438 |
| doT | in page | 68,368 | 0.015 | 2.32× slower | 17,364 |
| Dust.js | in page | 35,690 | 0.028 | 4.44× slower | 17,328 |
| Handlebars | in page | 20,894 | 0.048 | 7.59× slower | 18,765 |
| Lodash template | in page | 18,668 | 0.054 | 8.49× slower | 17,308 |
| Teddy (tree walk) | in page | 18,641 | 0.054 | 8.50× slower | 17,397 |
| Mustache | in page | 17,911 | 0.056 | 8.85× slower | 18,837 |
| Nunjucks | in page | 12,002 | 0.083 | 13.21× slower | 17,308 |
| art-template | in page | 11,488 | 0.087 | 13.80× slower | 17,308 |
| EJS | in page | 7,275 | 0.137 | 21.79× slower | 17,308 |
| LiquidJS | in page | 543 | 1.84 | 291.96× slower | 17,308 |
| PHP (node-php-runner) | — | — | — | cannot run client-side | — |

Engines with nothing a browser can run:

- **PHP (node-php-runner)**: not a javascript engine, so there is nothing a browser can run either way

## In a browser, cold (chromium)

The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.

### Variables

28 interpolations, one of them escaped html and one of them raw html. Measures the cost of looking a value up in the model and writing it out.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 95,643 | 0.010 | 16.28× faster | 1,275 |
| Eta | 35,174 | 0.028 | 5.99× faster | 1,258 |
| Lodash template | 28,477 | 0.035 | 4.85× faster | 1,258 |
| EJS | 26,500 | 0.038 | 4.51× faster | 1,258 |
| Squirrelly | 23,512 | 0.043 | 4.00× faster | 1,258 |
| Mustache | 14,067 | 0.071 | 2.40× faster | 1,278 |
| art-template | 13,770 | 0.073 | 2.34× faster | 1,259 |
| Nunjucks | 7,427 | 0.135 | 1.26× faster | 1,258 |
| Teddy | 5,873 | 0.170 | same | 1,258 |
| LiquidJS | 5,306 | 0.188 | 1.11× slower | 1,258 |
| Handlebars | 4,238 | 0.236 | 1.39× slower | 1,258 |
| Dust.js | 3,283 | 0.305 | 1.79× slower | 1,258 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Conditionals

8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition. Measures the cost of evaluating a branch and discarding the branch not taken.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 143,406 | 7.0e-3 | 47.27× faster | 492 |
| Eta | 42,248 | 0.024 | 13.92× faster | 478 |
| Lodash template | 42,095 | 0.024 | 13.87× faster | 492 |
| EJS | 39,063 | 0.026 | 12.88× faster | 492 |
| Squirrelly | 26,480 | 0.038 | 8.73× faster | 478 |
| art-template | 19,593 | 0.051 | 6.46× faster | 492 |
| Mustache | 13,807 | 0.072 | 4.55× faster | 454 |
| LiquidJS | 8,516 | 0.117 | 2.81× faster | 492 |
| Nunjucks | 8,278 | 0.121 | 2.73× faster | 492 |
| Handlebars | 4,267 | 0.234 | 1.41× faster | 453 |
| Dust.js | 3,386 | 0.295 | 1.12× faster | 516 |
| Teddy | 3,034 | 0.330 | same | 516 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Loops

24 products, each with a branch and a nested loop over 3 tags. Measures nested iteration with per-iteration branching.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 78,159 | 0.013 | 16.57× faster | 11,627 |
| Eta | 41,822 | 0.024 | 8.87× faster | 11,425 |
| Squirrelly | 25,962 | 0.039 | 5.51× faster | 11,425 |
| art-template | 25,234 | 0.040 | 5.35× faster | 11,627 |
| Lodash template | 22,273 | 0.045 | 4.72× faster | 11,627 |
| EJS | 14,787 | 0.068 | 3.14× faster | 11,627 |
| Mustache | 14,461 | 0.069 | 3.07× faster | 10,121 |
| Nunjucks | 8,106 | 0.123 | 1.72× faster | 11,627 |
| Handlebars | 6,792 | 0.147 | 1.44× faster | 10,121 |
| Teddy | 4,716 | 0.212 | same | 11,795 |
| Dust.js | 4,502 | 0.222 | 1.05× slower | 11,627 |
| LiquidJS | 1,130 | 0.885 | 4.17× slower | 11,627 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Large table

1,000 rows of 7 cells, one of them conditional. Measures how the engine scales when the same small body is rendered many times.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| Eta | 7,156 | 0.140 | 4.39× faster | 237,757 |
| art-template | 6,063 | 0.165 | 3.72× faster | 238,758 |
| Squirrelly | 5,425 | 0.184 | 3.33× faster | 237,757 |
| doT | 3,935 | 0.254 | 2.41× faster | 238,758 |
| Handlebars | 2,285 | 0.438 | 1.40× faster | 233,753 |
| Lodash template | 1,805 | 0.554 | 1.11× faster | 238,758 |
| Dust.js | 1,731 | 0.578 | 1.06× faster | 238,758 |
| Mustache | 1,717 | 0.583 | 1.05× faster | 233,753 |
| Teddy | 1,630 | 0.614 | same | 238,758 |
| Nunjucks | 1,510 | 0.662 | 1.08× slower | 238,758 |
| EJS | 758 | 1.32 | 2.15× slower | 238,758 |
| LiquidJS | 49.4 | 20.24 | 32.99× slower | 238,758 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Partials

a shell that pulls in a header and a footer once and a product partial 24 times. Measures the per-call overhead of including another template.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 48,573 | 0.021 | 18.96× faster | 10,931 |
| Eta | 40,000 | 0.025 | 15.61× faster | 10,672 |
| Squirrelly | 28,149 | 0.036 | 10.99× faster | 10,672 |
| Lodash template | 17,499 | 0.057 | 6.83× faster | 10,883 |
| Mustache | 8,823 | 0.113 | 3.44× faster | 11,708 |
| EJS | 6,389 | 0.157 | 2.49× faster | 10,883 |
| art-template | 5,526 | 0.181 | 2.16× faster | 10,883 |
| Dust.js | 5,503 | 0.182 | 2.15× faster | 10,883 |
| Nunjucks | 4,093 | 0.244 | 1.60× faster | 10,883 |
| Handlebars | 2,812 | 0.356 | 1.10× faster | 11,648 |
| Teddy | 2,562 | 0.390 | same | 10,958 |
| LiquidJS | 644 | 1.55 | 3.98× slower | 10,883 |
| Pug | — | — | compiles ahead of time | — |
| Marko | — | — | compiles ahead of time | — |
| PHP (node-php-runner) | — | — | cannot run client-side | — |

### Full page

a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer. Measures everything above at once, which is the closest thing here to a real request.

| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |
| --- | --: | --: | --- | --: |
| doT | 28,705 | 0.035 | 33.84× faster | 17,364 |
| Eta | 25,127 | 0.040 | 29.62× faster | 17,067 |
| Squirrelly | 17,984 | 0.056 | 21.20× faster | 17,067 |
| Lodash template | 12,670 | 0.079 | 14.94× faster | 17,308 |
| Mustache | 5,349 | 0.187 | 6.31× faster | 18,837 |
| EJS | 4,587 | 0.218 | 5.41× faster | 17,308 |
| art-template | 3,972 | 0.252 | 4.68× faster | 17,308 |
| Dust.js | 2,799 | 0.357 | 3.30× faster | 17,328 |
| Nunjucks | 2,415 | 0.414 | 2.85× faster | 17,308 |
| Handlebars | 1,505 | 0.664 | 1.77× faster | 18,765 |
| Teddy | 848 | 1.18 | same | 17,397 |
| LiquidJS | 480 | 2.08 | 1.77× slower | 17,308 |
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

