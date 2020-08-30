# pdf-typeset
提供对PDF的排版处理，使用了 [pdf-lib](https://github.com/Hopding/pdf-lib) 对PDF进行处理

```
npm install pdf-typeset --save
```

### 页面倍数
用空白页填补，将PDF的页数处理成多少倍数

```
@param {string} sourcePath 原PDF理解
@param {string} outputPath 输出路径
@param {number} options.insertIndex 插入空白页的原PDF索引
@param {number} options.times PDF处理页面倍数

const { toPagesTimes } = require('pdf-typeset')
toPagesTimes('source.pdf', 'after-pdf', {
  insertIndex: -1,
  times: 5
})
```