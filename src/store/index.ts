import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
// import createLogger from 'vuex/dist/logger'
// import createPersistedState from 'vuex-persistedstate'
// import { STORAGE_PREFIX } from '@/constant'
Vue.use(Vuex)

// const isProd = process.env.NODE_ENV === 'production'
// const createPersisted = createPersistedState({
//   paths: ['user.userInfo'],
//   key: `${STORAGE_PREFIX}VUEX_STORAGE`,
//   storage: window.sessionStorage,
//   reducer (val) {
//     return {
//       userInfo: val.user.userInfo
//     }
//   }
// })

const moduleFiles = require.context('./module', true, /\.ts$/)
const modules = moduleFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = moduleFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

export default new Vuex.Store({
  modules,
  getters
  // plugins: isProd ? [] : [createLogger()]
  // plugins: isProd ? [createPersisted] : [createLogger(), createPersisted]
})
