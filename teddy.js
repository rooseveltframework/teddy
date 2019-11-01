// (function (global) {
//   var teddy // @namespace

//   // private utility vars
//   var consoleWarnings // used to overload console.warn for the server-side error gui
//   var consoleErrors // used to overload console.error for the server-side error gui
//   var fs // server-side filesystem module
//   var path // server-side utility for manipulating file paths
//   var contextModels = [] // stores local models for later consumption by template logic tags
//   var matchRecursive // see below
//   var jsonStringifyCache

//   var primaryTags = [
//     ['<', 'i', 'f', ' '],
//     ['<', 'u', 'n', 'l', 'e', 's', 's', ' '],
//     ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', ' '],
//     ['<', 'l', 'o', 'o', 'p', ' ']
//   ]
//   var secondaryTags = [
//     ['<', 'e', 'l', 's', 'e', '>'],
//     ['<', 'e', 'l', 's', 'e', 'i', 'f', ' '],
//     ['<', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', ' ']
//   ]

//   teddy = {
//     /**
//      * public member vars
//      */

//     // default values for parameters sent to teddy
//     params: {},

//     // compiled templates are stored as object collections, e.g. { "myTemplate.html": "<p>some markup</p>"}
//     templates: {},

//     // cache of fully rendered temmplates, e.g. { "myTemplate.html": "<p>some markup</p>"}
//     renderedTemplates: {},

//     /**
//      * mutator methods for public member vars
//      */

//     // sets all params to their default values
//     setDefaultParams: function () {
//       teddy.params.verbosity = 1
//       teddy.params.templateRoot = './'
//       teddy.params.cacheRenders = false
//       teddy.params.defaultCaches = 1
//       teddy.params.templateMaxCaches = {}
//       teddy.params.cacheWhitelist = false
//       teddy.params.cacheBlacklist = []
//       teddy.params.compileAtEveryRender = false
//       teddy.params.minify = false
//       teddy.params.maxPasses = 25000
//     },

//     // mutator method to set verbosity param. takes human-readable string argument and converts it to an integer for more efficient checks against the setting
//     setVerbosity: function (v) {
//       switch (v) {
//         case 'none':
//         case 0:
//           v = 0
//           break
//         case 'verbose':
//         case 2:
//           v = 2
//           break
//         case 'DEBUG':
//         case 3:
//           v = 3
//           break
//         default: // concise
//           v = 1
//       }
//       teddy.params.verbosity = v
//     },

//     // mutator method to set template root param; must be a string
//     setTemplateRoot: function (v) {
//       teddy.params.templateRoot = String(v)
//     },

//     // turn on or off the setting to cache template renders
//     cacheRenders: function (v) {
//       teddy.params.cacheRenders = Boolean(v)
//     },

//     // mutator method to set default caches param: the number of cached versions of each templates to store by default if cacheRenders is enabled
//     setDefaultCaches: function (v) {
//       teddy.params.defaultCaches = parseInt(v)
//     },

//     // mutator method to set max caches for a given registered template
//     setMaxCaches: function (template, v) {
//       teddy.params.templateMaxCaches[String(template)] = parseInt(v)
//     },

//     // mutator method to set a whitelist of templates to cache, e.g. { "myTemplate.html": maxCaches} where maxCaches is an integer
//     setCacheWhitelist: function (o) {
//       var i
//       teddy.params.cacheWhitelist = o
//       for (i in o) {
//         teddy.setMaxCaches(i, o[i])
//       }
//     },

//     // mutator method to set a blacklist of templates not to cache as an array
//     setCacheBlacklist: function (a) {
//       teddy.params.cacheBlacklist = a
//     },

//     // turn on or off the setting to compile templates at every render
//     compileAtEveryRender: function (v) {
//       teddy.params.compileAtEveryRender = Boolean(v)
//     },

//     // turn on or off the setting to minify templates using teddy's internal minifier
//     minify: function (v) {
//       teddy.params.minify = Boolean(v)
//     },

//     // mutator method to set max passes param: the number of times the parser can iterate over the template
//     setMaxPasses: function (v) {
//       teddy.params.maxPasses = Number(v)
//     },

//     // teddy's internal console logging system
//     warnings: [],
//     errors: [],
//     console: {
//       warn: function (value) {
//         console.warn(value)
//         teddy.warnings.push(value)
//         consoleWarnings += '<li>' + escapeHtmlEntities(value) + '</li>'
//       },
//       error: function (value) {
//         console.error(value)
//         teddy.errors.push(value)
//         consoleErrors += '<li>' + escapeHtmlEntities(value) + '</li>'
//       }
//     },

//     /**
//      * public methods
//      */

//     // compiles a template
//     compile: function (template) {
//       var name = template
//       var register = false

//       // it's assumed that the argument is already a template string if we're not server-side
//       if (typeof template !== 'string') {
//         if (teddy.params.verbosity > 1) {
//           teddy.console.warn('teddy.compile attempted to compile a template which is not a string.')
//         }
//         return ''
//       }
//       // get contents of file if template is a file
//       if (template.indexOf('<') === -1 && fs) {
//         register = true
//         try {
//           template = fs.readFileSync(template, 'utf8')
//         } catch (e) {
//           try {
//             template = fs.readFileSync(teddy.params.templateRoot + template, 'utf8')
//           } catch (e) {
//             try {
//               template = fs.readFileSync(teddy.params.templateRoot + '/' + template, 'utf8')
//             } catch (e) {
//               // do nothing, attempt to render it as code
//               register = false
//             }
//           }
//         }
//       } else {
//         if (teddy.templates[template]) {
//           template = teddy.templates[template]
//           register = true
//         }
//       }

//       if (register) {
//         teddy.templates[name] = template
//         return template
//       } else {
//         return template.slice(-5) === '.html' ? template.substring(0, template.length - 5) : template
//       }
//     },

//     // invalidates cache of a given template and model combination
//     // if no model is supplied, deletes all caches of the given template
//     flushCache: function (template, model) {
//       // ensure template is a string
//       if (typeof template !== 'string') {
//         if (teddy.params.verbosity > 1) {
//           teddy.console.warn('teddy.flushCache attempted to invalidate cache of template that is not a string')
//         }
//         return ''
//       }

//       // append extension if not present
//       if (template.slice(-5) !== '.html') {
//         template += '.html'
//       }

//       if (model) {
//         var renders = teddy.renderedTemplates[template]
//         var i
//         var l
//         var render
//         var stringyModel
//         var renderStringyModel

//         if (renders) {
//           l = renders.length
//         } else {
//           return
//         }

//         jsonStringifyCache = []
//         stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences)
//         for (i = 0; i < l; i++) {
//           render = renders[i]
//           jsonStringifyCache = []
//           renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences)
//           if (renderStringyModel === stringyModel) {
//             teddy.renderedTemplates[template].splice(i, 1)
//           }
//         }
//       } else {
//         delete teddy.renderedTemplates[template]
//       }
//     },

//     // parses a template
//     render: function (template, model, callback) {
//       model = Object.assign({}, model) // make a copy of the model

//       // ensure template is a string
//       if (typeof template !== 'string') {
//         if (teddy.params.verbosity > 1) {
//           teddy.console.warn('teddy.render attempted to render a template which is not a string.')
//         }
//         return ''
//       }

//       // declare vars
//       var renderedTemplate
//       var diff
//       var loops = []
//       var loopCount
//       var loop
//       var noteddys = []
//       var noteddysMatches
//       var noteddysCount
//       var i
//       var l
//       var el
//       var localModel
//       var errors
//       var passes = 0
//       var renders
//       var render
//       var stringyModel
//       var renderStringyModel
//       var maxPasses = teddy.params.maxPasses
//       var maxPassesError = 'Render aborted due to max number of passes (' + maxPasses + ') exceeded; there is a possible infinite loop in your template logic.'
//       var tags = []
//       var tag
//       var src
//       var incdoc
//       var comments
//       var oldTemplate

//       // overload console logs
//       consoleWarnings = ''
//       consoleErrors = ''

//       // express.js support
//       if (model.settings && model.settings.views) {
//         teddy.params.templateRoot = path.resolve(model.settings.views)
//       }

//       // remove templateRoot from template name if necessary
//       if (template.slice(teddy.params.templateRoot.length) === teddy.params.templateRoot) {
//         template = template.replace(teddy.params.templateRoot, '')
//       }

//       // append extension if not present
//       // TODO: handle logic differently
//       /*
//       if (template.slice(-5) !== '.html') {
//         template += '.html'
//       }
//       */

//       // return cached template if one exists
//       if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
//         jsonStringifyCache = []
//         stringyModel = JSON.stringify(model, jsonStringifyRemoveCircularReferences)
//         teddy.renderedTemplates[template] = teddy.renderedTemplates[template] || []
//         renders = teddy.renderedTemplates[template]

//         l = renders.length
//         for (i = 0; i < l; i++) {
//           render = renders[i]
//           jsonStringifyCache = []
//           renderStringyModel = JSON.stringify(render.model, jsonStringifyRemoveCircularReferences)
//           if (renderStringyModel === stringyModel) {
//             // move to last position in the array to mark it as most recently accessed
//             teddy.renderedTemplates[template].push(teddy.renderedTemplates[template].splice(i, 1)[0])
//             return render.renderedTemplate
//           }
//         }
//       }

//       // compile template if necessary
//       if (!teddy.templates[template] || teddy.params.compileAtEveryRender) {
//         renderedTemplate = teddy.compile(template)
//       }

//       renderedTemplate = teddy.templates[template] || renderedTemplate

//       // TODO: rewrite method
//       // renderedTemplate = removeComments(renderedTemplate)

//       // prepare to cache the template if caching is enabled and this template is eligible
//       if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
//         teddy.renderedTemplates[template] = teddy.renderedTemplates[template] || []
//         l = teddy.renderedTemplates[template].length
//         if ((teddy.params.templateMaxCaches[template] && l >= teddy.params.templateMaxCaches[template]) || (!teddy.params.templateMaxCaches[template] && l >= teddy.params.defaultCaches)) {
//           teddy.renderedTemplates[template].shift()
//         }
//         l = teddy.renderedTemplates[template].push({
//           renderedTemplate: '',
//           model: Object.assign({}, model)
//         })
//       }

//       if (!renderedTemplate) {
//         if (teddy.params.verbosity) {
//           teddy.console.warn('teddy.render attempted to render a template which doesn\'t exist: ' + template)
//         }
//         return ''
//       }

//       function removeComments (template) {
//         // remove {! comments !} and (optionally) unnecessary whitespace
//         do {
//           oldTemplate = template
//           if (teddy.params.minify) {
//             template = template
//               .replace(/[\f\n\r\t\v]*/g, '')
//               .replace(/\s{2,}/g, ' ')
//           }
//           comments = matchRecursive(template, '{!...!}')
//           var commentsLength = comments.length
//           for (i = 0; i < commentsLength; i++) {
//             template = replaceNonRegex(template, '{!' + comments[i] + '!}', '')
//           }
//         }
//         while (oldTemplate !== template)

//         return template
//       }

//       // NEW LOGIC HERE
//       // TODO: finish
//       var templateArray = [...template] // https://stackoverflow.com/questions/6484670/how-do-i-split-a-string-into-an-array-of-characters
//       var renderedTemplate = ''
//       var replaceOperation

//       while (templateArray[0] !== undefined) {
//         replaceOperation = tagScanner(templateArray, primaryTags, model)

//         if (replaceOperation) {
//           templateArray = replaceOperation
//         }
//         else {
//           // next character
//           renderedTemplate += templateArray.shift()
//         }
//       }
//       // NEW LOGIC ENDS
//       // TODO: finish

//       // clean up temp vars
//       contextModels = []
//       passes = 0

//       // if we have no template and we have errors, render an error page
//       if (!renderedTemplate && (consoleErrors || consoleWarnings)) {
//         renderedTemplate = '<!DOCTYPE html><html lang=\'en\'><head><meta charset=\'utf-8\'><title>Could not parse template</title></head><body><h1>Could not parse template</h1>'
//         if (consoleErrors) {
//           renderedTemplate += '<p>The following errors occurred while parsing the template:</p>'
//           renderedTemplate += '<ul>'
//           renderedTemplate += consoleErrors
//           renderedTemplate += '</ul>'
//         }
//         if (consoleWarnings) {
//           renderedTemplate += '<p>The following warnings occurred while parsing the template:</p>'
//           renderedTemplate += '<ul>'
//           renderedTemplate += consoleWarnings
//           renderedTemplate += '</ul>'
//         }
//         renderedTemplate += '</body></html>'
//         consoleWarnings = ''
//         consoleErrors = ''
//       }

//       // parse removed noparse or noteddy includes
//       // TODO: remove?
//       for (i = 0; i < tags.length; i++) {
//         tag = tags[i]
//         if (tag) {
//           // try for a version of this loop that might have a data model attached to it now
//           el = renderedTemplate.match(new RegExp('(?:{' + (i + 1) + '_tag data-local-model=[0-9]*})'))
//           if (el && el[0]) {
//             el = el[0]
//             localModel = el.split(' ')
//             localModel = localModel[1].slice(0, -1)
//             renderedTemplate = parseIncludes(renderedTemplate, model)
//           } else {
//             // no data model on it, render it vanilla
//             renderedTemplate = replaceNonRegex(renderedTemplate, '{' + (i + 1) + '_tag}', parseIncludeWithFlag(tag))
//           }
//           tags[i] = null // this prevents parseIncludeWithFlag from attempting to render it again
//         }
//       }

//       // cache the template if caching is enabled and this template is eligible
//       if (teddy.params.cacheRenders && teddy.templates[template] && (!teddy.params.cacheWhitelist || teddy.params.cacheWhitelist[template]) && teddy.params.cacheBlacklist.indexOf(template) < 0) {
//         teddy.renderedTemplates[template][l - 1].renderedTemplate = renderedTemplate
//       }

//       // execute callback if present, otherwise simply return the rendered template string
//       if (typeof callback === 'function') {
//         if (!errors) {
//           callback(null, renderedTemplate)
//         } else {
//           callback(consoleErrors, renderedTemplate)
//         }
//       } else {
//         console.log(renderedTemplate)
//         return renderedTemplate
//       }
//     }
//   }

//   // set params to default values
//   teddy.setDefaultParams()

//   /**
//    * private utility methods
//    */

//   // NEW LOGIC HERE
//   // TODO: finish
//   function tagScanner(templateArray, tagList, model) {
//     tagList = tagList.slice() // copy the array
//     var endChars
//     var endLength
//     var done = false
//     var ec = 0
//     var cc = 0
//     var tmplChar
//     var testChar
//     var eligibleCharArray
//     var eligibleCharArraysLength = tagList.length
//     var tag

//     while (done === false) {
//       for (ec = 0; ec < eligibleCharArraysLength; ec++) {
//         tmplChar = templateArray[cc]
//         eligibleCharArray = tagList[ec]
//         testChar = eligibleCharArray[cc]
//         if (tmplChar !== testChar) {
//           tagList.splice(ec, 1)
//           eligibleCharArraysLength--
//         }
//         else if (cc === eligibleCharArray.length - 1) {
//           beginChars = eligibleCharArray
//           beginLength = eligibleCharArray.length
//           endChars = eligibleCharArray.slice()
//           endChars[beginLength - 1] = '>'
//           endChars.splice(1, 0, '/')
//           endLength = endChars.length - 1
//           tag = beginChars.join('')
//           tag = tag.substring(1, tag.length - 1)
//           done = true
//         }
//       }
//       if (eligibleCharArraysLength === 0) {
//         return false
//       }
//       cc++
//     }

//     // if we get here we found an if tag
//     var endCounter

//     var templateArrayCounter
//     var templateArrayLength = templateArray.length
//     var templateArrayStart = beginLength
//     var templateArrayEnd
//     var lookAheadArray
//     var nestCount = 0
//     var tagContents
//     var tagAttributes
//     var metadata
//     var replaceString
//     var updatedTemplate

//     // loop through the rest of the template array
//     for (templateArrayCounter = templateArrayStart; templateArrayCounter < templateArrayLength; templateArrayCounter++) {
//       lookAheadArray = templateArray.slice(templateArrayCounter, templateArrayCounter + endLength)
//       if (isAnotherOpeningTag(lookAheadArray, beginChars)) {
//         nestCount++
//         // found another '<if '
//       }
//       else if (isClosingTag(lookAheadArray, endChars)) {
//         if (nestCount === 0) {
//           templateArrayEnd = templateArrayCounter
//           tagContents = templateArray.slice(templateArrayStart, templateArrayEnd).join('')
//           if (tag === 'else') {
//             tagAttributes = ''
//           }
//           else {
//             tagContents = tagContents.split('>')
//             tagAttributes = tagContents[0]
//             tagContents.shift()
//             tagContents = tagContents.join('>')
//           }

//           metadata = {
//             templateArray: templateArray,
//             templateArrayStringWithoutTag: (templateArray.join('').substring(templateArrayEnd + endLength + 1)).trim(),
//             tag: tag,
//             tagAttributes: tagAttributes,
//             tagContents: tagContents,
//             model: model,
//           }

//           switch (tag) {
//             case 'if':
//             case 'unless':
//             case 'elseif':
//             case 'elseunless':
//             case 'else':
//               replaceString = parseConditional(metadata)
//               break
//             case 'include':
//               replaceString = parseInclude(metadata)
//               break
//             case 'loop':
//               replaceString = parseLoop(metadata)
//               break
//           }

//           return [...replaceString]
//         }
//         else {
//           // this '</if>' matches a nested tag
//           nestCount--
//         }
//       }
//     }
//     return false
//   }

//   // if, unless, elseif, elseunless
//   function parseConditional(metadata) {
//     var templateArray = metadata.templateArray
//     var tag = metadata.tag
//     var tagAttributes = metadata.tagAttributes
//     var tagContents = metadata.tagContents
//     var model = metadata.model
//     var satisfiedCondition = false
//     var foundSibling = false

//     if (tag === 'else') {
//       satisfiedCondition = true
//     }
//     else if (tag === 'if' || tag === 'elseif') {
//       if (model[tagAttributes]) {
//         satisfiedCondition = true
//       }
//       else {
//         metadata.templateArrayStringWithoutTag = scanForSiblings()
//       }
//     }
//     else if (tag === 'unless' || tag === 'elseunless') {
//       if (!model[tagAttributes]) {
//         satisfiedCondition = true
//       }
//       else {
//         metadata.templateArrayStringWithoutTag = scanForSiblings()
//       }
//     }

//     function scanForSiblings() {
//       var notDone = true
//       var replaceOperation
//       var templateArray = [...metadata.templateArrayStringWithoutTag]
//       do {
//         replaceOperation = tagScanner(templateArray, secondaryTags, model)
//         if (replaceOperation) {
//           return replaceOperation.join('')
//         }
//         else {
//           // no sibling found
//           return metadata.templateArrayStringWithoutTag
//         }
//       }
//       while (notDone === true)
//     }

//     if (satisfiedCondition) {
//       return tagContents + metadata.templateArrayStringWithoutTag
//     }
//     else {
//       return '' + metadata.templateArrayStringWithoutTag
//     }
//     //process.exit()
//   }

//   function isAnotherOpeningTag(a1, a2) {
//     a1.pop()
//     return twoArraysEqual(a1, a2)
//   }

//   function isClosingTag(a1, a2) {
//     return twoArraysEqual(a1, a2)
//   }

//   function twoArraysEqual(a1, a2) {
//     var a1l = a1.length
//     var i
//     for (i = 0; i < a1l; i++) {
//       if (a1[i] !== a2[i]) {
//         return false
//       }
//     }
//     return true
//   }
//   // NEW LOGIC ENDS
//   // TODO: finish

//   // gets nested object by string
//   function getNestedObjectByString (o, s) {
//     s = s.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
//     s = s.replace(/^\./, '') // strip leading dot
//     var a = s.split('.')
//     var n

//     while (a.length) {
//       n = a.shift()
//       if (n in o) {
//         o = o[n]
//       } else {
//         return
//       }
//     }
//     return o
//   }

//   // get all attributes of an element
//   function getAttributes (el) {
//     var attributes = el.split('>')
//     attributes = attributes[0]
//     attributes = attributes.substring(attributes.indexOf(' '))
//     attributes = attributes.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)
//     return attributes
//   }

//   // get a specific attribute from a given element
//   function getAttribute (el, attr) {
//     var i, l, a, match

//     if (attr === 'data-local-model') {
//       el = el.split('data-local-model=')
//       if (el[1]) {
//         el = el[1]
//         el = el.split('>')
//         el = el[0]
//         el = el.split(' ')
//         el = el[0]
//         return el
//       } else {
//         return false
//       }
//     }

//     match = el.match(new RegExp(attr.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '=(\\\'.*?\\\'|\\".*?\\")'))

//     if (!match) {
//       return false
//     }

//     l = match.length
//     for (i = 0; i < l; i++) {
//       a = match[i]
//       if (a && typeof a === 'string') {
//         a = a.trim()
//         if (a.substring(0, attr.length) === attr) {
//           // got a match
//           break
//         }
//       }
//     }
//     a = a.substring(attr.length + 2).slice(0, -1)
//     return a
//   }

//   // get a specific attribute from a given element
//   function removeAttribute (el, attr) {
//     attr = attr.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
//     var newEl = el.replace(new RegExp('(?: (?:' + attr + '(?: |>))| (?:' + attr + '=)(?:("(.*?)")|(\'(.*?)\'))($|(?=[\\s >/])))'), '')
//     return newEl
//   }

//   // gets children of a given element
//   function getInnerHTML (el) {
//     el = el.trim()

//     var nodeName = getNodeName(el)
//     el = el.replace(new RegExp('<' + nodeName.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '(?:>| [\\S\\s]*?>)'), '')
//     el = el.substring(0, el.lastIndexOf('</' + nodeName + '>'))
//     return el.trim()
//   }

//   // get an element's node name
//   function getNodeName (el) {
//     var nodeName = el.split(' ')
//     nodeName = nodeName[0]
//     nodeName = nodeName.split('>')
//     nodeName = nodeName[0]
//     nodeName = nodeName.substring(1, nodeName.length)
//     return nodeName
//   }

//   function escapeHtmlEntities (v) {
//     if (v && typeof v === 'string') {
//       return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#34;').replace(/'/g, '&#39;')
//     } else {
//       return v
//     }
//   }

//   function replaceNonRegex (str, find, replace) {
//     if (typeof str === 'string') {
//       return str.split(find).join(replace)
//     } else {
//       teddy.console.error('teddy: replaceNonRegex passed invalid arguments.')
//     }
//   }

//   function jsonStringifyRemoveCircularReferences (key, value) {
//     if (typeof value === 'object' && value !== null) {
//       if (jsonStringifyCache.indexOf(value) !== -1) {
//         // circular reference found, discard key
//         return
//       }
//       jsonStringifyCache.push(value)
//     }
//     return value
//   }

//   // expose as a CommonJS module
//   if (typeof module !== 'undefined' && module.exports) {
//     module.exports = teddy // makes teddy requirable in server-side JS
//     module.exports.__express = teddy.render // express.js support

//     if (require) {
//       // server-side module dependencies
//       fs = require('fs')
//       path = require('path')
//     }
//   }

//   // set env specific vars for client-side
//   if (typeof document !== 'undefined' && typeof window !== 'undefined') {
//     global.teddy = teddy

//     // IE does not populate console unless the developer tools are opened
//     if (typeof console === 'undefined') {
//       window.console = {}
//       console.log = console.warn = console.error = function () {}
//     }

//     // Object.assign polyfill
//     if (typeof Object.assign !== 'function') {
//       Object.assign = function (target, varArgs) { // .length of function is 2
//         var i,
//           l,
//           to,
//           nextSource,
//           nextKey

//         if (target === null) { // TypeError if undefined or null
//           throw new TypeError('Cannot convert undefined or null to object')
//         }

//         to = Object(target)

//         l = arguments.length
//         for (i = 1; i < l; i++) {
//           nextSource = arguments[i]

//           if (nextSource !== null) { // skip over if undefined or null
//             for (nextKey in nextSource) {
//               // avoid bugs when hasOwnProperty is shadowed
//               if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
//                 to[nextKey] = nextSource[nextKey]
//               }
//             }
//           }
//         }
//         return to
//       }
//     }
//   }
// })(this)
