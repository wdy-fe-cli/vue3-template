<!-- 💥 这里是一次性加载 LayoutComponents -->
<template>
  <component :is="LayoutComponents[layout]" />
  <ThemeDrawer />
</template>

<script setup name="layout">
import { computed, onMounted } from 'vue'
import { useGlobalStore } from '@/store/modules/global'
import ThemeDrawer from './components/ThemeDrawer/index.vue'
import LayoutVertical from './LayoutVertical/index.vue'
import LayoutClassic from './LayoutClassic/index.vue'
import LayoutTransverse from './LayoutTransverse/index.vue'
import LayoutColumns from './LayoutColumns/index.vue'

import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()

const LayoutComponents = {
  vertical: LayoutVertical,
  classic: LayoutClassic,
  transverse: LayoutTransverse,
  columns: LayoutColumns
}

const globalStore = useGlobalStore()
const layout = computed(() => globalStore.layout)

onMounted(() => {
  setTimeout(() => {
    authStore.apiUserConfig()
  }, 50)
})
</script>

<style scoped lang="scss">
.layout {
  min-width: 730px;
}
</style>
