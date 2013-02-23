/**
 * Sample client-server Express app using Teddy (client portion)
 * @author Eric Newport (kethinov)
 * @license Creative Commons Attribution 3.0 Unported License http://creativecommons.org/licenses/by/3.0/deed.en_US
 */

/*! @source https://github.com/kethinov/teddy */
/*jshint camelcase: true, curly: true, eqeqeq: false, forin: false, strict: false, trailing: true, evil: true, devel: true, browser: true */

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