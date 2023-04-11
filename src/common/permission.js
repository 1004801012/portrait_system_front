/**
 *
 * @authors liwb (you@example.org)
 * @date    2019/3/5 9:21
 * @version $ 登录成功之后初始化 菜单，操作员信息等
 */

import { Message } from 'element-ui';
import services from 'services';
import { setMenuIdList, setToken } from '@/common/auth';
import Cookies from 'js-cookie';

/**
 * 获取当前操作员权限下的菜单信息
 * @returns {Promise.<void>}
 */
export async function getUserPermissions() {
  try {
    const res = await services.getUserPermissions({});
    if (res) {
      const meunAry = res.data ? Object.keys(res.data[0]) : Object.keys(res);
      formatMeunIdListFunc(meunAry);
    } else {
      Message({ message: res.error_info, showClose: true });
    }
  } catch (err) {
    console.log('err', err);
    Message({ message: '获取当前操作员权限下的菜单信息' + err, showClose: true });
  }
}

/**
 * 格式化权限菜单列表信息
 * @param childList
 */
function formatMeunIdListFunc(meunAry = []) {
  const accessToken = Cookies.get('token');
  setToken(accessToken);
  const menuName = [
    'tagsReviewStatus',
    'auditTask',
    'tagsSearch',
    'tagsReview',
    'taskManager',
    'channelManager',
    'decisionTask',
    'eventSource'
  ];
  const menuIdList = [];
  meunAry.forEach((item) => {
    if (menuName.includes(item.split('$')[0])) {
      menuIdList.push(item.split('$')[1]);
    }
  });
  // 缓存menuId列表
  setMenuIdList(menuIdList);
}
/**
 * 获取当前操作员权限下的token
 * @returns {Promise.<void>}
 */
export async function getToken() {
  const username = 'admin';
  const password = 'Aa111111';
  const keys = ['hs', 'club', '33#44'];

  const params = {
    operator_code: BizSecurity.DES.encrypt(username, ...keys),
    password: BizSecurity.DES.encrypt(password, ...keys)
  };
  try {
    const res = await services.submitLogin({ method: 'get', data: params });
    if (res) {
      Cookies.set('token', res['user_token']);
      Cookies.set('operator_code', 'admin');
    }
  } catch (err) {
    console.log('err', '获取token失败' + err);
  }
}
