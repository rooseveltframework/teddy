// this file starts a development server that rebuilds the docs site as you edit it
//
// pass roosevelt's `--build` flag to write the site out without serving it, which is what `npm run build` and `npm run build-dev` do; in development mode roosevelt rebuilds the pages you edit and reloads the browser itself
;(async () => {
  await require('roosevelt')().startServer()
})()
