// each scenario is one page every engine has to produce, chosen so that the six of them together cover the work a real template does and separate the costs that usually get reported as a single number
export default [
  {
    id: 'variables',
    label: 'Variables',
    description: '28 interpolations, one of them escaped html and one of them raw html',
    measures: 'the cost of looking a value up in the model and writing it out'
  },
  {
    id: 'conditionals',
    label: 'Conditionals',
    description: '8 branches: if/else, an else-if chain, a negation, a boolean pair, and an inline attribute condition',
    measures: 'the cost of evaluating a branch and discarding the branch not taken'
  },
  {
    id: 'loops',
    label: 'Loops',
    description: '24 products, each with a branch and a nested loop over 3 tags',
    measures: 'nested iteration with per-iteration branching'
  },
  {
    id: 'table',
    label: 'Large table',
    description: '1,000 rows of 7 cells, one of them conditional',
    measures: 'how the engine scales when the same small body is rendered many times'
  },
  {
    id: 'partials',
    label: 'Partials',
    description: 'a shell that pulls in a header and a footer once and a product partial 24 times',
    measures: 'the per-call overhead of including another template'
  },
  {
    id: 'page',
    label: 'Full page',
    description: 'a complete document: head, header, banner, else-if chain, 24 products, a 25 row table, footer',
    measures: 'everything above at once, which is the closest thing here to a real request'
  }
]
