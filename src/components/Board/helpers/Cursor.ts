import { PointPosition } from '@/types'

export const cursorForPosition = (position: PointPosition) => {
  switch (position) {
    case 'top-left':
    case 'bottom-right':
    case 'start':
    case 'end':
      return 'nwse-resize'
    case 'top-right':
    case 'bottom-left':
      return 'nesw-resize'
    default:
      return 'move'
  }
}
