const { PDFDocument } = require('pdf-lib')
const fs = require('fs')

/**
 * 用空白页填补，将PDF的页数处理成多少倍数
 * @param {*} sourcePath 原PDF理解
 * @param {*} outputPath 输出路径
 * @param {*} options.insertIndex 插入空白页的原PDF索引
 * @param {*} options.times PDF处理页面倍数
 */
const toPagesTimes = async function(sourcePath, outputPath, options = {}) {
  if (!fs.existsSync(sourcePath)) {
    console.error(`${sourcePath} The path file does not exist！`)
    return
  }
  const { insertIndex = 0, times = 2 } = options
  const sourcePDF = await PDFDocument.load(fs.readFileSync(sourcePath));
  const doc = await PDFDocument.create();
  const pageNum = sourcePDF.getPages().length
  let needAdd = pageNum % times ? (times - pageNum % times) : 0
  let pageInsertIndex = insertIndex
  if (insertIndex < 0) {
    pageInsertIndex = pageNum + insertIndex
  }

  while(needAdd--) {
    doc.addPage()
  }
  const docPages = await sourcePDF.copyPages(doc, doc.getPageIndices())
  docPages.forEach(page => sourcePDF.insertPage(pageInsertIndex, page))
  fs.writeFileSync(`${outputPath}.pdf`, await sourcePDF.save());
}

const res = {
  toPagesTimes
}
module.exports = res
