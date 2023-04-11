import $services from '@/services'

const state = {
  userInfo: {},
  buttonAuth: []
}

const mutations = {
  SET_USER_INFO (state, payload) {
    state.userInfo = payload
  },
  SET_BUTTON_AUTH (state, payload) {
    state.buttonAuth = payload
  }
}

const actions = {
  async getUserInfoAsync ({ commit }) {
    try {
      const res = require('@/mock/userMsgMock.json');
      if (res && res.code === '200') {
        commit('SET_USER_INFO', res.data)
        commit('SET_BUTTON_AUTH', [])
      }
    } catch (e) {
      console.log('get userInfo err: ', e)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
