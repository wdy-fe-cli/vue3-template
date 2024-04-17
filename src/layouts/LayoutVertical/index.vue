<!-- 纵向布局 -->
<template>
  <el-container class="layout">
    <el-aside>
      <div class="aside-box" :style="{ width: isCollapse ? '65px' : '210px' }">
        <router-link :to="HOME_URL">
          <div class="logo flx-center">
            <img class="logo-img" src="/logo.png" v-if="!adminIcon" alt="logo" />
            <img class="logo-img" :src="adminIcon" alt="logo" v-else />
            <span v-show="!isCollapse" class="logo-text">{{ APPTITLE }}</span>
          </div>
        </router-link>
        <el-scrollbar>
          <el-menu :default-active="activeMenu" :collapse="isCollapse" :router="false" :unique-opened="false" :collapse-transition="false">
            <SubMenu :menu-list="menuList" />
          </el-menu>
        </el-scrollbar>
      </div>
    </el-aside>
    <el-container>
      <el-header>
        <ToolBarLeft />
        <ToolBarRight />
      </el-header>
      <Main />
    </el-container>
  </el-container>
</template>

<script setup name="layoutVertical">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import Main from '@/layouts/components/Main/index.vue'
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft.vue'
import ToolBarRight from '@/layouts/components/Header/ToolBarRight.vue'
import SubMenu from '@/layouts/components/Menu/SubMenu.vue'
import { HOME_URL } from '@/config'

const APPTITLE = import.meta.env.VITE_GLOB_APP_TITLE

const route = useRoute()
const authStore = useAuthStore()
const globalStore = useGlobalStore()
const adminIcon = computed(() => globalStore.adminIcon)
const isCollapse = computed(() => globalStore.isCollapse)
const menuList = computed(() => authStore.showMenuListGet)
const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path))
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
