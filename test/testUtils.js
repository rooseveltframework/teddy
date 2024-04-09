export function ignoreSpaces (str) {
  if (typeof str !== 'string') {
    return str
  }

  return str.replace(/\s/g, '')
}

export function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default { ignoreSpaces, timeout }
