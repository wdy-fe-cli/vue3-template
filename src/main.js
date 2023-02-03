import { createApp } from 'vue'
import router from './router'
import '@/router/filter.js'
import store from '@/store'

import './assets/css/reset.scss'
import 'normalize.css'
import App from './App.vue'
import { http } from './api/index'

import ElementPlus from 'element-plus'
import './assets/css/element.scss'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.mount('#app')

app.config.globalProperties.$http = http
