<template>
  <div class="fullscreen">
    <i :class="['iconfont', isFullscreen ? 'icon-suoxiao' : 'icon-fangda']" class="toolBar-icon" @click="toggle"></i>
  </div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'

const { toggle, isFullscreen } = useFullscreen()
</script>
