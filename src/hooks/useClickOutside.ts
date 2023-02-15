import { useEffect } from 'react'

// Improved version of https://usehooks.com/useOnClickOutside/
export const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent) => void) => {
  useEffect(() => {
    let startedInside: boolean | null = false
    let startedWhenMounted: boolean | HTMLElement | null = false

    const listener = (event: MouseEvent) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) return

      handler(event)
    }

    const validateEventStart = (event: MouseEvent | TouchEvent) => {
      startedWhenMounted = ref.current
      startedInside = ref.current && ref.current.contains(event.target as Node)
    }

    document.addEventListener('mousedown', validateEventStart)
    document.addEventListener('touchstart', validateEventStart)
    document.addEventListener('click', listener)

    return () => {
      document.removeEventListener('mousedown', validateEventStart)
      document.removeEventListener('touchstart', validateEventStart)
      document.removeEventListener('click', listener)
    }
  }, [ref, handler])
}
