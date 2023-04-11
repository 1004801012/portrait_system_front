import router from '@/router'

const state = {
  tabsArray: []
}

const mutations = {
  //  新增tabs
  addTabsArray (state, rootItem) {
    rootItem.meta.isCur = true
    if (state.tabsArray.length === 0) {
      state.tabsArray.push({
        path: '/index',
        name: 'index',
        meta: {
          menuName: '首页',
          isCur: true
        }
      })
    }

    if (rootItem.path !== '/index' && rootItem.path !== '/') {
      state.tabsArray.forEach(item => {
        item.meta.isCur = false
      })
      state.tabsArray.push(rootItem)
      state.tabsArray = Object.assign(state.tabsArray)
    }
  },
  //  清空tabs
  delAllTabs (state) {
    state.tabsArray = []
  },
  //  删除tabs
  delConfirmTabs (state, tab) {
    let index
    const length = state.tabsArray.length
    for (let i = 0; i < length; i++) {
      if (state.tabsArray[i].path === tab.path) {
        index = i
        break
      }
    }
    if (tab.meta.isCur) {
      //  如果是当前访问的页面
      if (index < length - 1) {
        router.push(state.tabsArray[index + 1].path)
      } else {
        router.push(state.tabsArray[index - 1].path)
      }
    }
    state.tabsArray.splice(index, 1)
  },
  //  关闭其他标签页
  delOtherTabs (state, tab) {
    if (tab.path === '/index') {
      state.tabsArray.splice(1, state.tabsArray.length - 1)
    }
    state.tabsArray = tab.path === '/index' ? [state.tabsArray[0]] : [state.tabsArray[0], tab]
    router.push(tab.path)
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
