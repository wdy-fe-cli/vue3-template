// import mitt from 'mitt'

import { createApp } from 'vue'
import App from './App.vue'
// 页面样式
import components from '@/components/index.js'
import '@/styles/index.scss'
// eslint-disable-next-line import/order
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// svg-icons
import 'virtual:svg-icons-register'
//  vue router
import router from './router'
// vue i18n
import I18n from '@/languages/index'
// pinia store
import pinia from '@/store'
// errorHandler
import errorHandler from '@/utils/errorHandler'
// custom directives
import directives from '@/directives/index'

// const Mit = mitt()

const app = createApp(App)

app.config.errorHandler = errorHandler
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component)
})

// app.config.globalProperties.emitter = Mit

app.use(pinia).use(directives).use(I18n).use(router).use(components).mount('#app')
