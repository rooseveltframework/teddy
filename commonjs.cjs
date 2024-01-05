const teddy = require('./dist/teddy.cjs')

console.log(teddy.render('<p>{message}</p>', { message: 'a message' }))
