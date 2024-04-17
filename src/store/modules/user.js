import { defineStore } from 'pinia'
import piniaPersistConfig from '@/config/piniaPersist'
import { http } from '@/api'

const storeId = `${import.meta.env.VITE_ABBREVIATION}-store-user`
export const useUserStore = defineStore({
  id: storeId,
  state: () => ({
    userInfo: {}
  }),
  getters: {},
  actions: {
    async getUserInfo() {
      let { content } = await http('findUserInfoById')
      this.userInfo = content
    }
  },
  persist: piniaPersistConfig(storeId)
})
