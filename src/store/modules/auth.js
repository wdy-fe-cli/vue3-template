import { defineStore } from 'pinia'
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList } from '@/utils'
import { http } from '@/api'
import { getStorage } from '@/utils/storage'
import { isEmpty } from '@/utils/validate'
// import temMenu from './temMenu.json'

const storeId = `${import.meta.env.VITE_PUBLIC_PATH}store-auth`
export const useAuthStore = defineStore({
  id: storeId,
  state: () => ({
    // 按钮权限列表
    authButtonList: [],
    // 菜单权限列表
    authMenuList: [],
    // 当前页面的 router name，用来做按钮权限筛选
    routeName: '',
    // 根据用户的配置，显示导航上是否要添加快捷功能显示
    showShortcut: false,
    // 快捷方式
    shortcuts: []
  }),
  getters: {
    // 按钮权限列表
    authButtonListGet: (state) => state.authButtonList,
    // 快捷菜单列表
    shortcutsGet: (state) => state.shortcuts,
    // 获取用户快捷导航
    showShortcutGet: (state) => state.showShortcut,
    // 菜单权限列表 ==> 这里的菜单没有经过任何处理
    authMenuListGet: (state) => state.authMenuList,
    // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
    showMenuListGet: (state) => getShowMenuList(state.authMenuList),
    // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
    flatMenuListGet: (state) => getFlatMenuList(state.authMenuList),
    // 递归处理后的所有面包屑导航列表
    breadcrumbListGet: (state) => getAllBreadcrumbList(state.authMenuList)
  },

  actions: {
    // Get  用户配置
    async apiUserConfig() {
      let { content } = await http('apiUserConfig')
      // 系统设置不为空，则赋值showShortcut（根据用户的配置，显示导航上是否要添加快捷功能显示）
      if (!isEmpty(content.systemSetting) && content.systemSetting[0]) {
        this.showShortcut = Number(content.systemSetting[0].settingValue) === 1
      }
      if (!isEmpty(content.menuSetting) && content.menuSetting[0]) {
        this.shortcuts = content.menuSetting || []
      }
      return Promise.resolve(true)
    },
    // Get AuthButtonList
    async getAuthButtonList() {
      let { content } = await http('apiUserAuth')

      if (content?.authList && content?.authList.length > 0) {
        this.authButtonList = content.authList.map((item) => item.apiUrl)
      } else {
        this.authButtonList = ['all']
      }
      return Promise.resolve(true)
    },
    // Get AuthMenuList
    async getAuthMenuList() {
      const params = {
        moduleRoleId: getStorage('moduleRoleId'),
        orgId: getStorage('orgId')
      }
      // eslint-disable-next-line no-unused-vars
      let { content } = await http('findSysMenuByModuleCode', params)
      // let temData = content.map((item) => {})
      this.authMenuList = handleMenuData(content)

      return Promise.resolve(true)
    },
    // Set RouteName
    async setRouteName(name) {
      this.routeName = name
    }
  }
})

function handleMenuData(content) {
  const temArr = []
  if (content && content.length > 0) {
    content.forEach((item) => {
      const { activeMenu, icon, isAffix, isFull, isHide, isKeepAlive, isLink, title } = item
      item.meta = { activeMenu, icon, isAffix, isFull, isHide, isKeepAlive, isLink, title }
      if (!isEmpty(item.children)) {
        item.children = handleMenuData(item.children)
      }
      temArr.push(item)
    })
  }
  return temArr
}
