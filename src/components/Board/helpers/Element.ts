import { DrawingOptions, Drawings, HEX, PenDrawing, PolygonDrawing, TextDrawing, Tool } from '@/types'
import getStroke from 'perfect-freehand'
import rough from 'roughjs'
import { RoughCanvas } from 'roughjs/bin/canvas'

const roughGenerator = rough.generator()

export const createElement: CreateElement = (x1, y1, x2, y2, tool, id, options) => {
  let roughElement

  const drawingOptions = getToolOptions(tool, options)

  switch (tool) {
    case 'pen':
      return {
        tool,
        points: [{ x: x2, y: y2 }],
        id,
        ...drawingOptions,
      }

    case 'text':
      return {
        tool,
        x1,
        y1,
        x2,
        y2,
        id,
        text: '',
        ...drawingOptions,
      }

    case 'circle':
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2
      const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2
      const d = r * 2
      roughElement = roughGenerator.circle(cx, cy, d, { ...drawingOptions })
      break

    case 'rectangle':
      roughElement = roughGenerator.rectangle(x1, y1, x2 - x1, y2 - y1, { ...drawingOptions })
      break

    // TODO: RIGHT & EQUILATERAL
    case 'triangle':
      const right = [
        [x1, y2],
        [x2, y1],
        [x1, y1],
      ]
      const equilateral = [
        [x1, y2],
        [x2, y2],
        [average(x1, x2), y1],
      ]
      roughElement = roughGenerator.polygon([...(equilateral as any)], { ...drawingOptions })
      break

    case 'rhombus':
      const rhombus = [
        [x1, y1 + (y2 - y1) / 2],
        [x1 + (x2 - x1) / 2, y1],
        [x2, y1 + (y2 - y1) / 2],
        [x1 + (x2 - x1) / 2, y2],
      ]
      roughElement = roughGenerator.polygon([...(rhombus as any)], { ...drawingOptions })
      break

    case 'arrow':
      let headlen = 10
      let angle = Math.atan2(y2 - y1, x2 - x1)
      let fromHeadToSide1 = [x2 - headlen * Math.cos(angle - Math.PI / 7), y2 - headlen * Math.sin(angle - Math.PI / 7)]
      let fromHeadToSide2 = [x2 - headlen * Math.cos(angle + Math.PI / 7), y2 - headlen * Math.sin(angle + Math.PI / 7)]
      const arrow = [[x1, y1], fromHeadToSide1, [], fromHeadToSide2]
      roughElement = roughGenerator.polygon([...(arrow as any)], { stroke: options.stroke })
      break

    case 'line':
      roughElement = roughGenerator.line(x1, y1, x2, y2, { ...drawingOptions })
      break

    default:
      throw new Error(`Invalid tool: ${tool}`)
  }

  return { tool, x1, y1, x2, y2, id, options: roughElement.options, sets: roughElement.sets, shape: roughElement.shape }
}

export const drawElement = (roughCanvas: RoughCanvas, context: CanvasRenderingContext2D, element: any) => {
  switch (element.tool) {
    case 'pen':
      const stroke = getSvgPathFromStroke(
        getStroke(element.points, { size: 4 + +element.strokeWidth, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
      )
      context.fillStyle = element.stroke
      context.globalAlpha = element.strokeOpacity
      context.fill(new Path2D(stroke))
      break
    case 'text':
      context.font = `${element.fontSize}px ${element.fontFamily}`
      context.textBaseline = 'top'
      context.fillStyle = element.stroke
      context.globalAlpha = element.strokeOpacity
      context.fillText(element.text, element.x1, element.y1)
      break
    default:
      console.log(element)
      roughCanvas.draw(element)
      break
  }
}

export const getElementById = (id: string, drawings: Drawings) => {
  return drawings.find((element) => element.id === id)!
}

export const getIndexOfElement = (id: string, drawings: Drawings) => {
  return drawings.findIndex((element) => element.id === id)
}

const getToolOptions = (tool: Tool, options: DrawingOptions) => {
  switch (tool) {
    case 'line':
      return {
        stroke: options.strokeOpacity === 1 ? options.stroke : addAlpha(options.stroke, options.strokeOpacity),
        strokeWidth: +options.strokeWidth,
      }

    case 'text':
      return {
        stroke: options.strokeOpacity === 1 ? options.stroke : addAlpha(options.stroke, options.strokeOpacity),
        fontSize: options.fontSize,
        fontFamily: options.fontFamily,
      }

    case 'pen':
      return {
        stroke: options.strokeOpacity === 1 ? options.stroke : addAlpha(options.stroke, options.strokeOpacity),
        strokeWidth: +options.strokeWidth,
        strokeOpacity: options.strokeOpacity,
      }

    default:
      return {
        stroke: options.strokeOpacity === 1 ? options.stroke : addAlpha(options.stroke, options.strokeOpacity),
        strokeWidth: +options.strokeWidth,
        fill: options.backgroundFillStyle !== 'none' ? options.backgroundColor : undefined,
        fillStyle: options.backgroundFillStyle !== 'none' ? options.backgroundFillStyle : undefined,
      }
  }
}

const getSvgPathFromStroke = (points: any, closed = true) => {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(
    b[0],
    c[0]
  ).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `
  }

  if (closed) {
    result += 'Z'
  }

  return result
}

const addAlpha = (color: HEX, opacity: number): HEX => {
  const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255)
  return (color + _opacity.toString(16).toUpperCase()) as HEX
}

const average = (a: number, b: number) => (a + b) / 2

type CreateElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tool: Tool,
  id: string,
  options: DrawingOptions
) => PenDrawing | PolygonDrawing | TextDrawing
