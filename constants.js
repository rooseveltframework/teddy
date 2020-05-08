// List of all primary teddy tags
var primaryTags = {
  include: [' ', 'e', 'd', 'u', 'l', 'c', 'n', 'i', '<'],
  arg: [' ', 'g', 'r', 'a', '<'],
  if: [' ', 'f', 'i', '<'],
  loop: [' ', 'p', 'o', 'o', 'l', '<'],
  olif: ['-', 'f', 'i'],
  unless: [' ', 's', 's', 'e', 'l', 'n', 'u', '<'],
  noteddy: ['>', 'y', 'd', 'd', 'e', 't', 'o', 'n', '<'],
  argInvalid: ['>', 'g', 'r', 'a', '<'],
  includeInvalid: ['>', 'e', 'd', 'u', 'l', 'c', 'n', 'i', '<'],
  ifInvalid: ['>', 'f', 'i', '<'],
  loopInvalid: ['>', 'p', 'o', 'o', 'l', '<'],
  unlessInvalid: ['>', 's', 's', 'e', 'l', 'n', 'u', '<'],
  carg: ['g', 'r', 'a', '/', '<'],
  cinclude: ['e', 'd', 'u', 'l', 'c', 'n', 'i', '/', '<'],
  cif: ['f', 'i', '/', '<'],
  cloop: ['p', 'o', 'o', 'l', '/', '<'],
  cunless: ['s', 's', 'e', 'l', 'n', 'u', '/', '<'],
  cnoteddy: ['y', 'd', 'd', 'e', 't', 'o', 'n', '/', '<']
}

// List of all secondary tags for teddy conditionals
var secondaryTags = {
  elseif: [' ', 'f', 'i', 'e', 's', 'l', 'e', '<'],
  else: ['>', 'e', 's', 'l', 'e', '<'],
  elseunless: [' ', 's', 's', 'e', 'l', 'n', 'u', 'e', 's', 'l', 'e', '<'],
  celseif: ['f', 'i', 'e', 's', 'l', 'e', '/', '<'],
  celse: ['e', 's', 'l', 'e', '/', '<'],
  celseunless: ['s', 's', 'e', 'l', 'n', 'u', 'e', 's', 'l', 'e', '/', '<']
}

var tagLengths = {
  if: 4,
  cif: 4,
  elseif: 8,
  celseif: 8,
  else: 6,
  celse: 6,
  unless: 8,
  cunless: 8,
  elseunless: 12,
  celseunless: 12,
  loop: 6,
  cloop: 6,
  include: 9,
  cinclude: 9,
  arg: 5,
  carg: 5,
  noteddy: 9,
  cnoteddy: 9
}

// HTML entities to escape
var escapeHtmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
}

module.exports = {
  escapeHtmlEntities,
  tagLengths,
  primaryTags,
  secondaryTags
}
