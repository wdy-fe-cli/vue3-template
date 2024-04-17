import { defineStore } from 'pinia'

export const useKeepAliveStore = defineStore({
  id: 'store-keepAlive',
  state: () => ({
    keepAliveName: []
  }),
  actions: {
    // Add KeepAliveName
    async addKeepAliveName(name) {
      if (!this.keepAliveName) this.keepAliveName = []
      if (!this.keepAliveName.includes(name)) {
        this.keepAliveName.push(name)
      }
    },
    // Remove KeepAliveName
    async removeKeepAliveName(name) {
      this.keepAliveName = this.keepAliveName.filter((item) => item !== name)
    },
    // Set KeepAliveName
    async setKeepAliveName(keepAliveName) {
      this.keepAliveName = keepAliveName
    },
    // 清空keepAliveName
    async emptyKeepAliveName() {
      this.keepAliveName = []
    }
  }
})
