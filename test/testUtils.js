function cleanString (string) {
  if (typeof string !== 'string') {
    return string
  }

  return string.replace(/(<.*?>)|\s+/g, '')
}

function ignoreSpaces (str) {
  if (typeof str !== 'string') {
    return str
  }

  return str.replace(/\s/g, '')
}

export { cleanString, ignoreSpaces }
