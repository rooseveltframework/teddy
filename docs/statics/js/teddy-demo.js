const teddy = require('teddy/client')

document.querySelectorAll('.teddy-live-demo').forEach((form) => {
  form.querySelector('output').innerHTML = ''
  form.querySelector('fieldset').appendChild(document.createElement('iframe'))
  form.querySelector('iframe').srcdoc = 'Click the "Render" button. Rendered template output will go here.'
  form.querySelector('button').addEventListener('click', (event) => {
    event.preventDefault()
    let json
    try {
      json = JSON.parse(form.querySelector('.model').value || '{}')
    } catch (e) {
      console.error(e)
      window.alert('Teddy could not parse your JSON data! Please ensure it is valid JSON data.')
    }
    try {
      teddy.setTemplate('live-demo', form.querySelector('.template').value || '')
      if (form.querySelector('.other-template')) teddy.setTemplate('other-template', form.querySelector('.other-template').value || '')
      form.querySelector('iframe').srcdoc = teddy.render('live-demo', json)
    } catch (e) {
      console.error(e)
      window.alert('Teddy could not render the template! Please ensure there are no typos.')
    }
  })
})
