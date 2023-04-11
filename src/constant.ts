/**
 * @authors windraxb
 * @description 定义项目所需常量
 */
const TIMEOUT = 25000 //  超时时间
const STORAGE_PREFIX = '42TEC_FARM_' //  webStorage前缀
const SPECIAL_COUPON_ID = '1' //  土地使用券ID
const ICON_FONT_BASE_CLASS_NAME = 'iconfont-garbage'
const SECONDS = window.LOCAL_CONFIG.SECONDS || 30000
// status
const REQUEST_STATUS = {
  // 查询成功
  QUERY_SUCCESS: '0',
  // 未登录或登录超时
  NOT_LOGIN_IN: '205001',
  // 登录冲突
  LOGIN_CONFLICT: '20',
  // 中银未登录或者超时
  SESSION_OUT: 9007
}
// 标签公式
const OPERATOROPTIONS = [
  {
    value: '0',
    label: '>'
  },
  {
    value: '4',
    label: '='
  },
  {
    value: '2',
    label: '<'
  },
  {
    value: '1',
    label: '>='
  }, {
    value: '3',
    label: '<='
  },
  {
    value: '5',
    label: '≠'
  }
]
const DICT_OPERATOROPTIONS = [
  {
    value: '4',
    label: '='
  },
  {
    value: '5',
    label: '≠'
  }
]

window.CT = {}
window.CT.OPERATOROPTIONS = OPERATOROPTIONS
window.CT.DICT_OPERATOROPTIONS = DICT_OPERATOROPTIONS

export {
  TIMEOUT,
  STORAGE_PREFIX,
  SPECIAL_COUPON_ID,
  ICON_FONT_BASE_CLASS_NAME,
  SECONDS,
  OPERATOROPTIONS,
  DICT_OPERATOROPTIONS,
  REQUEST_STATUS,
}
