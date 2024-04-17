import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getStorage, setStorage } from '@/utils/storage.js'
import { showReqError } from '@/hooks/useError'
import { escapeUrl } from '@/utils'

/**
 * 跳转到登录中心
 */
export function goLogin() {
  if (import.meta.env.VITE_USER_NODE_ENV === 'development') {
    throw new Error('本地环境不能跳转登录')
  }

  const baseUri = getStorage('baseUri')
  const masterOrgId = getStorage('masterOrgId')
  setStorage('authToken', '')
  window.location.href = `${baseUri}/auth?redirect_uri=${import.meta.env.VITE_ABBREVIATION}&masterOrgId=${masterOrgId}`
}

// 跳转其它系统
export function jumpOtherApp(abbreviation, path) {
  if (!path) return console.log('必要信息没传')

  const baseUri = getStorage('baseUri')
  const masterOrgId = getStorage('masterOrgId')

  const otherAppUrl = `${baseUri}/auth?redirect_uri=${abbreviation}&masterOrgId=${masterOrgId}&path=${path}`
  window.open(otherAppUrl)
}

// 根据code获取token
export async function getToken(to) {
  const formData = new FormData()
  formData.append('code', to.query.auth_code)
  formData.append('redirect_uri', `${window.location.origin}${import.meta.env.VITE_PUBLIC_PATH}`)
  formData.append('appid', 'browser')
  formData.append('grant_type', 'authorization_code')
  formData.append('abbreviation', import.meta.env.VITE_ABBREVIATION)
  try {
    let res = await axios({
      url: '/sso/auth/oauth/token',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    const tokenErrorSubCode = ['CODE_INVALID', 'NOT_GENERATE']
    if (tokenErrorSubCode.includes(res.data.subCode)) return goLogin()

    const { access_token, moduleCode, appCode, masterOrgId, orgId } = res.data.content
    setStorage('authToken', access_token)
    setStorage('moduleCode', moduleCode)
    setStorage('appCode', appCode)
    setStorage('masterOrgId', masterOrgId)
    setStorage('orgId', orgId)

    if (to.path !== '/' && to.path !== '/home') {
      // 分离删除 auth_code
      let targetPath = to.fullPath.split('&auth_code=')[0]
      targetPath = escapeUrl(targetPath)
      // 跳转过来的系统，orgId 替换
      const { resetOrgId, moduleRoleId } = to.query
      if (resetOrgId) {
        setStorage('orgId', resetOrgId)
        setStorage('moduleRoleId', moduleRoleId)
      }
      return Promise.resolve(targetPath)
    }
    return Promise.resolve('/')
  } catch (error) {
    console.log(error)
  }
}

// 获取跳转地址
export async function getSsoDomain(params) {
  try {
    let res = await axios({
      url: '/sso/auth/findLoginUriAndSsoDomain',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: params
    })
    setStorage('baseUri', res.data.content.baseUri)
    setStorage('ssoDomain', res.data.content.ssoDomain)
    setStorage('loginUri', res.data.content.loginUri)
    return Promise.resolve(true)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 退出登录
 */
export async function confirmLogout() {
  const formData = new FormData()
  formData.append('access_token', getStorage('authToken'))
  try {
    let res = await axios({
      url: '/sso/auth/logout',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })

    if (res.isError) return showReqError(res)
    setStorage('authToken', '')
    ElMessage.success('退出登录成功')
    goLogin()
  } catch (error) {
    console.log(error)
  }
}
