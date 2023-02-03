import { createApp } from 'vue'
import router from './router'
import '@/router/filter.js'
import { createPinia } from 'pinia'
import './assets/styles/reset.scss'
import 'normalize.css'
import App from './App.vue'
import { http } from './api/index'

import ElementPlus from 'element-plus'
import './assets/styles/element.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

app.config.globalProperties.$http = http
