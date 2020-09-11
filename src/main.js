const { PDFDocument, rgb } = require('pdf-lib')
const fs = require('fs')

/**
 * 用空白页填补，将PDF的页数处理成多少倍数
 * @param {*} sourcePath 原PDF路径
 * @param {*} options.outputPath 输出路径
 * @param {number} options.insertIndex 插入空白页的原PDF索引
 * @param {number} options.times PDF处理页面倍数
 * @param {function} cb 处理完成后的回调
 */
const toTimes = async function(sourcePath, options = {}, cb) {
  if (!fs.existsSync(sourcePath)) {
    typeof cb === 'function' && cb(null, `${sourcePath} The path file does not exist！`)
    return
  }
  const { outputPath, insertIndex, times = 1 } = options
  const blankDoc = await PDFDocument.create();
  const sourcePDF = await PDFDocument.load(fs.readFileSync(sourcePath));
  const pageNum = sourcePDF.getPages().length
  let needAdd = pageNum % times ? (times - pageNum % times) : 0

  let pageInsertIndex = insertIndex // 空白页插入的位置
  if (typeof insertIndex === 'undefined') {
    pageInsertIndex = pageNum
  } else if (insertIndex < 0) {
    pageInsertIndex = pageNum + insertIndex
  }

  while(needAdd--) {
    // 添加倍数的补差空白页
    let page = blankDoc.addPage()
    page.drawLine({
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
      thickness: 0,
      color: rgb(0, 0, 0),
      opacity: 0,
    })
  }
  const docPages = await sourcePDF.copyPages(blankDoc, blankDoc.getPageIndices())
  docPages.forEach(page => sourcePDF.insertPage(pageInsertIndex, page))
  
  let resBuffer = await sourcePDF.save()
  outputPath && fs.writeFileSync(`${outputPath}.pdf`, resBuffer);
  typeof cb === 'function' && cb(resBuffer)
  return resBuffer
}

/**
 * 处理成书册子排版
 * @param {*} sourcePath 原PDF路径
 * @param {*} options.outputPath 输出路径
 * @param {number} options.insertIndex 4倍页数补差的空白页 插入的原PDF索引
 * @param {function} cb 处理完成后的回调
 */
const toBook = async function(sourcePath, options = {}, cb) {
  if (!fs.existsSync(sourcePath)) {
    typeof cb === 'function' && cb(null, `${sourcePath} The path file does not exist！`)
    return
  }
  const { outputPath, insertIndex } = options
  const resPDF = await PDFDocument.create()
  let sourcePDF = await PDFDocument.load(
    await toTimes(sourcePath, { insertIndex, times: 4 })
  )
  
  // console.log(sourcePDF)

  const pageWidth = 1190  // 单页宽度
  const pageHeight = 842  // 单页高度
  const pageNum = sourcePDF.getPages().length
  let pageIndexs = Array.apply(null, {length: pageNum}).map((e, i) => i)
  let count = 1

  while(count <= (pageNum / 2)) {
    let page = resPDF.addPage([pageWidth, pageHeight])
    let start = pageIndexs[count - 1]
    let end = pageIndexs[pageNum - count]

    console.log(count % 2 ? end : start, count % 2 ? start : end)
    let left = await resPDF.embedPage(sourcePDF.getPages()[
      count % 2 ? end : start
    ])
    let right = await resPDF.embedPage(sourcePDF.getPages()[
      count % 2 ? start : end
    ])
    page.drawPage(left, {
      x: 0,
      y: 0,
    })
    page.drawPage(right, {
      x: pageWidth - right.width,
      y: 0,
    })
    count++
  }

  let resBuffer = await resPDF.save()
  outputPath && fs.writeFileSync(`${outputPath}.pdf`, resBuffer);
  typeof cb === 'function' && cb(resBuffer)
  return resBuffer
}

module.exports = {
  toTimes,
  toBook
}
