
/**
 * Parse the time to string
 * @param {(Object|string|Number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  if (time === null) {
    return '-'
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    // eslint-disable-next-line valid-typeof
    if (typeof time === 'Number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function isPhone(phone) {
  if (phone && typeof phone === 'string') {
    const reg = /^1[3|4|5|7|8|9][0-9]{9}$/
    const bol = reg.test(phone)
    return bol
  }
  return false
}

/**
 * 隐藏电话号码的中间四位
 */
export function hidePhone(phoneNo) {
  var reg=/(\d{3})\d{4}(\d{4})/;
  var newPhoneNo = phoneNo.replace(reg, "$1****$2")
  return newPhoneNo
}
function asdf(tel) {
  tel = "" + tel;
  var ary = tel.split("");
  ary.splice(3,4,"****");
  var tel1=ary.join("");
  return tel1
}