export default {
  bind (el, binding) {
    function documentHandler (e) {
      if (el.contains(e.target)) {
        return false
      }
      if (binding.expression) {
        binding.value(e)
      }
    }
    el.__vueclickOutside__ = documentHandler
    document.addEventListener('click', documentHandler)
  },
  unbind (el) {
    document.removeEventListener('click', el.__vueclickOutside__)
    delete el.__vueclickOutside__
  }

}
