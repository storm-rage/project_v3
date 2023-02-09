
/**
 * 树结构
 */
 export function treeDataTranslate (data: any, id = 'id', pid = 'parentId') {
  var res:any = []
  var temp:any = {}
  for (var i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (var k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]]['children']) {
        temp[data[k][pid]]['children'] = []
      }
      if (!temp[data[k][pid]]['_level']) {
        temp[data[k][pid]]['_level'] = 1
      }
      data[k]['_level'] = temp[data[k][pid]]._level + 1
      temp[data[k][pid]]['children'].push(data[k])
    } else {
      res.push(data[k])
    }
  }
  return res
}


/**
 * 获取指定key，返回数组格式
 */
export function getDataByKey (arr:any, key:any) {
  let result:any = []
  if (arr && key) {
    arr.forEach((item:any) => {
      result.push(item[key])
    })
  }
  return result
}

/**
 * 将数组中的parentId列表取出，倒序排列
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
 export function idList (data: any, val: any, id: any = 'id', children: any = 'children') {
  let res:any = []
  idListFromTree(data, val, res, id)
  return res
}

/**
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
function idListFromTree (data: any, val: any, res: any = [], id: any = 'id', children: any = 'children') {
  for (let i = 0; i < data.length; i++) {
    const element: any = data[i]
    if (element[children]) {
      if (idListFromTree(element[children], val, res, id, children)) {
        res.push(element[id])
        return true
      }
    }
    if (element[id] === val) {
      res.push(element[id])
      return true
    }
  }
}


// 压缩图片方法
export function compressImg (fileObj:any, callback:any) {
  try {
    const image = new Image()
    image.src = URL.createObjectURL(fileObj)
    image.onload = function() {
      const that:any = this
      // 等比例压缩宽高
      let w = that.width
      let h = that.height
      if (w > h) {
          w = 800 * (w / h)
          h = 800
      } else {
          h = 800 * (h / w)
          w = 800
      }
      // 生成canvas
      const canvas = document.createElement('canvas')
      const ctx:any = canvas.getContext('2d')
      // 创建属性节点
      const anw = document.createAttribute('width')
      anw.nodeValue = w
      const anh = document.createAttribute('height')
      anh.nodeValue = h
      canvas.setAttributeNode(anw)
      canvas.setAttributeNode(anh)
      ctx.drawImage(that, 0, 0, w, h)
      const data = canvas.toDataURL('image/jpeg', 0.7) // 设置图片质量
      // 压缩完成执行回调
      const newFile = convertBase64UrlToBlob(data)
      callback(newFile)
    }
    image.onerror = function() {
      callback(false)
    }
  } catch (e) {
      console.log('压缩失败!')
  }
}

function convertBase64UrlToBlob(dataurl:any) {
  const bytes = window.atob(dataurl.split(',')[1]) // 去掉url的头，并转换为byte
  // 处理异常,将ascii码小于0的转换为大于0
  const ab = new ArrayBuffer(bytes.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i)
  }
  return new Blob([ab], { type: 'image/png' })
}
