import { ThreePoints, TwoPoints } from '@/types'

const HANDLE_SIZE = 8
const HANDLE_SIZE_OFFSET = HANDLE_SIZE / 2

export const createResizeHandles = (context: CanvasRenderingContext2D, { x1, y1, x2, y2 }: TwoPoints) => {
  // top-left handle
  context.rect(x1 - HANDLE_SIZE, y1 - HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-left handle
  context.rect(x1 - HANDLE_SIZE, y2, HANDLE_SIZE, HANDLE_SIZE)
  // top-right handle
  context.rect(x2, y1 - HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-right handle
  context.rect(x2, y2, HANDLE_SIZE, HANDLE_SIZE)
}

export const createTriangleResizeHandles = (
  context: CanvasRenderingContext2D,
  { x1, y1, x2, y2, x3, y3 }: ThreePoints
) => {
  // top handle
  context.rect((x3 as number) - HANDLE_SIZE_OFFSET, y3 as number - HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-left handle
  context.rect(x1 - HANDLE_SIZE, y1 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-right handle
  context.rect(x2, y2 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
}

export const createCircleResizeHandles = (context: CanvasRenderingContext2D, { x1, y1, x2, y2 }: TwoPoints) => {
  // top-left handle
  context.rect(x1 - HANDLE_SIZE_OFFSET, y1 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-left handle
  context.rect(x1 - HANDLE_SIZE_OFFSET, y2 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // top-right handle
  context.rect(x2 - HANDLE_SIZE_OFFSET, y1 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-right handle
  context.rect(x2 - HANDLE_SIZE_OFFSET, y2 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
}

export const createLineResizeHandles = (context: CanvasRenderingContext2D, { x1, y1, x2, y2 }: TwoPoints) => {
  context.rect(x2 - HANDLE_SIZE_OFFSET, y2 - HANDLE_SIZE, HANDLE_SIZE, HANDLE_SIZE)

  context.rect(x1 - HANDLE_SIZE_OFFSET, y1, HANDLE_SIZE, HANDLE_SIZE)
}

export const createPenResizeHandles = (context: CanvasRenderingContext2D, { x1, y1, x2, y2 }: TwoPoints) => {
  // top-left handle
  context.rect(x1 - HANDLE_SIZE_OFFSET, y1 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-left handle
  context.rect(x1 - HANDLE_SIZE_OFFSET, y2 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // top-right handle
  context.rect(x2 - HANDLE_SIZE_OFFSET, y1 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
  // bottom-right handle
  context.rect(x2 - HANDLE_SIZE_OFFSET, y2 - HANDLE_SIZE_OFFSET, HANDLE_SIZE, HANDLE_SIZE)
}
