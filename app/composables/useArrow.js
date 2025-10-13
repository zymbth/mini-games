// import Hammer from 'hammerjs'

/**
 * 方向键监听处理
 *
 * @param {Function} cb 事件处理方法，接收一个字符串参数，值为方向键名称
 * @param {string} container 监听容器，默认为 body
 * @returns {Object} 包含两个方法，addArrowListener 和 removeArrowListener
 */
export const useArrow = (cb, container = 'body') => {
  if(!import.meta.client) return {}
  const isMobile1 = isMobile()

  const pcHandler = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) return
    e.stopPropagation()
    cb(e.code)
  }
  const addPCListener = () => document.addEventListener('keydown', pcHandler)
  const removePCListener = () => document.removeEventListener('keydown', pcHandler)

  let hammerManager
  const containerEl = document.querySelector(container)
  const addMobileListener = async () => {
    if (!containerEl) return
    const Hammer = await import('hammerjs')
    hammerManager = new Hammer.Manager(containerEl)
    const TripleSwipe = new Hammer.Swipe({ event: 'swipe', direction: 30 })
    hammerManager.add(TripleSwipe)
    hammerManager.on('swipe', (e) => {
      const direction = {
        2: 'ArrowLeft',
        4: 'ArrowRight',
        8: 'ArrowUp',
        16: 'ArrowDown'
      }[e.direction]
      if (!direction) return
      cb(direction)
    })
  }
  const removeMobileListener = () => hammerManager?.destroy()

  return {
    addArrowListener: isMobile1 ? addMobileListener : addPCListener,
    removeArrowListener: isMobile1 ? removeMobileListener : removePCListener
  }
}