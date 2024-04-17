import { createRouter, createWebHistory } from 'vue-router'
// import { useUserStore } from '@/store/modules/user'
import { useAuthStore } from '@/store/modules/auth'
import { ROUTER_WHITE_LIST } from '@/config'
import { getSsoDomain, goLogin, getToken } from '@/hooks/useLogin'

import { initDynamicRouter } from '@/router/modules/dynamicRouter'
import { staticRouter, errorRouter } from '@/router/modules/staticRouter'
import NProgress from '@/config/nprogress'
import { getStorage, setStorage } from '@/utils/storage.js'

/**
 * @description 📚 路由参数配置简介
 * @param path ==> 路由菜单访问路径
 * @param name ==> 路由 name (对应页面组件 name, 可用作 KeepAlive 缓存标识 && 按钮权限筛选)
 * @param redirect ==> 路由重定向地址
 * @param component ==> 视图文件路径
 * @param meta ==> 路由菜单元信息
 * @param meta.icon ==> 菜单和面包屑对应的图标
 * @param meta.title ==> 路由标题 (用作 document.title || 菜单的名称)
 * @param meta.activeMenu ==> 当前路由为详情页时，需要高亮的菜单
 * @param meta.isHide ==> 是否在菜单中隐藏 (通常列表详情页需要隐藏)
 * @param meta.isFull ==> 菜单是否全屏 (示例：数据大屏页面)
 * @param meta.isAffix ==> 菜单是否固定在标签页中 (首页通常是固定项)
 * @param meta.isKeepAlive ==> 当前路由是否缓存
 * */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: [...staticRouter, ...errorRouter],
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

/**
 * @description 路由拦截 beforeEach
 * */
router.beforeEach(async (to, from, next) => {
  // const userStore = useUserStore()
  const authStore = useAuthStore()
  // 1.NProgress 开始
  NProgress.start()

  // 2.动态设置标题
  const title = import.meta.env.VITE_GLOB_APP_TITLE
  document.title = to.meta.title ? `${to.meta.title} - ${title}` : title

  if (!getStorage('baseUri')) {
    await getSsoDomain()
  }
  /**
   * 如果路径上有这个说明其他系统传递了token过来，需要存储token
   */
  if (to.query.at) {
    setStorage('authToken', to.query.at)
    setStorage('masterOrgId', to.query.mo)
    setStorage('orgId', to.query.mo)
    return next({ path: to.path, replace: true })
  }
  /**
   * 如果路径上有验证code，需要用code去获取token
   */
  if (to.query.auth_code) {
    let path = await getToken(to)
    next({ path, replace: true })
  }

  // 4.判断访问页面是否在路由白名单地址(静态路由)中，如果存在直接放行
  if (ROUTER_WHITE_LIST.includes(to.path)) return next()
  // 5.判断是否有 Token，没有重定向到 login 页面
  if (!getStorage('authToken')) {
    goLogin()
    return
  }

  // 6.如果没有菜单列表，就重新请求菜单列表并添加动态路由
  if (!authStore.authMenuListGet.length) {
    await initDynamicRouter()
    return next({ ...to, replace: true })
  }

  // 7.存储 routerName 做按钮权限筛选
  authStore.setRouteName(to.name)

  // 8.正常访问页面
  next()
})

/**
 * @description 重置路由
 * */
export const resetRouter = () => {
  const authStore = useAuthStore()
  authStore.flatMenuListGet.forEach((route) => {
    const { name } = route
    if (name && router.hasRoute(name)) router.removeRoute(name)
  })
}

/**
 * @description 路由跳转错误
 * */
router.onError((error) => {
  NProgress.done()
  console.warn('路由错误', error.message)
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    // reload()：类似于点击浏览器上的刷新页面按钮
    window.location.reload()
  }
})

/**
 * @description 路由跳转结束
 * */
router.afterEach(() => {
  NProgress.done()
})

export default router
