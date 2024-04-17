<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { /* ref */ onMounted, reactive, computed /* nextTick */ /* provide */ } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useI18n } from 'vue-i18n'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import { useRoute } from 'vue-router'
import { getBrowserLang } from '@/utils'
import { useTheme } from '@/hooks/useTheme'
import { useGlobalStore } from '@/store/modules/global'
import { setStorage } from '@/utils/storage.js'

const globalStore = useGlobalStore()

// let isReload = ref(false)

// 二次提交解决路由跳转到相同页面，数据不刷新问题
/* const reload = () => {
  isReload.value = false
  nextTick(() => (isReload.value = true))
} */

// provide('Reload', reload)

// const route = useRoute()

if (import.meta.env.VITE_USER_NODE_ENV === 'development') {
  setStorage('moduleCode', '2')
  setStorage('appCode', '5')
  // 命令行
  // pnpm install --shamefully-flatten
  /* setStorage('authToken', '06bf9356-b11c-41d3-87e0-f3f7d0f4c90a')
  setStorage('masterOrgId', '1')
  setStorage('orgId', '1') */
  setStorage('authToken', '7185cc05-19cf-4336-a732-a4101eb9fcdc')
  setStorage('masterOrgId', '118555227189383168')
  setStorage('orgId', '118555227189383168')
  /* setStorage('masterOrgId', '118555227189383168')
  setStorage('orgId', '118555227189383168') */
}

// init theme
const { initTheme } = useTheme()
initTheme()

// init language
const i18n = useI18n()
onMounted(() => {
  const language = globalStore.language ?? getBrowserLang()
  i18n.locale.value = language
  globalStore.setGlobalState('language', language)
})

// element language
const locale = computed(() => {
  if (globalStore.language === 'zh') return zhCn
  if (globalStore.language === 'en') return en
  return getBrowserLang() === 'zh' ? zhCn : en
})

// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize)

// element button config
const buttonConfig = reactive({ autoInsertSpace: false })
</script>
