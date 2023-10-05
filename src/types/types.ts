import { OpSet, Options } from 'roughjs/bin/core'
import { StrictUnion } from './utility'

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
  | 'pan'
  | 'pen'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'triangle'
  | 'rhombus'
  | 'arrow'
  | 'text'
  | 'image'
  | 'eraser'

export type Action =
  | 'drawing'
  | 'erasing'
  | 'moving'
  | 'selecting'
  | 'resizing'
  | 'writing'
  | 'panning'
  | 'uploading'
  | 'none'

export type Cursor = 'default' | 'grab' | 'grabbing' | 'text' | 'crosshair' | 'nwse-resize' | 'nesw-resize' | 'move'

export type HEX = `#${string}`
export type FillStyle = 'solid' | 'hachure' | 'none'
export type StrokeWidth = '1' | '3' | '5'
export type FontFamily = 'SourceSansPro' | 'handDrawn'
export type FontSize = '14' | '24' | '32'

export type DrawingOptions = {
  stroke: HEX
  strokeWidth: StrokeWidth
  fill?: HEX
  fillStyle?: FillStyle
  fontFamily?: FontFamily
  fontSize?: FontSize
}

export type Point = {
  x: number
  y: number
}

export type TwoPoints = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type ThreePoints = TwoPoints & {
  x3?: number
  y3?: number
}

type BaseDrawing = {
  id: string
}

export type TextDrawing = BaseDrawing & {
  tool: 'text'
  text: string
  x1: number
  x2: number
  y1: number
  y2: number
  options: DrawingOptions
}

export type PolygonDrawing = BaseDrawing & {
  tool: 'rectangle' | 'circle' | 'rhombus' | 'line' | 'arrow'
  x1: number
  x2: number
  y1: number
  y2: number
  options: DrawingOptions
  shape: string
  readonly sets: OpSet[]
}

export type TriangleDrawing = BaseDrawing & {
  tool: 'triangle'
  x1: number
  x2: number
  y1: number
  y2: number
  x3: number
  y3: number
  options: DrawingOptions
  shape: string
  readonly sets: OpSet[]
}

export type PenDrawing = BaseDrawing & {
  tool: 'pen'
  points: Point[]
  options: DrawingOptions
}

export type ImageDrawing = BaseDrawing & {
  tool: 'image'
  dataURL?: string
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  height: number
}

export type Drawing = StrictUnion<TextDrawing | PolygonDrawing | TriangleDrawing | PenDrawing | ImageDrawing>
export type Drawings = Drawing[]

export type DrawingWithOffset = Drawing & {
  offsetX?: any | any[]
  offsetY?: any | any[]
  position: PointPosition
}
