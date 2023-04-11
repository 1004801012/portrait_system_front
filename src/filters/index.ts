import Vue from 'vue'

import { formatDate } from '@windraxb/cloud-utils'

export function formatTime (timeStamp: number, fmt?: string) {
  return formatDate(timeStamp, fmt)
}

export function filterPayType (type: number|string|null) {
  if (type === null) {
    return '--'
  }
  const arr = ['余额支付', '微信支付', '支付宝', '银联支付']
  return arr[+type]
}

export function filterNull (val: any) {
  return val === null || val === '' || val === undefined ? '--' : val
}

export function filterMoney (val: number | string | null) {
  return val === null ? '--' : `￥${(+val).toFixed(2)}`
}

export function filterYesOrNo (val: number | string) {
  return +val === 0 ? '否' : '是'
}

export function filterWorkFlag (val: number | string) {
  return +val === 0 ? '休息中' : '工作中'
}

const filters = {
  formatTime,
  filterPayType,
  filterNull,
  filterMoney,
  filterYesOrNo,
  filterWorkFlag
}

Object.keys(filters).forEach((key: string) => {
  Vue.filter(key, filters[key])
})
