<template>
  <el-dropdown trigger="click" :teleported="false">
    <el-button v-blur size="small" type="primary">
      <span>{{ $t('tabs.more') }}</span>
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="refresh">
          <el-icon><Refresh /></el-icon>
          {{ $t('tabs.refresh') }}
        </el-dropdown-item>
        <el-dropdown-item @click="maximize">
          <el-icon><FullScreen /></el-icon>
          {{ $t('tabs.maximize') }}
        </el-dropdown-item>
        <el-dropdown-item divided @click="closeCurrentTab">
          <el-icon><Remove /></el-icon>
          {{ $t('tabs.closeCurrent') }}
        </el-dropdown-item>
        <el-dropdown-item @click="closeOtherTab">
          <el-icon><CircleClose /></el-icon>
          {{ $t('tabs.closeOther') }}
        </el-dropdown-item>
        <el-dropdown-item @click="closeAllTab">
          <el-icon><FolderDelete /></el-icon>
          {{ $t('tabs.closeAll') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HOME_URL } from '@/config'
import { useTabsStore } from '@/store/modules/tabs'
import { useGlobalStore } from '@/store/modules/global'
import { useKeepAliveStore } from '@/store/modules/keepAlive'

const route = useRoute()
const router = useRouter()
const tabStore = useTabsStore()
const globalStore = useGlobalStore()
const keepAliveStore = useKeepAliveStore()

// refresh current page
const refreshCurrentPage = inject('refresh')
const refresh = () => {
  setTimeout(() => {
    keepAliveStore.removeKeepAliveName(route.name)
    refreshCurrentPage(false)
    nextTick(() => {
      keepAliveStore.addKeepAliveName(route.name)
      refreshCurrentPage(true)
    })
  }, 0)
}

// maximize current page
const maximize = () => {
  globalStore.setGlobalState('maximize', true)
}

// Close Current
const closeCurrentTab = () => {
  if (route.meta.isAffix) return
  tabStore.removeTabs(route.fullPath)
  keepAliveStore.removeKeepAliveName(route.name)
}

// Close Other
const closeOtherTab = () => {
  tabStore.closeMultipleTab(route.fullPath)
  keepAliveStore.setKeepAliveName([route.name])
}

// Close All
const closeAllTab = () => {
  tabStore.closeMultipleTab()
  keepAliveStore.setKeepAliveName()
  router.push(HOME_URL)
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
