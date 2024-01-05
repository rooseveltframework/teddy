function cleanString (string) {
  if (typeof string !== 'string') {
    return string
  }

  return string.replace(/(<.*?>)|\s+/g, '')
}

export { cleanString }
