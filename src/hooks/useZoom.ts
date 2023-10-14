import { MAX_CANVAS_SCALE, MIN_CANVAS_SCALE, ZOOM_SENSITIVITY } from '@/constants'
import { Point } from '@/types'
import { getCanvas } from '@/utils/getCanvas'
import { create } from 'zustand'
import { useMousePosition } from './useMousePosition'
import { addPoints } from '@/helpers/points'

interface useZoom {
  canvasScale: number
  viewportTopLeft: Point
  setCanvasScale: (s: number) => void
  setViewportTopLeft: (v: Point) => void
}

export enum ZOOM_TYPE {
  wheel = 'wheel',
  click = 'click',
}

const useZoomStore = create<useZoom>()((set) => ({
  canvasScale: 1,
  viewportTopLeft: { x: 0, y: 0 },
  setCanvasScale: (canvasScale) => set({ canvasScale }),
  setViewportTopLeft: (viewportTopLeft) => set({ viewportTopLeft }),
}))

export const useZoom = () => {
  const { canvasScale, viewportTopLeft, setCanvasScale, setViewportTopLeft } = useZoomStore((state) => ({
    canvasScale: state.canvasScale,
    viewportTopLeft: state.viewportTopLeft,
    setCanvasScale: state.setCanvasScale,
    setViewportTopLeft: state.setViewportTopLeft,
  }))
  const { mousePos } = useMousePosition()

  const handleZoom = (deltaY: number, type: ZOOM_TYPE) => {
    // check if canvas scale is less than minimum and action is zoom-out
    // check if canvas scale is bigger than maximum and action is zoom-in
    if (
      (canvasScale <= MIN_CANVAS_SCALE && Math.sign(deltaY) === 1) ||
      (canvasScale >= MAX_CANVAS_SCALE && Math.sign(deltaY) === -1)
    ) {
      return
    }

    const { context } = getCanvas()

    const zoom = 1 - deltaY / ZOOM_SENSITIVITY

    const viewportX = type === ZOOM_TYPE.click ? window.innerWidth / 2 : mousePos.x
    const viewportY = type === ZOOM_TYPE.click ? window.innerHeight / 2 : mousePos.y

    const viewportTopLeftDelta = {
      x: (viewportX / canvasScale) * (1 - 1 / zoom),
      y: (viewportY / canvasScale) * (1 - 1 / zoom),
    }
    const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta)

    context.translate(viewportTopLeft.x, viewportTopLeft.y)
    context.scale(zoom, zoom)
    context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y)

    setViewportTopLeft(newViewportTopLeft)
    setCanvasScale(canvasScale * zoom)
  }

  const resetZoom = () => {
    const { context } = getCanvas()

    const newViewPost = { x: 0, y: 0 }

    context.resetTransform()
    setViewportTopLeft(newViewPost)
    setCanvasScale(1)
  }

  return { canvasScale, viewportTopLeft, handleZoom, setViewportTopLeft, resetZoom }
}
