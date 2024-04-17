import { defineStore } from 'pinia'
import { http } from '@/api'
// import piniaPersistConfig from '@/config/piniaPersist'
import { setStorage, getStorage } from '@/utils/storage'
import { showReqError } from '@/hooks/useError'

const storeId = `${import.meta.env.VITE_ABBREVIATION}-store-org`

export const useOrgStore = defineStore({
  id: storeId,
  state: () => ({
    // 组织树列表
    platformOrgFilterTree: [],
    topOrgList: [],
    topOrgList1: [],
    platformOrgInfo: { id: '', name: '' },
    isStore: false, // 当前操作的是否是店铺
    associationOrgFilterTree: [], // 关联组织树列表
    associationOrgInfo: '', // 关联组织信息
  }),
  getters: {
    // 组织树列表
    platformOrgFilterTreeGet: (state) => state.platformOrgFilterTree,
    // 关联组织树列表 用于关联组织树选择
    associationOrgFilterTreeGet: (state) => state.associationOrgFilterTree,
    // 关联组织店铺信息
    associationOrgInfoGet: (state) => state.associationOrgInfo,

    topOrgListGet: (state) => state.topOrgList,
    topOrgListGet1: (state) => state.topOrgList1,
    platformOrgInfoGet: (state) => state.platformOrgInfo,
  },

  actions: {
    // Get  用户配置
    async findOrganizationFilterTree() {
      let res = await http('findOrganizationFilterTree')
      this.platformOrgFilterTree = res.content
      if (!this.platformOrgInfo.id) {
        this.platformOrgInfo = {
          id: res.content.id,
          name: res.content.name,
        }
      }
      if (!getStorage('orgId')) {
        setStorage('orgId', res.content.id)
      }
      if (!getStorage('moduleRoleId')) {
        setStorage('moduleRoleId', res.content.moduleRoleId)
      }
    },
    setPlatformOrgInfo(item) {
      this.platformOrgInfo = item
    },
    // 头部导航条信息

    async findSubstantiveOrganizationTreeByUser() {
      let data = await http('findSubstantiveOrganizationTreeByUser')
      if (data.isError || !data.content) return
      if (data.content.id !== data.content.masterOrgId) {
        setStorage('orgId', data.content.id)
        setStorage('moduleRoleId', data.content.moduleRoleId)
      }
      if (!getStorage('moduleRoleId')) {
        setStorage('moduleRoleId', data.content.moduleRoleId)
      }
      this.topOrgList = [data.content]
      return Promise.resolve(true)
    },
    async findSubstantiveOrganizationTreeByUser1() {
      let data = await http('findSubstantiveOrganizationTreeByUser', {
        relType: 1,
      })
      if (data.isError || !data.content) return
      if (data.content.id !== data.content.masterOrgId) {
        setStorage('orgId', data.content.id)
        setStorage('moduleRoleId', data.content.moduleRoleId)
      }
      if (!getStorage('moduleRoleId')) {
        setStorage('moduleRoleId', data.content.moduleRoleId)
      }
      this.topOrgList1 = [data.content]
      return Promise.resolve(true)
    },

    // 获取关联组织树列表
    async findAssociationOrgFilterTree() {
      try {
        let params = {
          orgId: getStorage('orgId'),
        }
        let res = await http('findOrganizationToStore', params)
        if (res.isError) return showReqError(res)

        this.associationOrgFilterTree = res.content

        // 默认关联组织店铺信息第一条
        if (res.content && res.content.length > 0) {
          // 默认关联组织店铺
          this.associationOrgInfo = res.content[0].children[0]
        } else {
          this.associationOrgInfo = ''
        }
      } catch (error) {
        console.log(error)
      }
    },

    // 设置关联组织店铺信息
    setAssociationOrgInfo(item) {
      this.associationOrgInfo = item
    },
  },
  // persist: piniaPersistConfig(storeId)
})
