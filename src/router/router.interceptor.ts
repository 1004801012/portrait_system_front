import { clearPending } from '@/services/pending'
import { Route } from 'vue-router'
import router from './index'
import { getToken } from '@/utils/auth'
import store from '@/store'

const whiteList: string[] = ['/login']

const routerArr = [{
  path: '/',
  name: 'main',
  component (resolve) {
    require(['@/layout'], resolve)
  },
  children: []
}]

function buildRoute (menu, root: any[] = routerArr[0].children) {
  menu.map(item => {
    if (item.childMenus.length > 0) {
      buildRoute(item.childMenus)
    } else {
      const config = JSON.parse(item.extend)
      const namePrimary = (item.url.split('/').slice(-1))[0]
      const name = `${namePrimary.charAt(0).toUpperCase()}${namePrimary.slice(1)}`
      const obj: any = {
        path: item.url,
        name,
        meta: {
          menuName: config.fullName || item.name,
          keepAlive: config.components !== 'index' //  首页不作为缓存项
        },
        component: () => import(`@views/${config.components}`)
      }
      root.push(obj)
    }
  })
}

function tabsOperation (to) {
  // @ts-ignore
  if (!store.state.tabsView.tabsArray.some(item => item.path === to.path)) {
    store.commit('tabsView/addTabsArray', to)
  } else {
    // @ts-ignore
    store.state.tabsView.tabsArray.forEach(item => {
      item.meta.isCur = item.path === to.path
    })
  }
}

router.beforeEach(async (to: Route, from: Route, next: any) => {
  if (getToken() && getToken() !== undefined) {
    if (!store.getters.getMenuFlag) {
      const flag = await store.dispatch('menu/getMenu')
      await store.dispatch('user/getUserInfoAsync')
      if (flag) {
        // @ts-ignore
        buildRoute(store.state.menu.menuArr)
        router.addRoutes(routerArr)
        clearPending()
        next(to.path)
      }
    }

    if (to.path === '/login') {
      clearPending()
      next('/')
    } else {
      if (to.matched.length > 0) {
        tabsOperation(to)
      }
      clearPending()
      next()
    }
    if (to.path === '/') {
      clearPending()
      next('/index')
    }
  } else {
    //  未登录
    if (whiteList.includes(to.path)) {
      clearPending()
      next()
    } else {
      clearPending()
      next('/login')
    }
  }
})
