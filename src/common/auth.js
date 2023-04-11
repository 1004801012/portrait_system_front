import Store from '@/assets/js/store';
import { setSessionStorageItem, getSessionStorageItem, removeSessionStorageItem } from '@/common/func';
// import { Store } from 'vuex';

// let OperatorNo = '';  // 当前操作员编号，用于区分缓存的key名称，避免多账号登录信息覆盖

const OPERATORNO = 'ISEE_manage_operatorNo';
const TOKEN = 'ISEE_manage_token';
const OPERATORINFO = 'ISEE_operatorInfo';
const BRANCHINFOLIST = 'ISEE_branchInfoList';
const BRANCHSTRUCTURE = 'ISEE_branchStructure';
const MENUSTRUCTURE = 'ISEE_menuStructure';
const MENULIST = 'ISEE_menuList';
const MENUIDLIST = 'ISEE_menuIdList';
const ATTRTAGS = 'ISEE_manage_attr_tags';
const FITTAGS = 'ISEE_manage_fit_tags';
const DONETAGS = 'ISEE_manage_done_tags';
const TAGDICTS = 'ISEE_manage_tag_dicts';
const MARKETTOKEN = 'ISEE_manage_market_token';
const TagAttrQuery = 'ISEE_tag_attr_query';
const GROUP_LIST_SELECT_MODULE = 'ISEE_group_list_select_module';
const GROUP_LIST_SAVED_SELECT_MODULE = 'ISEE_group_list_saved_select_module';
const GROUP_CONDITIONS = 'ISEE_manage_group_conditions';
const XY_GROUP_TREE_EXPAND_IDS = 'ISEE_manage_xy_group_tree_expand_ids';
const XY_GROUP_TAG_ATTR_IDS = 'ISEE_manage_xy_tag_attr_expand_ids';
const GROUPDISPLAYMODULES = 'ISEE_group_display_modules';
const USER_PORTRAIT_OUTLINE = 'ISEE_user_portrait_outline';

export function setToken(token) {
  return setSessionStorageItem(TOKEN, token);
}

export function getToken() {
  return getSessionStorageItem(TOKEN);
}

export function removeToken() {
  return removeSessionStorageItem(TOKEN);
}

export function setOperatorNo(operatorNo) {
  return setSessionStorageItem(OPERATORNO, operatorNo);
}

export function getOperatorNo() {
  return getSessionStorageItem(OPERATORNO);
}

export function removeOperatorNo() {
  return removeSessionStorageItem(OPERATORNO);
}

export function setOperatorInfo(operatorInfo) {
  return setSessionStorageItem(OPERATORINFO, JSON.stringify(operatorInfo));
}

export function getOperatorInfo() {
  let data = {};
  try {
    data = JSON.parse(getSessionStorageItem(OPERATORINFO));
  } catch (err) {
    console.log('getOperatorInfo err', err);
  }
  return data;
}

export function setBranchInfoList(list) {
  return setSessionStorageItem(BRANCHINFOLIST, JSON.stringify(list));
}

export function getBranchInfoList() {
  let data = {};
  try {
    data = JSON.parse(getSessionStorageItem(BRANCHINFOLIST));
  } catch (err) {
    console.log('getBranchInfoList err', err);
  }
  return data;
}

export function setBranchStructure(list) {
  return setSessionStorageItem(BRANCHSTRUCTURE, JSON.stringify(list));
}

export function getBranchStructure() {
  let data = {};
  try {
    data = JSON.parse(getSessionStorageItem(BRANCHSTRUCTURE));
  } catch (err) {
    console.log('BRANCHSTRUCTURE err', err);
  }
  return data;
}

export function setMenuStructure(list) {
  return setSessionStorageItem(MENUSTRUCTURE, JSON.stringify(list));
}

export function getMenuStructure() {
  let data = {};
  try {
    data = JSON.parse(getSessionStorageItem(MENUSTRUCTURE));
  } catch (err) {
    console.log('MENUSTRUCTURE err', err);
  }
  return data;
}

export function setMenuList(list) {
  // 路由文件需格式转换，否则直接存取对象会出现解析错误问题
  return setSessionStorageItem(MENULIST, JSON.stringify(list));
}

export function getMenuList() {
  let data = {};
  try {
    data = JSON.parse(getSessionStorageItem(MENULIST));
  } catch (err) {
    console.log('MENULIST err', err);
  }
  return data;
}

export function removeMenuList() {
  return removeSessionStorageItem(MENULIST);
}

export function setMenuIdList(list) {
  return setSessionStorageItem(MENUIDLIST, JSON.stringify(list));
}

export function getMenuIdList() {
  let data = {};
  try {
    data = JSON.parse(getSessionStorageItem(MENUIDLIST));
  } catch (err) {
    console.log('MENUIDLIST err', err);
  }
  return data;
}

export function removeMenuIdList() {
  return removeSessionStorageItem(MENUIDLIST);
}

export function setAttrTags(tags) {
  return Store.set(ATTRTAGS, tags);
}

export function getAttrTags() {
  return Store.get(ATTRTAGS);
}

export function removeAttrTags() {
  return Store.remove(ATTRTAGS);
}

export function setFitTags(tags) {
  return Store.set(FITTAGS, tags);
}

export function getFitTags() {
  return Store.get(FITTAGS);
}

export function removeFitTags() {
  return Store.remove(FITTAGS);
}

export function setDoneTags(tags) {
  return Store.set(DONETAGS, tags);
}

export function getDoneTags() {
  return Store.get(DONETAGS);
}

export function removeDoneTags() {
  return Store.remove(DONETAGS);
}

export function setMarketToken(token) {
  return Store.set(MARKETTOKEN, token);
}

export function getMarketToken() {
  return Store.get(MARKETTOKEN);
}

export function removeMarketToken() {
  return Store.remove(MARKETTOKEN);
}

export function setTagDicts(dicts) {
  return Store.set(TAGDICTS, dicts);
}

export function getTagDicts() {
  return Store.get(TAGDICTS);
}

export function removeTagDicts() {
  return Store.remove(TAGDICTS);
}

export function setTagAttrQuery(list) {
  return Store.set(TagAttrQuery, list);
}

export function getTagAttrQuery() {
  return Store.get(TagAttrQuery);
}

export function removeTagAttrQuery() {
  return Store.remove(TagAttrQuery);
}

export function setGroupListSelectModule(moduleId, module) {
  const operatorNo = getOperatorNo() || '';
  return Store.set(`${GROUP_LIST_SELECT_MODULE}_${operatorNo}_${moduleId}`, module);
}

export function getGroupListSelectModule(moduleId) {
  const operatorNo = getOperatorNo() || '';
  return getSessionStorageItem(`${GROUP_LIST_SELECT_MODULE}_${operatorNo}_${moduleId}`);
}

export function removeGroupListSelectModule(moduleId) {
  const operatorNo = getOperatorNo() || '';
  return removeSessionStorageItem(`${GROUP_LIST_SELECT_MODULE}_${operatorNo}_${moduleId}`);
}

export function setGroupListSavedSelectModule(moduleId, module) {
  const operatorNo = getOperatorNo() || '';
  return Store.set(`${GROUP_LIST_SAVED_SELECT_MODULE}_${operatorNo}_${moduleId}`, module);
}

export function getGroupListSavedSelectModule(moduleId) {
  const operatorNo = getOperatorNo() || '';
  return getSessionStorageItem(`${GROUP_LIST_SAVED_SELECT_MODULE}_${operatorNo}_${moduleId}`);
}

export function removeGroupListSavedSelectModule(moduleId) {
  const operatorNo = getOperatorNo() || '';
  return removeSessionStorageItem(`${GROUP_LIST_SAVED_SELECT_MODULE}_${operatorNo}_${moduleId}`);
}

export function setGroupConditions(conditions) {
  return sessionStorage.setItem(GROUP_CONDITIONS, conditions);
}

export function getGroupConditions() {
  return sessionStorage.getItem(GROUP_CONDITIONS);
}

export function setXYGroupTreeExpandIds(expandIds) {
  return sessionStorage.setItem(XY_GROUP_TREE_EXPAND_IDS, expandIds);
}

export function getXYGroupTreeExpandIds() {
  return sessionStorage.getItem(XY_GROUP_TREE_EXPAND_IDS);
}

export function setXYTagAttrExpandIds(expandIds) {
  return setSessionStorageItem(XY_GROUP_TAG_ATTR_IDS, expandIds);
}

export function getXYTagAttrExpandIds() {
  return getSessionStorageItem(XY_GROUP_TAG_ATTR_IDS);
}

export function removeXYTagAttrExpandIds() {
  return removeSessionStorageItem(XY_GROUP_TAG_ATTR_IDS);
}

export function setGroupDisplayModules(modules) {
  return setSessionStorageItem(GROUPDISPLAYMODULES, JSON.stringify(modules));
}

export function getGroupDisplayModules() {
  let data = [];
  try {
    data = JSON.parse(getSessionStorageItem(GROUPDISPLAYMODULES));
  } catch (err) {
    console.log('getGroupDisplayModules err', err);
  }
  return data;
}

export function removeGroupDisplayModules() {
  return removeSessionStorageItem(GROUPDISPLAYMODULES);
}

export function setUserPortraitOutline(modules) {
  return setSessionStorageItem(USER_PORTRAIT_OUTLINE, JSON.stringify(modules));
}

export function getUserPortraitOutline() {
  let data = [];
  try {
    data = JSON.parse(getSessionStorageItem(USER_PORTRAIT_OUTLINE));
  } catch (err) {
    console.log('getUserPortraitOutline err', err);
  }
  return data;
}

export function removeUserPortraitOutline() {
  return removeSessionStorageItem(USER_PORTRAIT_OUTLINE);
}

/**
 * 合并继承对象 --深度合并
 * @param obj 目标对象
 * @param dest 被继承对象
 * @returns {*}  返回合并对象
 */
export function deepMerge(obj, dest) {
  let key;
  let res;
  res = JSON.stringify(obj);
  res = JSON.parse(res);
  for (key in dest) {
    // 如果obj[key]是对象，则递归调用且是对象的话再去调用deepMerge();，否则与dest[key]合并
    res[key] =
      res[key] && res[key].toString().indexOf('[object Object]') >= 0
        ? deepMerge(res[key], dest[key])
        : (res[key] = dest[key]);
  }
  return res;
}

/**
 * vue-route 跳转路由
 * @param url 目标路由
 * @param params 参数
 * @param d 是否合并参数
 * @param reload 是否替换
 */
export function navigateTo(url, params = {}, d = null, reload = false) {
  setTimeout(function () {
    if (d) {
      Object.assign(params, { d: d });
    }
    if (reload) {
      window.vm.$router.replace({ path: url, query: params });
    } else {
      window.vm.$router.push({ path: url, query: params });
    }
  }, 10);
}
