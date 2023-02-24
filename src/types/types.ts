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


export type HEX = `#${string}`
export type Action = 'drawing' | 'erasing' | 'moving' | 'selecting' | 'resizing' | 'writing' | 'panning' | 'none'
export type BackgroundFillStyle = 'solid' | 'hachure' | 'none'
export type LineWidth = '1' | '3' | '5'
export type FontFamily = 'default' | 'handDrawn'
export type FontSize = '14' | '24' | '32'

export type DrawingOptions = {
  lineColor: HEX
  backgroundFillColor: HEX
  backgroundFillStyle: BackgroundFillStyle
  lineWidth: LineWidth
  lineOpacity: number
  fontFamily: FontFamily
  fontSize: FontSize
}

export type Point = {
  x: number
  y: number
}

type BaseDrawing = DrawingOptions & {
  id: string
}

type TextDrawing = BaseDrawing & {
  text: string
  x1: number
  x2: number
  y1: number
  y2: number
  tool: 'text'
}

export type PolygonDrawing = BaseDrawing & {
  tool: 'rectangle' | 'triangle' | 'circle' | 'rhombus' | 'line' | 'arrow'
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

export type Drawing = StrictUnion<TextDrawing | PolygonDrawing | PenDrawing>
export type Drawings = Drawing[]

type UnionKeys<T> = T extends T ? keyof T : never
type StrictUnionHelper<T, TAll> = T extends any ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>> : never
type StrictUnion<T> = StrictUnionHelper<T, T>
