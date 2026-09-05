// stands in for codegen.js in browser builds
//
// emitting javascript means building a function from a string at runtime, which a page served under a strict content security policy is not allowed to do. rather than ask every browser app to loosen its policy, browser builds render by walking the node tree the compiler built, which needs no such permission
//
// a browser can still have the emitted code, and the speed of it, by being given it already written: teddy.precompile names a template and writes its emitted javascript out as source, which a page loads as a script like any other. nothing is built from a string at runtime, so a strict policy is satisfied
//
// webpack swaps this file in the same way it swaps cheerio for the dom polyfill, so the emitter is not merely unused in a browser bundle: it is not in it

export const canEmit = () => false

export function emit () {
  throw new Error('teddy: the code emitter is not available in browser builds')
}
