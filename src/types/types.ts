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

export type DrawingOptions = {
  lineColor: HEX
  backgroundFillColor: HEX
  lineWidth: string
  lineOpacity: number
}
