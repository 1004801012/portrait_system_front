import $services from '@/services'
import { MessageBox } from 'element-ui'
import { removeToken } from '@/utils/auth'

const state = {
  menuArr: [],
  getMenuFlag: false
}

const mutations = {
  SET_MENU_ARR (state, payload) {
    state.menuArr = payload
  },
  SET_CHANGE_MENU_FLAG (state, payload) {
    state.getMenuFlag = payload
  }
}

const actions = {
  async getMenu ({ commit }) {
    try {
      const res = require('@/mock/leftMenu.json')
      if (res && res.code === '200') {
        if (Array.isArray(res.data) && res.data.length > 0) {
          commit('SET_MENU_ARR', res.data)
          commit('SET_CHANGE_MENU_FLAG', true)
          return true
        } else {
          MessageBox.alert('请设置用户角色后再登录~', '提示', {
            type: 'error',
            confirmButtonText: '确定',
            callback: () => {
              removeToken()
              window.location.reload()
            }
          })
          return false
        }
      } else {
        console.log('get menuArr err')
        MessageBox.alert('系统异常，请联系技术人员', '提示', {
          type: 'error',
          confirmButtonText: '确定',
          callback: () => {
            removeToken()
            window.location.reload()
          }
        })
        return false
      }
    } catch (e) {
      console.log('get menuArr err:', e)
      MessageBox.alert('网络异常，请联系技术人员', '提示', {
        type: 'error',
        confirmButtonText: '确定',
        callback: () => {
          removeToken()
          window.location.reload()
        }
      })
      return false
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
