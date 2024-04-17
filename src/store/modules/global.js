import { defineStore } from 'pinia'
import { DEFAULT_PRIMARY } from '@/config'
import piniaPersistConfig from '@/config/piniaPersist'
import { http } from '@/api/index.js'
import { setStorage } from '@/utils/storage.js'
import { getSsoDomain } from '@/hooks/useLogin'

const storeId = `${import.meta.env.VITE_ABBREVIATION}-store-global`
export const useGlobalStore = defineStore({
  id: storeId,
  // 修改默认值之后，需清除 localStorage 数据
  state: () => ({
    // 布局模式 (纵向：vertical | 经典：classic | 横向：transverse | 分栏：columns)
    layout: 'vertical',
    // element 组件大小
    assemblySize: 'default',
    // 当前系统语言
    language: 'zh',
    // 当前页面是否全屏
    maximize: false,
    // 主题颜色
    primary: DEFAULT_PRIMARY,
    // 深色模式
    isDark: false,
    // 灰色模式
    isGrey: false,
    // 色弱模式
    isWeak: false,
    // 侧边栏反转 (目前仅支持 'vertical' 模式)
    asideInverted: false,
    // 折叠菜单
    isCollapse: false,
    // 面包屑导航
    breadcrumb: true,
    // 面包屑导航图标
    breadcrumbIcon: true,
    // 标签页
    tabs: true,
    // 标签页图标
    tabsIcon: true,
    // 页脚
    footer: false,
  }),
  getters: {},
  actions: {
    // Set GlobalState
    setGlobalState(...args) {
      this.$patch({ [args[0]]: args[1] })
    },
    // 获取应用基础信息
    async setAppInfo() {
      // 跳转登录需要的信息
      await getSsoDomain()
      const params = {
        abbreviation: import.meta.env.VITE_ABBREVIATION,
      }
      try {
        let res = await http('findModuleApplicationByAbbreviation', params)
        this.adminTitle = res.content.name
        this.adminIcon = res.content.icon
        // 模块和app信息
        setStorage('moduleCode', res.content?.moduleCode)
        setStorage('appCode', res.content?.code)

        return Promise.resolve(true)
      } catch (error) {
        console.log(error)
      }
    },
  },
  persist: piniaPersistConfig(storeId),
})
