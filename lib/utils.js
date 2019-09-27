'use strict'

/**
 * Private utility functions
 * @module utils
 * @private
 */

const regExpChars = /[|\\{}()[\]^$+*?.]/g

const HTML_ENTITYS_TABLE = {
  '&': '&amp',
  '<': '&lt',
  '>': '&gt',
  '"': '&#34',
  "'": '&#39'
}

const HTML_ENTITY_REGEX = /[&<>'"]/g

function getHtmlEntity (c) {
  return HTML_ENTITYS_TABLE[c] || c
}

/**
 * Naive copy of properties from one object to another.
 * Does not recurse into non-scalar properties
 * Does not check to see if the property has a value before copying
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopy = function (to, from) {
  from = from || {}
  for (var p in from) {
    to[p] = from[p]
  }
  return to
}

/**
 * Naive copy of a list of key names, from one object to another.
 * Only copies property if it is actually defined
 * Does not recurse into non-scalar properties
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @param  {Array} list List of properties to copy
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopyFromList = function (to, from, list) {
  for (var i = 0; i < list.length; i++) {
    var p = list[i]
    if (typeof from[p] != 'undefined') {
      to[p] = from[p]
    }
  }
  return to
}

/**
 * Simple in-process cache implementation. Does not implement limits of any
 * sort.
 *
 * @implements Cache
 * @static
 * @private
 */
exports.cache = {
  _data: {},
  set: function (key, val) {
    this._data[key] = val
  },
  get: function (key) {
    return this._data[key]
  },
  remove: function (key) {
    delete this._data[key]
  },
  reset: function () {
    this._data = {}
  }
}