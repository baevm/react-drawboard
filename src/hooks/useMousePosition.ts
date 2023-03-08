import { useEffect, useState } from 'react'

export const useMousePosition = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function handleUpdateMouse(event: MouseEvent) {
      const viewportMousePos = { x: event.clientX, y: event.clientY }
      setMousePos(viewportMousePos)
    }

    window.addEventListener('mousemove', handleUpdateMouse)
    /* window.addEventListener('wheel', handleUpdateMouse) */
    return () => {
      window.removeEventListener('mousemove', handleUpdateMouse)
      /*  window.removeEventListener('wheel', handleUpdateMouse) */
    }
  }, [])

  return { mousePos }
}
