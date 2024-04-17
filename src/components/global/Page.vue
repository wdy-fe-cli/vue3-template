<template>
  <div class="page-wrap" flex="dir:top box:first">
    <div class="ft16 bold mt16 ml16 mb8" v-if="title">
      {{ title }}
    </div>
    <div style="overflow: auto; padding: 16px; flex: 1" :class="hasHandler && 'handle-padding'">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String
  },
  hasHandler: {
    type: Boolean,
    default: true
  }
})
</script>
<style lang="scss" scoped>
.page-wrap {
  position: relative;
  box-sizing: border-box;
  background-color: #fff;
  width: 100%;
  height: 100%;
}
.handle-padding {
  margin-bottom: 70px;
}
</style>
