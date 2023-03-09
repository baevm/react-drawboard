import { Action, Tool } from '@/types'

export const DEVICE_PIXEL_RATIO = window.devicePixelRatio
export const INDEXDB_NAME = 'fileStore'
export const LOCALSTORAGE_KEY = 'drawings'

export const ZOOM_SENSITIVITY = 1000 / DEVICE_PIXEL_RATIO
export const MIN_CANVAS_SCALE = 0.11
export const MAX_CANVAS_SCALE = 10

const TOOL_ACTIONS: { [tool in Tool]: Action } = {
  text: 'writing',
  eraser: 'erasing',
  select: 'selecting',
  pan: 'panning',
  arrow: 'drawing',
  circle: 'drawing',
  line: 'drawing',
  pen: 'drawing',
  rectangle: 'drawing',
  rhombus: 'drawing',
  triangle: 'drawing',
  image: 'uploading',
} as const
