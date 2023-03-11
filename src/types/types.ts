import { OpSet, Options } from 'roughjs/bin/core'

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

export type HEX = `#${string}`
export type FillStyle = 'solid' | 'hachure' | 'none'
export type StrokeWidth = '1' | '3' | '5'
export type FontFamily = 'SourceSansPro' | 'handDrawn'
export type FontSize = '14' | '24' | '32'

export type DrawingOptions = {
  stroke: HEX
  fill: HEX
  fillStyle: FillStyle
  strokeWidth: StrokeWidth
  strokeOpacity: number
  fontFamily: FontFamily
  fontSize: FontSize
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
}

export type PolygonDrawing = BaseDrawing & {
  tool: 'rectangle' | 'triangle' | 'circle' | 'rhombus' | 'line' | 'arrow'
  x1: number
  x2: number
  y1: number
  y2: number
  options: Options
  shape: string
  readonly sets: OpSet[]
}

export type PenDrawing = BaseDrawing & {
  tool: 'pen'
  points: { x: number; y: number }[]
}

export type ImageDrawing = BaseDrawing & {
  tool: 'image'
  dataURL: string
  x1: number
  y1: number
}

export type Drawing = StrictUnion<TextDrawing | PolygonDrawing | PenDrawing | ImageDrawing>
export type Drawings = Drawing[]

type UnionKeys<T> = T extends T ? keyof T : never
type StrictUnionHelper<T, TAll> = T extends any ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never
type StrictUnion<T> = StrictUnionHelper<T, T>
