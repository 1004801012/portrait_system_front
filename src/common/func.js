/**
 *
 * @authors liwb (you@example.org)
 * @date    2018/3/1 9:49
 * @version $
 */
import CONSTANT, { REQUEST_STATUS } from '../constant';
import {
  // removeToken,
  // removeMenuList,
  getMenuIdList,
  // removeMenuIdList,
  // removeAttrTags,
  // removeFitTags,
  // removeDoneTags,
  // removeTagDicts,
  // removeTagAttrQuery,
  getBranchInfoList
} from '@/common/auth';

export function navigateTo(url, params = {}, d = 1, reload = false) {
  if (d) {
    Object.assign(params, { d: d });
  }
  if (reload) {
    window.vm.$router.replace({ path: url, query: params });
  } else {
    window.vm.$router.push({ path: url, query: params });
  }
}

// 接口请求统一处理
export function callback(data, success, fail) {
  const STATUS = REQUEST_STATUS;
  if (String(data.error_no) === STATUS.QUERY_SUCCESS) {
    typeof success === 'function' && success();
  } else {
    typeof fail === 'function' && fail();
  }
}

/**
 * 标签公式匹配操作符描述
 * @param name
 */
export function matchLabelFormulaOperator(operator) {
  return window.CT.OPERATOROPTIONS.filter((item) => item.value === String(operator))[0].label;
}

/**
 * echarts 暂无数据展示
 * @param initChart get echarts instance
 * @param infoStr 暂时的信息
 */
export function showChartNoData(initChart, infoStr) {
  const msgOption = {
    title: {
      show: true,
      textStyle: {
        color: '#666666',
        fontWeight: 'normal',
        fontSize: 12
      },
      text: infoStr,
      left: 'center',
      top: 'center'
    },
    xAxis: {
      show: false
    },
    yAxis: {
      show: false
    },
    series: []
  };
  initChart.clear();
  initChart.hideLoading();
  initChart.setOption(msgOption);
}

// 退出登录
export function logout() {
  clearSessionStorage();
  window.localStorage.clear();
  // removeToken();
  // removeMenuList();
  // removeMenuIdList();
  // removeAttrTags();
  // removeFitTags();
  // removeDoneTags();
  // removeTagDicts();
  // removeTagAttrQuery();
}

/**
 * 排序函数
 */
export function sortNumber(a, b) {
  return a - b;
}

// sessionstorage操作
export function setSessionStorageItem(itemKey, itemValue) {
  isSeesionStorageNameSupported() && sessionStorage.setItem(itemKey, itemValue);
}

export function getSessionStorageItem(itemKey) {
  if (isSeesionStorageNameSupported()) {
    return sessionStorage.getItem(itemKey);
  }
}

export function removeSessionStorageItem(itemKey) {
  if (isSeesionStorageNameSupported()) {
    return sessionStorage.removeItem(itemKey);
  }
}

export function clearSessionStorage() {
  isSeesionStorageNameSupported() && sessionStorage.clear();
}

function isSeesionStorageNameSupported() {
  const win = window;
  const sessionStorageName = 'sessionStorage';

  try {
    return sessionStorageName in win && win[sessionStorageName];
  } catch (err) {
    return false;
  }
}

// localstore
export function setLocalStorageItem(itemKey, itemValue) {
  isLocalStorageNameSupported() && localStorage.setItem(itemKey, itemValue);
}

export function getLocalStorageItem(itemKey) {
  if (isLocalStorageNameSupported()) {
    return localStorage.getItem(itemKey);
  }
}

export function removeLocalStorageItem(itemKey) {
  if (isLocalStorageNameSupported()) {
    return localStorage.removeItem(itemKey);
  }
}

export function clearLoaclStorage() {
  isLocalStorageNameSupported() && localStorage.clear();
}

function isLocalStorageNameSupported() {
  const win = window;
  const localStorageName = 'localStorage';

  try {
    return localStorageName in win && win[localStorageName];
  } catch (err) {
    return false;
  }
}

/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        传入函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，调用触发于开始边界而不是结束边界
 * @return {function}             返回客户调用函数
 */
export function debounce(func, wait, immediate) {
  let timeout = '';
  let args = '';
  let context = '';
  let timestamp = '';
  let result = '';

  const later = function () {
    // 据上一次触发时间间隔
    const last = Date.now() - timestamp;

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * 多重数组合并
 * @param arr
 * @returns {*}
 */
export function flatten(arr) {
  arr = [].concat.apply([], arr);
  return arr.some(Array.isArray) ? flatten(arr) : arr;
}

/**
 * 判断menuId是否存在与Localtorage中
 * @param menuId
 */
export function getMenuAuth(menuId) {
  // console.log('getMenuAuth', menuId);
  const menuIdList = getMenuIdList();
  return Array.isArray(menuIdList) && menuIdList.indexOf(String(menuId)) >= 0;
}

/**
 * 截取字符串(url后的参数部分)
 * @param str 原字符串
 */
export function getCaption(str) {
  const index = str.lastIndexOf('?');
  str = str.substring(index + 1, str.length);
  return str;
}

/**
 * 判断如果为当前页最后一条数据，则删除后默认查询上一页
 * @param tableData
 * @param pageNo
 * @returns {number}
 */
export function setTablePageNo(tableData, pageNo) {
  return tableData.length === 1 && pageNo > 1 ? --pageNo : pageNo;
}

/**
 * 分批加载数据
 * @param data  数据源
 * @param func  回调函数
 * @param interval  时间间隔
 * @param count   每批加载数量
 */
export function timeChunk(data, func, interval, count) {
  let obj, timer;
  const start = function () {
    for (let i = 0; i < Math.min(count || 1, data.length); i++) {
      obj = data.shift();
      func(obj);
    }
  };
  timer = setInterval(function () {
    if (data.length === 0) {
      return clearInterval(timer);
    }
    start();
  }, interval);
}

/**
 * 格式化组织机构名称
 * @param no
 * @returns {*}
 */
export function formatBranchInfoFunc(no) {
  no = Number(no);
  const branchList = getBranchInfoList();
  const branchName = branchList.find((item) => {
    return item.value === no;
  });
  return branchName ? branchName.label : no;
}

/**
 * 格式化组织机构编号
 * @param agency
 * @returns {*}
 */
export function formatBranchNoFunc(agency) {
  const branchList = getBranchInfoList();
  const branchName = branchList.find((item) => {
    return item.label === agency;
  });
  return branchName ? branchName.value : agency;
}

// 去重
export function removeRepeatArrObj(arrObj) {
  const obj = {};
  return arrObj.filter((item, index) => {
    return obj.hasOwnProperty(typeof item + JSON.stringify(item))
      ? false
      : (obj[typeof item + JSON.stringify(item)] = true);
  });
}

// 中原券商 SSO 登录地址
export function getZYSSOAuthUri() {
  const uri = location.protocol + '//' + location.host + location.pathname;
  const zyCallback = encodeURIComponent(uri).toLowerCase();
  const REDIRECT_URI = `${window.DMP_CONFIG.AUTHORIZE_URL}?redirect_uri=${zyCallback}&client_id=${window.DMP_CONFIG.CLIENT_ID}&response_type=code`;

  return REDIRECT_URI;
}

// 树形数据的搜索方法
export function breadthQuery(tree, id) {
  console.log(tree, id);
  let stark = [];

  stark = stark.concat(tree);

  while (stark.length) {
    const temp = stark.shift();
    if (temp.children) {
      stark = stark.concat(temp.children);
    }
    if (temp.id === id) {
      return temp;
    }
  }
}

export function isInteger(obj) {
  return Math.floor(obj) === obj;
}

// 秒转换成时分
export function formatSecondToHM(result) {
  result = Number(result);
  const h = Math.floor((result / 3600) % 24);
  const m = Math.floor((result / 60) % 60);
  if (h < 1) {
    if (m < 1) {
      return result + 's';
    }
    return m + 'm';
  } else {
    return h + 'h' + '-' + m + 'm';
  }
}

/**
 * 错误码校验（用于客群视图绘制接口）
 *
 * @param   {[type]}  errorNo  [errorNo description]
 *
 * @return  {[type]}           [return description]
 */
export function checkErrorNoFunc(errorNo) {
  const dict = [2, 10001, 10008, 10009, 10101, 10102, 10103, 10104, 10105, 10108, 10109, 10110, 10111, 10004, 10012];
  return dict.includes(Number(errorNo));
}

/**
 * 生成uuid
 *
 * @param   {[type]}  len    [len description]
 * @param   {[type]}  radix  [radix description]
 *
 * @return  {[type]}         [return description]
 */
export function uuid(len, radix) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = [];
  let i;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}

/**
 * 请求参数key排序得到转译字符串（防重放）
 *
 * @param   {[type]}  configParam    请求配置对象
 *
 * @return  {[type]}            排序后的转译字符串
 */
export function handleParamsToStr(configParam) {
  const config = configParam;
  // 将method变大写
  const method = config.method.toUpperCase();
  // 获取contentPath
  const domain = `${config.baseURL.split('/')[0]}//${config.baseURL.split('/')[2]}`;
  const contentPath = `${config.baseURL.split(domain)[1]}${config.url}`;
  // 生成随机数
  const signatureNonce = uuid(6, 10);
  // 生成时间戳
  const date = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const timeStamp = `${date.split(' ')[0]}T${date.split(' ')[1]}Z`;
  // 待加密串参数排序
  let signStr = '';
  if (method === 'POST') {
    // post请求
    if (~config.headers['Content-Type'].indexOf('json')) {
      // json类型的取data值（将对象内的参数格式化为&连接的字符串）
      const dataObj = JSON.parse(config.data);
      const dataList = [];
      for (const key in dataObj) {
        if (dataObj[key] !== null) {
          dataList.push(`${key}=${dataObj[key]}`);
        }
      }
      const dataStr = dataList.join('&');
      signStr = sequenceParamStr(dataStr, signatureNonce, timeStamp);
    } else {
      signStr = sequenceParamStr(config.data, signatureNonce, timeStamp);
    }
  } else if (method === 'GET') {
    // get请求
    signStr = sequenceParamStr(config.params, signatureNonce, timeStamp);
  }
  console.log('添加signatureNonce、timeStamp参数并排序后的参数串：', signStr);
  // 待加密串
  const resultStr = `${method}&${encodeURIComponent(contentPath)}&${encodeURIComponent(signStr)}`;
  // 加密结果
  const sign = handleParamStrBySHA(resultStr);
  // 返回排序后的参数串、appKey、timestamp、signatureNonce、signature
  return { appKey: window.DMP_CONFIG.APP_KEY, TimeStamp: timeStamp, SignatureNonce: signatureNonce, sign };
}

/**
 * 参数串排序（防重放）
 *
 * @param   str  原参数串
 * @param   signatureNonce  签名随机数
 * @param   timeStamp  时间戳
 *
 * @return  {[type]}       排序后的参数串
 */
export function sequenceParamStr(str, signatureNonce, timeStamp) {
  const { keyList, paramData } = formatDataStrToObjecList(str);
  // 将参数排序，得到排序后的参数串
  const keyListNew = keyList.sort();
  const paramList = [];
  keyListNew.forEach((item) => {
    paramList.push(`${item}=${paramData[item]}`);
  });
  // 增加参数
  paramList.push(`SignatureNonce=${signatureNonce}`);
  paramList.push(`TimeStamp=${timeStamp}`);
  paramList.push(`app_key=${window.DMP_CONFIG.APP_KEY}`);
  return paramList.join('&');
}

/**
 * 将转译字符串做加密（防重放）
 *
 * @param   {[type]}  str     转译字符串
 *
 * @return  {[type]}          [return description]
 */
export function handleParamStrBySHA(str) {
  console.log('待加密串：', str);
  return str
}

/**
 * 将参数字符串转换为参数对象、参数key数组（防重放）
 *
 * @param   {[type]}  dataStr  原参数字符串
 *
 * @return  {[type]}           [return description]
 */
export function formatDataStrToObjecList(dataStr) {
  console.log('原参数串：', dataStr);
  const paramList = dataStr.split('&');
  const keyList = [];
  const paramData = {};
  paramList.forEach((item) => {
    const itemList = item.split('=');
    // 键
    const key = itemList[0];
    // 值 防止含有特殊符号的参数值被多转译一遍（先axios、后手动转译）
    const value = decodeURIComponent(itemList[1]);
    keyList.push(key);
    paramData[key] = value;
  });
  return { keyList, paramData };
}

export function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
}
