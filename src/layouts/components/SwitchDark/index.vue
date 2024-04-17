<template>
  <el-switch v-model="globalStore.isDark" inline-prompt :active-icon="Sunny" :inactive-icon="Moon" @change="switchDark" />
</template>

<script setup name="SwitchDark">
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useTheme } from '@/hooks/useTheme'
import { useGlobalStore } from '@/store/modules/global'

const { switchDark } = useTheme()
const globalStore = useGlobalStore()
</script>
