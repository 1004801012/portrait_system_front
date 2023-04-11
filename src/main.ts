import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import $services from './services';
// import './bus'
import './filters'
import './services'
import './router/router.interceptor'
import './assets/style/app.less'
import 'core-js/modules/es.array.push'
//  element-ui
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
//  auth
import auth from '@/directive/auth'
import { ICON_FONT_BASE_CLASS_NAME } from '@/constant'

Vue.use(ElementUI)
Vue.config.productionTip = false

Vue.directive('auth', auth)

Vue.prototype.$bus = new Vue()

Vue.mixin({
  data () {
    return {
      iconfontBaseName: ICON_FONT_BASE_CLASS_NAME
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
