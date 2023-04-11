/**
 *  Created by windraxb on 2019/12/6.
 *  @description vuex getters collection
 */
const getters = {
  menuArr: (state) => state.menu.menuArr,
  getMenuFlag: (state) => state.menu.getMenuFlag,
  tabsArray: (state) => state.tabsView.tabsArray,
  buttonAuth: (state) => state.user.buttonAuth,
  userInfo: (state) => state.user.userInfo
}

export default getters
