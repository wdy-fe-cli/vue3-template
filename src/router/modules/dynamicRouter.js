import { ElNotification } from 'element-plus'

import { goLogin } from '@/hooks/useLogin'

import router from '@/router/index'

import { useAuthStore } from '@/store/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import { useOrgStore } from '@/store/modules/org'

// 引入 views 文件夹下所有 vue 文件
const modules = import.meta.glob('@/views/**/*.vue')

/**
 * @description 初始化动态路由
 */
export const initDynamicRouter = async () => {
  const authStore = useAuthStore()
  const orgStore = useOrgStore()
  const globalStore = useGlobalStore()

  try {
    // 初始化应用的信息
    await globalStore.setAppInfo()
    // 获取平台管理的组织树
    await orgStore.findSubstantiveOrganizationTreeByUser(true)
    await orgStore.findSubstantiveOrganizationTreeByUser1(true)
    // 获取关联组织树列表
    await orgStore.findAssociationOrgFilterTree()
    // 1.获取菜单列表 && 按钮权限列表
    await authStore.getAuthMenuList()
    await authStore.getAuthButtonList()
    // 2.判断当前用户有没有菜单权限
    if (!authStore.authMenuListGet.length) {
      ElNotification({
        title: '无权限访问',
        message: '当前账号无任何菜单权限，请联系系统管理员！',
        type: 'warning',
        duration: 3000,
      })
      // goLogin()
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('No permission')
    }
    // 3.添加动态路由
    authStore.flatMenuListGet.forEach((item) => {
      item.children && delete item.children
      if (item.component && typeof item.component === 'string') {
        item.component = modules[`/src/views${item.component}.vue`]
      }
      if (item.meta && item.meta.isFull) {
        router.addRoute(item)
      } else {
        router.addRoute('layout', item)
      }
    })
  } catch (error) {
    console.log(error)
    // 当按钮 || 菜单请求出错时，重定向到登陆页
    goLogin()
    return Promise.reject(error)
  }
}
