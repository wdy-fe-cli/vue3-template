/**
 * v-auth
 * 按钮权限指令
 */
import { useAuthStore } from '@/store/modules/auth'
import { apiUrls } from '@/api/index.js'

const auth = {
  mounted(el, binding) {
    const { value } = binding
    const authStore = useAuthStore()
    const currentPageRoles = authStore.authButtonListGet || []
    if (currentPageRoles && currentPageRoles[0] === 'all') return
    if (value instanceof Array && value.length) {
      const hasPermission = value.every((item) => {
        const temUrl = apiUrls.get(item)[0]
        return currentPageRoles.includes(temUrl)
      })
      if (!hasPermission) el.remove()
    } else {
      const temUrl = apiUrls.get(value)[0]
      if (!currentPageRoles.includes(temUrl)) el.remove()
    }
  }
}

export default auth
