import { Cursor, DrawingWithOffset, Drawings, PointPosition } from '@/types'
import { getElementAtPoints } from './points'

const eraserIcon =
  "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==') 10 10, auto"

export const setCursor = (style: CSSStyleDeclaration, cursor: Cursor) => {
  if (style) {
    style.cursor = cursor
  }
}

export const setEraserCursor = (style: CSSStyleDeclaration) => {
  if (style) {
    style.cursor = eraserIcon
  }
}

export const getResizeCursor = (position: PointPosition | null) => {
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
      return null
  }
}

export const updateCurrentCursor = (
  tool: string,
  clientX: number,
  clientY: number,
  drawings: Drawings,
  selectedElement: DrawingWithOffset | null,
  style: CSSStyleDeclaration
) => {
  switch (tool) {
    case 'select':
      const element = getElementAtPoints(clientX, clientY, drawings)
      const cursor = element && selectedElement && getResizeCursor(element.position)

      if (cursor) {
        setCursor(style, cursor)
      } else if (element) {
        setCursor(style, 'move')
      } else {
        setCursor(style, 'default')
      }
      break
    case 'eraser':
      setEraserCursor(style)
      break
    case 'pan':
      setCursor(style, 'grab')
      break
    case 'text':
      setCursor(style, 'text')
      break
    default:
      setCursor(style, 'crosshair')
      break
  }
}
