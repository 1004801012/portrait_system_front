/**
 * Created by wangxuanbo on 2019/7/19.
 */
import { formatDate } from '@windraxb/cloud-utils'

/**
 * 深复制
 * @param source
 * @returns {*}
 */
export function deepClone (source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments')
  }
  const targetObj = Array.isArray(source) ? [] : {}
  Object.keys(source).map(item => {
    if (source[item] && typeof source[item] === 'object') {
      targetObj[item] = deepClone(source[item])
    } else {
      targetObj[item] = source[item]
    }
  })
  return targetObj
}

export function imgToB64 (img) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader()
    let imgResult = ''
    reader.readAsDataURL(img.raw)
    reader.onload = function () {
      imgResult = reader.result
    }
    reader.onerror = function (err) {
      reject(err)
    }
    reader.onloadend = function () {
      resolve(imgResult)
    }
  })
}

export function calcDescartes (array) {
  if (array.length < 2) return array[0] || []
  return [].reduce.call(array, function (col, set) {
    const res = []
    col.forEach(function (c) {
      set.forEach(function (s) {
        const t = [].concat(Array.isArray(c) ? c : [c])
        t.push(s)
        res.push(t)
      })
    })
    return res
  })
}

export function getCurrentMonthDay1 () {
  const date = new Date()
  date.setDate(1)
  date.setHours(0)
  date.setSeconds(0)
  date.setMinutes(0)
  return formatDate(date)
}

export function getNextMounthDay1 () {
  const date = new Date()
  date.setDate(1)
  date.setFullYear(date.getMonth() === 11 ? date.getFullYear() + 1 : date.getFullYear())
  date.setMonth(date.getMonth() === 11 ? 0 : date.getMonth() + 1)
  date.setHours(0)
  date.setSeconds(0)
  date.setMinutes(0)
  return formatDate(date)
}

/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        传入函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，调用触发于开始边界而不是结束边界
 * @return {function}             返回客户调用函数
 */
export function debounce (func, wait, immediate) {
  var timeout = ''
  var args = ''
  var context = ''
  var timestamp = ''
  var result = ''

  var later = function () {
    // 据上一次触发时间间隔
    var last = Date.now() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function () {
    context = this
    args = arguments
    timestamp = Date.now()
    var callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

export function callback (data, success, fail) {
  const STATUS = '0'
  if (data.error_no + '' === STATUS) {
    typeof success === 'function' && success()
  } else {
    typeof fail === 'function' && fail()
  }
}
