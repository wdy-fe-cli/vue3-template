<template>
  <div class="tool-bar-lf">
    <CollapseIcon id="collapseIcon" />
    <OrgsSelect id="OrgsSelect" />
    <shortcut-for-header></shortcut-for-header>
    <!-- <Breadcrumb v-if="globalStore.breadcrumb" id="breadcrumb" /> -->
  </div>
</template>

<script setup>
// import { useGlobalStore } from '@/store/modules/global'
import CollapseIcon from './components/CollapseIcon.vue'
import ShortcutForHeader from '../../shortcut/ShortcutForHeader.vue'
// import Breadcrumb from './components/Breadcrumb.vue'
import OrgsSelect from './components/OrgsSelect.vue'

// const globalStore = useGlobalStore()
</script>

<style scoped lang="scss">
.tool-bar-lf {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
}
</style>
