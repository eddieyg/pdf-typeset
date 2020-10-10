const { PDFDocument, rgb } = require('pdf-lib')
const fs = require('fs')

/**
 * 用空白页填补，将PDF的页数处理成多少倍数
 * @param {path} options.sourcePath 原PDF路径
 * @param {path} options.outputPath 输出路径
 * @param {path} options.fillPagePath 填补页面倍数的pdf（取第一页）
 * @param {number} options.insertIndex 插入空白页的原PDF索引
 * @param {number} options.times PDF处理页面倍数
 * @param {function} cb 处理完成后的回调
 */
const toTimes = async function(options = {}, cb) {
  const { sourcePath, outputPath, insertIndex, times = 1, fillPagePath } = options
  if (!fs.existsSync(sourcePath)) {
    typeof cb === 'function' && cb(null, `toTimes()，${sourcePath} The path file does not exist！`)
    return
  }

  try {

    const blankDoc = await PDFDocument.create()
    const sourcePDF = await PDFDocument.load(fs.readFileSync(sourcePath))
    const pageNum = sourcePDF.getPages().length
    let fillPDF
    let needAdd = pageNum % times ? (times - pageNum % times) : 0
    let pageInsertIndex = insertIndex // 空白页插入的位置

    if (fillPagePath && fs.existsSync(fillPagePath)) {
      fillPDF = await PDFDocument.load(fs.readFileSync(fillPagePath))
    }
    if (typeof insertIndex === 'undefined') {
      pageInsertIndex = pageNum
    } else if (insertIndex < 0) {
      pageInsertIndex = pageNum + insertIndex
    }

    while(needAdd--) {
      // 添加倍数的补差空白页
      let page = blankDoc.addPage()
      if (fillPDF) {
        let fillPage = await blankDoc.embedPage(fillPDF.getPages()[0])
        page.drawPage(fillPage, {
          x: 0,
          y: 0,
        })
      } else {
        page.drawLine({
          start: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
          thickness: 0,
          color: rgb(0, 0, 0),
          opacity: 0,
        })
      }
    }
    const docPages = await sourcePDF.copyPages(blankDoc, blankDoc.getPageIndices())
    docPages.forEach(page => sourcePDF.insertPage(pageInsertIndex, page))
  
    let resBuffer = await sourcePDF.save()
    outputPath && fs.writeFileSync(`${outputPath}.pdf`, resBuffer)
    typeof cb === 'function' && cb(resBuffer)
    return resBuffer

  } catch(err) {
    typeof cb === 'function' && cb(null, `toTimes()，${err.message}`)
    return
  }

}

/**
 * 处理成书册子排版
 * @param {*} options.sourcePath 原PDF路径
 * @param {*} options.outputPath 输出路径
 * @param {number} options.insertIndex 4倍页数补差的空白页 插入的原PDF索引
 * @param {number} options.fillPagePath 填补页面倍数的pdf（取第一页）
 * @param {function} cb 处理完成后的回调
 */
const toBook = async function(options = {}, cb) {
  const { sourcePath, outputPath, insertIndex, fillPagePath } = options
  if (!fs.existsSync(sourcePath)) {
    typeof cb === 'function' && cb(null, `toBook()，${sourcePath} The path file does not exist！`)
    return
  }

  try {
    let isOver = false
    const resPDF = await PDFDocument.create()
    let sourceBuffer = await toTimes(
      { sourcePath, insertIndex, times: 4, fillPagePath }, 
      (data, errMsg) => {
        if (errMsg) {
          isOver = true
          cb(null, errMsg)
        }
      }
    )
    if (isOver) return
    let sourcePDF = await PDFDocument.load(sourceBuffer)

    const pageWidth = 1190  // A3单页宽度
    const pageHeight = 842  // A3单页高度
    const pageNum = sourcePDF.getPages().length
    let pageIndexs = Array.apply(null, {length: pageNum}).map((e, i) => i)
    let count = 1

    while(count <= (pageNum / 2)) {
      let page = resPDF.addPage([pageWidth, pageHeight])
      let start = pageIndexs[count - 1]
      let end = pageIndexs[pageNum - count]
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
    outputPath && fs.writeFileSync(`${outputPath}.pdf`, resBuffer)
    typeof cb === 'function' && cb(resBuffer)
    return resBuffer
    
  } catch(err) {
    typeof cb === 'function' && cb(null, `toBook()，${err.message}`)
  }

}

module.exports = {
  toTimes,
  toBook
}
