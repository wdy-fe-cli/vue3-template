<!-- 横向布局 -->
<template>
  <el-container class="layout">
    <el-header>
      <div class="logo flx-center">
        <img class="logo-img" src="/logo.png" v-if="!adminIcon" alt="logo" />
        <img class="logo-img" :src="adminIcon" alt="logo" v-else />
        <span class="logo-text">{{ APPTITLE }}</span>
      </div>
      <el-menu mode="horizontal" :default-active="activeMenu" :router="false" :unique-opened="false">
        <!-- 不能直接使用 SubMenu 组件，无法触发 el-menu 隐藏省略功能 -->
        <template v-for="subItem in menuList" :key="subItem.path">
          <el-sub-menu v-if="subItem.children?.length" :key="subItem.path" :index="subItem.path + 'el-sub-menu'">
            <template #title>
              <el-icon>
                <component :is="subItem.meta.icon"></component>
              </el-icon>
              <span>{{ subItem.meta.title }}</span>
            </template>
            <SubMenu :menu-list="subItem.children" />
          </el-sub-menu>
          <el-menu-item v-else :key="subItem.path + 'el-menu-item'" :index="subItem.path" @click="handleClickMenu(subItem)">
            <el-icon>
              <component :is="subItem.meta.icon"></component>
            </el-icon>
            <template #title>
              <span>{{ subItem.meta.title }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
      <ToolBarRight />
    </el-header>
    <Main />
  </el-container>
</template>

<script setup name="layoutTransverse">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import Main from '@/layouts/components/Main/index.vue'
import ToolBarRight from '@/layouts/components/Header/ToolBarRight.vue'
import SubMenu from '@/layouts/components/Menu/SubMenu.vue'
import { isExternal } from '@/utils/validate.js'
import { useGlobalStore } from '@/store/modules/global'

const globalStore = useGlobalStore()

const APPTITLE = import.meta.env.VITE_GLOB_APP_TITLE

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const adminIcon = computed(() => globalStore.adminIcon)
const menuList = computed(() => authStore.showMenuListGet)
const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path))

const handleClickMenu = (subItem) => {
  if (isExternal(subItem.path)) return window.open(subItem.path, '_blank')
  router.push(subItem.path)
  return null
}
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
