import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { http } from '@/api/index.js'
import { getStorage } from '@/utils/storage.js'

// a: 头像，l: 公司 logo，m: 素材上传
// 素材上传 type: 2: 图片，3: 视频，4: 音频

export function uploadImage(options) {
  const formData = new FormData()
  formData.append('files', options.file)
  formData.append('type', options.type)
  return new Promise((resolve) => {
    http('apiUploadMaterial', formData).then((res) => {
      if (res.code === 10000) {
        resolve(res.content)
      } else {
        ElMessage.error(res.subMessage)
      }
    })
  })
}
// 类型（1：文件，2：图片，3：视频，4：音频）
export function uploadFile(options) {
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('type', options.type)
  return new Promise((resolve) => {
    http('apiFileUpload', formData).then((res) => {
      if (res.code === 10000) {
        resolve(res.content)
      } else {
        ElMessage.error(res.subMessage)
      }
    })
  })
}

export function exportExcel(params, tempUrl = '') {
  if (!tempUrl) return false
  params.orgId = getStorage('orgId')
  // 导出表格
  const temConfig = {
    headers: {
      'Content-Type': 'application/json; application/octet-stream',
      authToken: getStorage('authToken'),
      masterOrgId: getStorage('masterOrgId'),
      moduleCode: getStorage('moduleCode'),
      appCode: getStorage('appCode')
    },
    responseType: 'blob'
  }
  return new Promise(() => {
    let url = import.meta.env.VITE_API_URL + tempUrl
    axios.post(url, params, temConfig).then((res) => {
      if (res.status === 200) {
        const blob = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
          // word文档为application/msword,pdf文档为application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8
        })
        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const fname = res.headers['content-disposition'].split('filename=')[1]
        link.href = objectUrl
        link.setAttribute('download', decodeURI(fname))
        document.body.appendChild(link)
        link.click()
      }
    })
  })
}
export const downloadFile = (url, fileName) => {
  let tempUrl = url
  let xhr = new XMLHttpRequest()
  xhr.open('GET', tempUrl, true)
  xhr.responseType = 'blob'

  xhr.onload = function () {
    if (xhr.status === 200) {
      let blob = xhr.response
      window.saveAs(blob, fileName)
    } else {
      console.log('Failed to download file')
    }
  }

  xhr.send()
}

const urlToBlobBase64 = (url) =>
  new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open('get', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (xhr.status === 200) {
        let blob = this.response
        let oFileReader = new FileReader()
        oFileReader.onloadend = function (e) {
          resolve({ blob, base64: e.target.result, dataURL: oFileReader.result })
        }
        oFileReader.readAsDataURL(blob)
      } else {
        reject(new Error('异常'))
      }
    }
    xhr.send()
    xhr.onerror = () => {
      reject(new Error('异常'))
    }
  })

export const downloadFileLink = async (url, fileName) => {
  // console.log(url, fileName)

  const loading = ElLoading.service({
    lock: true,
    text: '正在下载，请稍后....',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  urlToBlobBase64(url).then((blob) => {
    // console.log(blob, fileName, 6666)

    try {
      loading.close()
      ElMessage.success('下载完成！')
      const href = window.URL.createObjectURL(blob.blob) // 创建下载的链接
      // console.log(blob, fileName, href)
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName)
      } else {
        // 谷歌浏览器 创建a标签 添加download属性下载
        const downloadElement = document.createElement('a')
        downloadElement.href = href
        downloadElement.target = '_blank'
        downloadElement.download = fileName
        document.body.appendChild(downloadElement)
        downloadElement.click() // 点击下载
        document.body.removeChild(downloadElement) // 下载完成移除元素
        window.URL.revokeObjectURL(href) // 释放掉blob对象
      }
    } catch (e) {
      console.log('下载失败')
    }
  })
}
