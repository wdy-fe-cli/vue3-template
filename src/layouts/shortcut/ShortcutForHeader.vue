<template>
  <div class="shortcut-wrap" flex="cross:center">
    <div
      class="item pointer ml16"
      flex="cross:center"
      @click="onLink(item)"
      v-for="item in shortcutForList"
      v-show="showShortcut"
      :class="activeMenu === item.path ? 'color-primary' : ''"
      :key="item.id">
      <el-icon>
        <component :is="item.icon"></component>
      </el-icon>
      <div class="ml8">{{ item.title }}</div>
    </div>
    <el-dropdown trigger="click" v-show="screenWidth < 1800 && showShortcut && shortcutForDropdown.length > 0">
      <div class="pointer ml28 color-primary" flex="cross:center">
        更多
        <el-icon><DArrowRight /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item in shortcutForDropdown" :key="item.id">
            <div @click="router.push(item.path)">{{ item.title }}</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div class="ml24 item pointer color-primary" @click="router.push('/shortcut')" flex="cross:center">
      <el-icon><Edit /></el-icon>
      <div class="ml8">快捷导航设置</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { isExternal } from '@/utils/validate'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
let screenWidth = ref(0)
let shortcutForList = ref([])
let shortcutForDropdown = ref([])

const onLink = (item) => {
  let url = item.path
  if (isExternal(url)) {
    url = `${url}?`
    window.open(url)
    return
  }
  router.push(url)
}

/**
 * 处理页面宽度与显示数据的逻辑
 */
const handleDataForShow = () => {
  const temAllData = JSON.parse(JSON.stringify(shortcuts.value))
  if (screenWidth.value > 1800) {
    shortcutForList.value = temAllData
  } else if (screenWidth.value < 1800 && screenWidth.value > 1600) {
    shortcutForList.value = temAllData.splice(0, 5)
    shortcutForDropdown.value = temAllData
  } else if (screenWidth.value < 1600 && screenWidth.value > 1400) {
    shortcutForList.value = temAllData.splice(0, 2)
    shortcutForDropdown.value = temAllData
  } else {
    shortcutForList.value = []
    shortcutForDropdown.value = temAllData
  }
}

onMounted(() => {
  screenWidth.value = document.body.clientWidth
  handleDataForShow()
  window.onresize = () =>
    (() => {
      window.screenWidth = document.body.clientWidth
      screenWidth.value = window.screenWidth
      handleDataForShow()
    })()
})

const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path))
const shortcuts = computed(() => authStore.shortcutsGet)
const showShortcut = computed(() => authStore.showShortcutGet)

watch(
  shortcuts,
  () => {
    handleDataForShow()
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
.shortcut-wrap {
  .item:hover {
    color: var(--el-color-primary);
    .icon {
      color: var(--el-color-primary);
    }
  }
}
</style>
