import { Drawable } from 'roughjs/bin/core'

export type PointPosition =
  | 'start'
  | 'end'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center'
  | 'inside'

export type Tool =
  | 'select'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'pen'
  | 'text'
  | 'eraser'
  | 'move'
  | 'image'
  | 'triangle'
  | 'arrow'
  | 'rhombus'

export type Action = 'drawing' | 'erasing' | 'moving' | 'selecting' | 'resizing' | 'none'

export type HEX = `#${string}`

export type BackgroundFillStyle = 'solid' | 'hachure' | 'none'

export type LineWidth = '1' | '3' | '5'

export type DrawingOptions = {
  lineColor: HEX
  backgroundFillColor: HEX
  backgroundFillStyle: BackgroundFillStyle
  lineWidth: LineWidth
  lineOpacity: number
}

type BaseDrawing = DrawingOptions & {
  id: string
}

export type PolygonDrawing = BaseDrawing & {
  tool: Extract<Tool, 'rectangle' | 'triangle' | 'circle' | 'rhombus' | 'line' | 'arrow'>
  x1: number
  x2: number
  y1: number
  y2: number
  roughElement: Drawable
}

export type PenDrawing = BaseDrawing & {
  tool: 'pen'
  points: { x: number; y: number }[]
}

export type Drawings = (PenDrawing | PolygonDrawing)[]
