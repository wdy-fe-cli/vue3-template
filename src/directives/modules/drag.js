/**
 *拖拽改变宽度的指令
 */

const drag = {
  mounted(el) {
    let startX = ''
    let startWidth = ''
    el.style.cursor = 'e-resize'
    el.addEventListener('mousedown', (e) => {
      startX = e.clientX
      startWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10)

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })
    function onMouseMove(e) {
      let width = startWidth + e.clientX - startX
      width < 200 ? (width = 200) : width > 800 ? (width = 800) : width
      el.style.width = `${width}px`
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }
}

// const drag = {
//   mounted(el) {
//     const dragDom = el
//     const imgDom = el.children[0]
//     imgDom.style.cursor = 'pointer'
//     dragDom.style.cursor = 'pointer'
//     dragDom.onmousedown = (e) => {
//       console.log(111)
//       // 鼠标按下，计算当前元素距离可视区的距离
//       const disX = e.clientX
//       const w = dragDom.clientWidth
//       const minW = 200
//       const maxW = 800
//       let nw
//       dragDom.onmousemove = (e1) => {
//         // 通过事件委托，计算移动的距离
//         const l = e1.clientX - disX
//         // 改变当前元素宽度，不可超过最小最大值
//         nw = w + l
//         nw = nw < minW ? minW : nw
//         nw = nw > maxW ? maxW : nw
//         dragDom.style.width = `${nw}px`
//       }
//       dragDom.onmouseup = () => {
//         document.onmousemove = null
//         document.onmouseup = null
//       }
//     }
//   }
// }

export default drag
