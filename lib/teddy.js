'use strict'

/**
 * JavaScript templating engine.
 * @module teddy
 * @public
 */

// Dependencies
const fs = require('fs')
const path = require('path')

// Utility module
const utils = require('./utils')

// Constants
const TEDDY_NAME = 'teddy'
const TEDDY_VERSION = require('../package.json').version
const TEDDY_TAGS = {
  include: ['<', 'i', 'n', 'c', 'l', 'u', 'd', 'e', ' '],
  includeArg: ['<', 'a', 'r', 'g', ' '],
  if: ['<', 'i', 'f', ' '],
  elseif: ['<', 'e', 'l', 's', 'e', 'i', 'f', ' '],
  else: ['<', 'e', 'l', 's', 'e', '>'],
  unless: ['<', 'u', 'n', 'l', 'e', 's', 's', ' '],
  elseunless: ['<', 'e', 'l', 's', 'e', 'u', 'n', 'l', 'e', 's', 's', ' '],
  loop: ['<', 'l', 'o', 'o', 'p', ' '],
  noteddy: ['<', 'n', 'o', 't', 'e', 'd', 'd', 'y', '>']
}
const TEDDY_BOOL_LOGIC = {
  or: ['o', 'r'],
  and: ['a', 'n', 'd'],
  xor: ['x', 'o', 'r'],
  not: ['n', 'o', 't', ':']
}
const TEDDY_CONDITIONAL_ONELINERS = {
  ifsomething: ['i', 'f', '-'],
  istrue: ['t', 'r', 'u' ,'e', '='],
  isfalse: ['f', 'a', 'l', 's', 'e', '='],
}
const TEDDY_LOOPING = {
  through: ['t', 'h', 'r', 'o', 'u', 'g', 'h', '='],
  key: ['k', 'e', 'y', '='],
  val: ['v', 'a', 'l', '=']
}
const TEDDY_NONPARSED = {
  noparse: ['n', 'o', 'p', 'a', 'r', 's', 'e'],
  noteddy: ['n', 'o', 't', 'e', 'd', 'd', 'y']
}


function render (template, model, callback) {


  
  // execute callback if present, otherwise simply return the rendered template string
  if (typeof callback === 'function') {
    if (!errors) {
      callback(null, renderedTemplate)
    } else {
      callback(consoleErrors, renderedTemplate)
    }
  } else {
    return renderedTemplate
  }
}


/**
 * Compile the given `str` of ejs into a template function.
 *
 * @param {String}  template EJS template
 *
 * @param {Options} opts     compilation options
 *
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `opts.client`, either type might be returned.
 * Note that the return type of the function also depends on the value of `opts.async`.
 * @public
 */

exports.compile = function compile(template, opts) {
  var templ

  // v1 compat
  // 'scope' is 'context'
  // FIXME: Remove this in a future version
  if (opts && opts.scope) {
    if (!scopeOptionWarned){
      console.warn('`scope` option is deprecated and will be removed in EJS 3')
      scopeOptionWarned = true
    }
    if (!opts.context) {
      opts.context = opts.scope
    }
    delete opts.scope
  }
  templ = new Template(template, opts)
  return templ.compile()
}

/**
 * Render the given `template` of ejs.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}   template EJS template
 * @param {Object}  [data={}] template data
 * @param {Options} [opts={}] compilation and rendering options
 * @return {(String|Promise<String>)}
 * Return value type depends on `opts.async`.
 * @public
 */

exports.render = function (template, d, o) {
  var data = d || {}
  var opts = o || {}

  // No options object -- if there are optiony names
  // in the data, copy them to options
  if (arguments.length == 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA)
  }

  return handleCache(opts, template)(data)
}

/**
 * Render an EJS file at the given `path` and callback `cb(err, str)`.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}             path     path to the EJS file
 * @param {Object}            [data={}] template data
 * @param {Options}           [opts={}] compilation and rendering options
 * @param {RenderFileCallback} cb callback
 * @public
 */

exports.renderFile = function () {
  var args = Array.prototype.slice.call(arguments)
  var filename = args.shift()
  var cb
  var opts = {filename: filename}
  var data
  var viewOpts

  // Do we have a callback?
  if (typeof arguments[arguments.length - 1] == 'function') {
    cb = args.pop()
  }
  // Do we have data/opts?
  if (args.length) {
    // Should always have data obj
    data = args.shift()
    // Normal passed opts (data obj + opts obj)
    if (args.length) {
      // Use shallowCopy so we don't pollute passed in opts obj with new vals
      utils.shallowCopy(opts, args.pop())
    }
    // Special casing for Express (settings + opts-in-data)
    else {
      // Express 3 and 4
      if (data.settings) {
        // Pull a few things from known locations
        if (data.settings.views) {
          opts.views = data.settings.views
        }
        if (data.settings['view cache']) {
          opts.cache = true
        }
        // Undocumented after Express 2, but still usable, esp. for
        // items that are unsafe to be passed along with data, like `root`
        viewOpts = data.settings['view options']
        if (viewOpts) {
          utils.shallowCopy(opts, viewOpts)
        }
      }
      // Express 2 and lower, values set in app.locals, or people who just
      // want to pass options in their data. NOTE: These values will override
      // anything previously set in settings  or settings['view options']
      utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS)
    }
    opts.filename = filename
  }
  else {
    data = {}
  }

  return tryHandleCache(opts, data, cb)
}

// Template class
function Template (text, opts) {
  opts = opts || {}
  let options = {}

  this.templateText = text
  this.currentLine = 1
  this.source = ''

  options.filename = opts.filename
  options.openTagDelimiter = '<'
  options.closeTagDelimiter = '>'
  options.openVarDelimiter = '{'
  options.closeVarDelimiter = '}'
  options.surpressEscape = '|'
}

Template.modes = {
  EVAL: 'eval',
  ESCAPED: 'escaped',
  RAW: 'raw',
  COMMENT: 'comment',
  LITERAL: 'literal'
}

Template.prototype = {
  createRegExp: function() {

  },

  parseTemplateText: function () {
    var str = this.templateText
    var pat = this.regex
    var result = pat.exec(str)
    var arr = []
    var firstPos

    while (result) {
      firstPos = result.index

      if (firstPos !== 0) {
        arr.push(str.substring(0, firstPos))
        str = str.slice(firstPos)
      }

      arr.push(result[0])
      str = str.slice(result[0].length)
      result = pat.exec(str)
    }

    if (str) {
      arr.push(str)
    }

    return arr
  },

  scanLine: function (line) {
    var self = this
    var d = this.opts.delimiter
    var o = this.opts.openDelimiter
    var c = this.opts.closeDelimiter
    var newLineCount = 0

    newLineCount = (line.split('\n').length - 1)

    // switch (line) {
    // case o + d:
    // case o + d + '_':
    //   this.mode = Template.modes.EVAL
    //   break
    // case o + d + '=':
    //   this.mode = Template.modes.ESCAPED
    //   break
    // case o + d + '-':
    //   this.mode = Template.modes.RAW
    //   break
    // case o + d + '#':
    //   this.mode = Template.modes.COMMENT
    //   break
    // case o + d + d:
    //   this.mode = Template.modes.LITERAL
    //   this.source += '     __append("' + line.replace(o + d + d, o + d) + '")' + '\n'
    //   break
    // case d + d + c:
    //   this.mode = Template.modes.LITERAL
    //   this.source += '     __append("' + line.replace(d + d + c, d + c) + '")' + '\n'
    //   break
    // case d + c:
    // case '-' + d + c:
    // case '_' + d + c:
    //   if (this.mode == Template.modes.LITERAL) {
    //     this._addOutput(line)
    //   }

    //   this.mode = null
    //   this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0
    //   break
    // default:
    //   // In script mode, depends on type of tag
    //   if (this.mode) {
    //     // If '//' is found without a line break, add a line break.
    //     switch (this.mode) {
    //     case Template.modes.EVAL:
    //     case Template.modes.ESCAPED:
    //     case Template.modes.RAW:
    //       if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
    //         line += '\n'
    //       }
    //     }
    //     switch (this.mode) {
    //     // Just executing code
    //     case Template.modes.EVAL:
    //       this.source += '     ' + line + '\n'
    //       break
    //       // Exec, esc, and output
    //     case Template.modes.ESCAPED:
    //       this.source += '     __append(escapeFn(' + stripSemi(line) + '))' + '\n'
    //       break
    //       // Exec and output
    //     case Template.modes.RAW:
    //       this.source += '     __append(' + stripSemi(line) + ')' + '\n'
    //       break
    //     case Template.modes.COMMENT:
    //       // Do nothing
    //       break
    //       // Literal <%% mode, append as raw output
    //     case Template.modes.LITERAL:
    //       this._addOutput(line)
    //       break
    //     }
    //   }
    //   // In string mode, just add the output
    //   else {
    //     this._addOutput(line)
    //   }
    // }

    // if (self.opts.compileDebug && newLineCount) {
    //   this.currentLine += newLineCount
    //   this.source += '     __line = ' + this.currentLine + '\n'
    // }
  }
}

/**
 * Version of Teddy.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.VERSION = TEDDY_VERSION

/**
 * Name for detection of Teddy.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.NAME = TEDDY_NAME
