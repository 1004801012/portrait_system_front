/**
 * @author windraxb
 * @param prefix
 * @description 自动匹配baseUrl
 */
export default function autoMatchBaseUrl (prefix = '') {
  let baseUrl = ''
  switch (prefix) {
    case 'MAP' : {
      baseUrl = 'https://restapi.amap.com/v3'
      break
    }
    default:
      baseUrl = window.LOCAL_CONFIG.API_HOME
  }

  return baseUrl
}
