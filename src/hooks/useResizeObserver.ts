import { useEffect, useState } from 'react'

export const useResizeObserver = () => {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)
  let resizeObserver: ResizeObserver
  let elem: HTMLElement

  const handleElementResized = () => {
    if (elem.offsetWidth !== width) {
      setWidth(elem.offsetWidth)
    }
    if (elem.offsetHeight !== height) {
      setHeight(elem.offsetHeight)
    }
  }

  useEffect(() => {
    elem = document.querySelector('#root') as HTMLElement
    resizeObserver = new ResizeObserver(handleElementResized)

    resizeObserver.observe(elem)

    return () => resizeObserver.disconnect()
  }, [])

  return { width, height }
}
