// define data for the templates
var model = {
  one: 'Partial template one.html has rendered successfully!',
  two: 'Partial template two.html has rendered successfully!',
  three: 'Partial template three.html has rendered successfully!'
},

// render the templates
renderedOne = teddy.render(teddy.compiledTemplates['one.html'], model),
renderedTwo = teddy.render(teddy.compiledTemplates['two.html'], model),
renderedThree = teddy.render(teddy.compiledTemplates['three.html'], model);

// write rendered templates to the DOM
document.body.insertAdjacentHTML('beforeend', renderedOne);
document.body.insertAdjacentHTML('beforeend', renderedTwo);
document.body.insertAdjacentHTML('beforeend', renderedThree);