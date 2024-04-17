<template>
  <div flex="cross:center" class="ml24">
    <div>当前组织：</div>
    <el-cascader class="cascader-company" v-model="currentOrgId" ref="cascaderRef" @change="changeOrgId" :show-all-levels="false" :options="topOrgList" :props="cascaderProps"></el-cascader>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { setStorage, getStorage } from '@/utils/storage'
import { useOrgStore } from '@/store/modules/org'
import { useAuthStore } from '@/store/modules/auth'
import { useKeepAliveStore } from '@/store/modules/keepAlive'

let cascaderRef = ref(null)
let currentOrgId = ref('')

const router = useRouter()

const orgStore = useOrgStore()
const authStore = useAuthStore()
const keepAliveStore = useKeepAliveStore()

const topOrgList = computed(() => orgStore.topOrgListGet1)
/**
 * 更换顶级组织
 */
const changeOrgId = () => {
  const temData = cascaderRef.value.getCheckedNodes()[0].data

  setStorage('moduleRoleId', temData.moduleRoleId)
  setStorage('orgId', currentOrgId.value)

  cascaderRef.value.togglePopperVisible()
  orgStore.isStore = temData.orgClassId === '9'

  authStore.getAuthMenuList()

  // 更换组织时，重新获取关联的组织列表
  // 获取关联组织树列表
  orgStore.findAssociationOrgFilterTree()

  // 只清空keepalive缓存，不清空顶部小tab
  keepAliveStore.emptyKeepAliveName()
  // 刷新当前页面，避免一直回跳到首页
  // router.go(0)

  // 回首页
  router.push('/')
}

// 初始化顶级组织
onMounted(() => {
  currentOrgId.value = getStorage('orgId')
})

// 配置
const cascaderProps = {
  value: 'id',
  children: 'children',
  label: 'name',
  checkStrictly: true,
  emitPath: false,
}
</script>

<style lang="scss" scoped>
.cascader-company {
  :deep .el-input__icon {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
