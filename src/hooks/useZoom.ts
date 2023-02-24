import { DEVICE_PIXEL_RATIO } from '@/constants'
import { Point } from '@/types'
import { getCanvas } from '@/utils/getCanvas'
import { create } from 'zustand'
import { useMousePosition } from './useMousePosition'

interface useZoom {
  canvasScale: number
  viewportTopLeft: Point
  setCanvasScale: (s: number) => void
  setViewportTopLeft: (v: Point) => void
}

const ZOOM_SENSITIVITY = 1000

const useZoomStore = create<useZoom>()((set) => ({
  canvasScale: window.devicePixelRatio,
  viewportTopLeft: { x: 0, y: 0 },
  setCanvasScale: (canvasScale) => set({ canvasScale }),
  setViewportTopLeft: (viewportTopLeft) => set({ viewportTopLeft }),
}))

export const useZoom = () => {
  const { canvasScale, setCanvasScale, setViewportTopLeft, viewportTopLeft } = useZoomStore((state) => ({
    canvasScale: state.canvasScale,
    viewportTopLeft: state.viewportTopLeft,
    setCanvasScale: state.setCanvasScale,
    setViewportTopLeft: state.setViewportTopLeft,
  }))
  const { mousePos } = useMousePosition()

  const handleZoom = (deltaY: number, type: 'wheel' | 'click') => {
    const { context } = getCanvas()

    const zoom = 1 - deltaY / ZOOM_SENSITIVITY

    const viewportX = type === 'click' ? window.innerWidth / 2 : mousePos.x
    const viewportY = type === 'click' ? window.innerHeight / 2 : mousePos.y

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
    setCanvasScale(DEVICE_PIXEL_RATIO)
  }

  return { canvasScale, viewportTopLeft, handleZoom, setViewportTopLeft, resetZoom }
}

function addPoints(p1: Point, p2: Point) {
  return { x: p1.x + p2.x, y: p1.y + p2.y }
}
