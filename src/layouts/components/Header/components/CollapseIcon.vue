<template>
  <div @click="changeCollapse" class="pointer ft24 wrap">
    <SvgIcon :name="!globalStore.isCollapse ? 'collapse' : 'b-collapse'"></SvgIcon>
  </div>
</template>

<script setup>
import { useGlobalStore } from '@/store/modules/global'

const globalStore = useGlobalStore()
const changeCollapse = () => globalStore.setGlobalState('isCollapse', !globalStore.isCollapse)
</script>

<style scoped lang="scss">
.wrap {
  padding: 0 6px 4px 6px;
  border-radius: 6px;
  background-color: var(--el-color-primary);
  color: #fff;
}
</style>
