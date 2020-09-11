const fs = require('fs')
const PDFTypeset = require('../src/main')

// PDFTypeset.toTimes('source.pdf', {
//   insertIndex: -2,
//   times: 5
// }, (data, errMsg) => {
//   if (data) fs.writeFileSync(`source-after.pdf`, data)
// })

PDFTypeset.toBook('report.pdf', {
  insertIndex: -2,
}, (data) => {
  data && fs.writeFileSync(`report-after.pdf`, data)
})