const { toPagesTimes } = require('../src/main')
toPagesTimes('source.pdf', 'after-pdf', {
  insertIndex: -2,
  times: 4
})