import createPersistedstate from 'vuex-persistedstate'
import getters from './getters'
import { createStore } from 'vuex'

const modulesFiles = import.meta.glob('./modules/*.js', { eager: true }) // 异步方式

let modules = {}
for (const [key, value] of Object.entries(modulesFiles)) {
  var moduleName = key.replace(/^\.\/(.*)\.\w+$/, '$1')
  const name = moduleName.split('/')[1]
  modules[name] = value.default
}

const store = createStore({
  modules,
  getters,
  //第二步是加这段代码,默认是存到了localStorage中
  plugins: [
    createPersistedstate({
      key: 'vuex-local', //存储持久状态的键。（默认：vuex）
      paths: ['user'] //部分持续状态的任何路径的数组。如果不加，默认所有。
      // storage: window.sessionStorage //默认存储到localStorage,想要存储到sessionStorage
    })
  ]
})

export default store
