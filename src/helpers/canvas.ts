import { Drawings } from '@/types'
import rough from 'roughjs'
import { drawElement } from './element'

export const createImage = async (drawings: Drawings) => {
  if (drawings.length === 0) {
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 800
  const context = canvas.getContext('2d')!

  const storedTransform = context.getTransform()
  context.canvas.width = context.canvas.width
  context.setTransform(storedTransform)
  context.save()

  const roughCanvas = rough.canvas(canvas!)

  for (const drawing of drawings) {
    await drawElement(roughCanvas, context, drawing)
    context.save()
  }

  return canvas.toDataURL()
}

export const getCanvas = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')!

  return { canvas, context }
}

export const getStaticCanvas = () => {
  const staticCanvas = document.getElementById('canvas-static') as HTMLCanvasElement
  const staticCtx = staticCanvas.getContext('2d')!

  return { staticCanvas, staticCtx }
}
