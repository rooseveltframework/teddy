// this will stop the JS from executing if CSS is disabled or a CSS file fails to load; it will also remove any existing CSS from the DOM
require('check-if-css-is-disabled')()
window.addEventListener('cssDisabled', (event) => {
  // undo any DOM manipulations and then stop any further JS from executing
  document.body.classList.replace('js', 'no-js')
  throw new Error('A CSS file failed to load at some point during the app\'s usage. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
})

// replace no-js class with js class which allows us to write css that targets non-js or js enabled users separately
document.body.classList.replace('no-js', 'js')

// syntax highlighting
const hljs = require('highlight.js')
hljs.highlightAll()

// load teddy demo code
require('teddy-demo')
