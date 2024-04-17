<!-- 分栏布局 -->
<template>
  <el-container class="layout">
    <div class="aside-split">
      <div class="logo flx-center">
        <img class="logo-img" src="/logo.png" v-if="!adminIcon" alt="logo" />
        <img class="logo-img" :src="adminIcon" alt="logo" v-else />
      </div>
      <el-scrollbar>
        <div class="split-list">
          <div
            v-for="item in menuList"
            :key="item.path"
            class="split-item"
            :class="{ 'split-active': splitActive === item.path || `/${splitActive.split('/')[1]}` === item.path }"
            @click="changeSubMenu(item)">
            <el-icon>
              <component :is="item.meta.icon"></component>
            </el-icon>
            <span class="title">{{ item.meta.title }}</span>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-aside :class="{ 'not-aside': !subMenuList.length }" :style="{ width: isCollapse ? '65px' : '210px' }">
      <div class="logo flx-center">
        <span v-show="subMenuList.length" class="logo-text">{{ isCollapse ? 'G' : APPTITLE }}</span>
      </div>
      <el-scrollbar>
        <el-menu :default-active="activeMenu" :router="false" :collapse="isCollapse" :collapse-transition="false" :unique-opened="false">
          <SubMenu :menu-list="subMenuList" />
        </el-menu>
      </el-scrollbar>
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

<script setup name="layoutColumns">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useGlobalStore } from '@/store/modules/global'
import Main from '@/layouts/components/Main/index.vue'
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft.vue'
import ToolBarRight from '@/layouts/components/Header/ToolBarRight.vue'
import SubMenu from '@/layouts/components/Menu/SubMenu.vue'

const APPTITLE = import.meta.env.VITE_GLOB_APP_TITLE
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const globalStore = useGlobalStore()
const adminIcon = computed(() => globalStore.adminIcon)
const isCollapse = computed(() => globalStore.isCollapse)
const menuList = computed(() => authStore.showMenuListGet)
const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path))

const subMenuList = ref([])
const splitActive = ref('')
watch(
  () => [menuList, route],
  () => {
    // 当前菜单没有数据直接 return
    if (!menuList.value.length) return
    splitActive.value = route.path
    const menuItem = menuList.value.filter((item) => route.path === item.path || `/${route.path.split('/')[1]}` === item.path)
    if (menuItem[0] && menuItem[0].children?.length) {
      subMenuList.value = menuItem[0].children
    } else {
      subMenuList.value = []
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// change SubMenu
const changeSubMenu = (item) => {
  splitActive.value = item.path
  if (item.children?.length) {
    subMenuList.value = item.children
  } else {
    subMenuList.value = []
    router.push(item.path)
  }
}
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
