import store from '@/store'

export default {
  inserted (el, binding) {
    if (window.LOCAL_CONFIG.IGNORE_BUTTON_AUTH) {
      return {}
    }
    return store.getters.buttonAuth.includes(binding.value) ? {} : el.parentNode.removeChild(el)
  }
}
