import {List} from "echarts/lib/export";

/**
 * 退款状态
 * @param type
 * @returns {*}
 */
export function tagTypeEnum (type = '') {
  const enumMap = new Map([
    [1, '用户信息'],
    [2, '用户行为'],
    [3, '账户信息']
  ])

  return type === '' ? enumMap : enumMap.get(+type)
}

export function tagLabelValueTypeEnum (type = '') {
  const enumMap = new Map([
    ['i', '字典项标签'],
    ['d', '浮点型标签'],
    ['s', '文本型标签']
  ])
  return type === '' ? enumMap : enumMap.get(type)
}

export function comparisonChars (type = [0]) {
  const enums = new Map([
    [1, "="],
    [2, ">"],
    [3, "<"],
    [4, ">="],
    [5, "<="],
    [6, "!="]
  ])

  return type === [0] ? enums.values : type.map((value, index, array) => {
    enums.get(value)
  })
}
