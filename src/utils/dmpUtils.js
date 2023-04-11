import Store from '@/assets/js/store';
import { setSessionStorageItem, getSessionStorageItem, removeSessionStorageItem } from '@/common/func';

const GROUP_CONDITIONS = 'ISEE_manage_group_conditions'
const TAGDICTS = 'ISEE_manage_tag_dicts'
const TagAttrQuery = 'ISEE_tag_attr_query'
const XY_GROUP_TREE_EXPAND_IDS = 'ISEE_manage_xy_group_tree_expand_ids'
const XY_GROUP_TAG_ATTR_IDS = 'ISEE_manage_xy_tag_attr_expand_ids';

export function setGroupConditions (conditions) {
  return sessionStorage.setItem(GROUP_CONDITIONS, conditions)
}

export function getGroupConditions () {
  return sessionStorage.getItem(GROUP_CONDITIONS)
}

export function setTagDicts (dicts) {
  return Store.set(TAGDICTS, dicts)
}

export function getTagDicts () {
  return Store.get(TAGDICTS)
}

export function setTagAttrQuery (list) {
  return Store.set(TagAttrQuery, list)
}

export function getTagAttrQuery () {
  return Store.get(TagAttrQuery)
}

export function getXYGroupTreeExpandIds () {
  return sessionStorage.getItem(XY_GROUP_TREE_EXPAND_IDS)
}

export function setXYTagAttrExpandIds (expandIds) {
  return setSessionStorageItem(XY_GROUP_TAG_ATTR_IDS, expandIds)
}

export function getXYTagAttrExpandIds () {
  return getSessionStorageItem(XY_GROUP_TAG_ATTR_IDS)
}
