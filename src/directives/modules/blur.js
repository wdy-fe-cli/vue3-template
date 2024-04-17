/**
 * v-auth
 * 按钮权限指令
 */

const blur = {
  mounted(el, binding) {
    el.copyData = binding.value
    el.addEventListener('click', handleClick)
  },
  updated(el, binding) {
    el.copyData = binding.value
  },
  beforeUnmount(el) {
    // eslint-disable-next-line no-underscore-dangle
    el.removeEventListener('click', el.__handleClick__)
  }
}
function handleClick(evt) {
  let target = evt.target
  if (target.nodeName === 'SPAN') {
    target = evt.target.parentNode
  }
  target.blur()
}

export default blur
