import {
  DrawingOptions,
  Drawings,
  ImageDrawing,
  PenDrawing,
  Point,
  PolygonDrawing,
  TextDrawing,
  Tool,
  TwoPoints,
} from '@/types'
import getStroke from 'perfect-freehand'
import rough from 'roughjs'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { addAlpha } from './color'
import { getMemoizedImage } from './image'
import {
  createCircleResizeHandles,
  createLineResizeHandles,
  createPenResizeHandles,
  createResizeHandles,
} from './resize'

const roughGenerator = rough.generator()

export const createElement: CreateElement = ({ x1, y1, x2, y2, tool, id, options }) => {
  let roughElement

  const drawingOptions = getToolOptions(tool, options)

  switch (tool) {
    case 'pen':
      return {
        tool,
        points: [{ x: x2, y: y2 }],
        id,
        options: drawingOptions,
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
        options: drawingOptions,
      }

    case 'image':
      return {
        tool,
        x1,
        y1,
        x2,
        y2,
        id,
        dataURL: '',
        options: drawingOptions,
      }

    case 'circle':
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2
      const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2
      const d = r * 2
      roughElement = roughGenerator.circle(cx, cy, d, { ...drawingOptions, seed: 100 })
      break

    case 'rectangle':
      roughElement = roughGenerator.rectangle(x1, y1, x2 - x1, y2 - y1, { ...drawingOptions, seed: 100 })
      break

    case 'triangle':
      /* const right = [
        [x1, y2],
        [x2, y1],
        [x1, y1],
      ] */
      const equilateral = [
        [x1, y2],
        [x2, y2],
        [average(x1, x2), y1],
      ]
      roughElement = roughGenerator.polygon([...(equilateral as any)], { ...drawingOptions, seed: 100 })
      break

    case 'rhombus':
      const rhombus = [
        [x1, y1 + (y2 - y1) / 2],
        [x1 + (x2 - x1) / 2, y1],
        [x2, y1 + (y2 - y1) / 2],
        [x1 + (x2 - x1) / 2, y2],
      ]
      roughElement = roughGenerator.polygon([...(rhombus as any)], { ...drawingOptions, seed: 100 })
      break

    case 'arrow':
      let PI = Math.PI
      let degreesInRadians225 = (225 * PI) / 180
      let degreesInRadians135 = (135 * PI) / 180

      // calc the angle of the line
      let dx = x2 - x1
      let dy = y2 - y1
      let angle = Math.atan2(dy, dx)

      // calc arrowhead points
      let x225 = x2 + 20 * Math.cos(angle + degreesInRadians225)
      let y225 = y2 + 20 * Math.sin(angle + degreesInRadians225)
      let x135 = x2 + 20 * Math.cos(angle + degreesInRadians135)
      let y135 = y2 + 20 * Math.sin(angle + degreesInRadians135)

      const arrow = [
        [x1, y1],
        [x2, y2],
        [x225, y225],
        [x135, y135],
        [x2, y2],
      ]
      roughElement = roughGenerator.polygon([...(arrow as any)], { ...drawingOptions, seed: 100 })
      break

    case 'line':
      roughElement = roughGenerator.line(x1, y1, x2, y2, { ...drawingOptions, seed: 100 })
      break

    default:
      throw new Error(`Invalid tool: ${tool}`)
  }

  return { tool, x1, y1, x2, y2, id, options: roughElement.options, sets: roughElement.sets, shape: roughElement.shape }
}

export const drawElement = async (roughCanvas: RoughCanvas, context: CanvasRenderingContext2D, element: any) => {
  switch (element.tool) {
    case 'pen':
      const svgPath = getSvgPathFromStroke(
        getStroke(element.points, {
          size: 4 + +element.options.strokeWidth,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        })
      )
      context.fillStyle = element.options.stroke
      context.fill(new Path2D(svgPath))
      break
    case 'text':
      context.font = `${element.options.fontSize}px ${element.options.fontFamily}`
      context.textBaseline = 'top'
      context.fillStyle = element.options.stroke
      context.fillText(element.text, element.x1, element.y1)
      break
    case 'image':
      const image = await getMemoizedImage(element.id)

      context.drawImage(image, element.x1, element.y1)
      break

    default:
      roughCanvas.draw(element)
      break
  }
}

export const setSelectedElementBorder = (
  context: CanvasRenderingContext2D,
  tool: Tool,
  { x1, y1, x2, y2 }: TwoPoints,
  points?: Point[]
) => {
  const OFFSET = 10 // offset between element and border
  context.strokeStyle = '#bf94ff'
  context.lineWidth = 1

  switch (tool) {
    case 'rectangle':
    case 'rhombus':
    case 'triangle': {
      const w = x2 - x1 + OFFSET
      const h = y2 - y1 + OFFSET
      context.beginPath()
      // element handles
      createResizeHandles(context, { x1, y1, x2, y2 })
      // element border
      context.rect(x1 - OFFSET / 2, y1 - OFFSET / 2, w, h)
      context.stroke()
      break
    }

    case 'circle': {
      const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      const r = d / 2
      const centerX = average(x1, x2)
      const centerY = average(y1, y2)
      context.beginPath()
      // element handles
      createCircleResizeHandles(context, { centerX, centerY, r })
      // element border
      context.rect(centerX - r, centerY - r, d, d)
      context.stroke()
      break
    }

    case 'line':
    case 'arrow': {
      context.beginPath()
      createLineResizeHandles(context, { x1, y1, x2, y2 })
      context.stroke()
      break
    }

    case 'pen': {
      if (!points) break

      const pointsX = points.map((p) => p.x)
      const pointsY = points.map((p) => p.y)

      context.beginPath()
      const minX = Math.min(...pointsX)
      const maxX = Math.max(...pointsX)
      const minY = Math.min(...pointsY)
      const maxY = Math.max(...pointsY)
      createPenResizeHandles(context, { x1: minX, y1: minY, x2: maxX, y2: maxY })
      context.stroke()
      context.strokeRect(minX, minY, maxX - minX, maxY - minY)
      break
    }

    case 'image': {
      context.beginPath()
      createResizeHandles(context, { x1, y1, x2, y2 })
      context.stroke()
      break
    }

    default:
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
    case 'arrow':
      return {
        stroke: options.stroke,
        strokeWidth: +options.strokeWidth,
      }

    case 'text':
      return {
        stroke: options.stroke,
        fontSize: options.fontSize,
        fontFamily: options.fontFamily,
      }

    case 'pen':
      return {
        stroke: options.stroke,
        strokeWidth: +options.strokeWidth,
      }

    default:
      return {
        stroke: options.stroke,
        strokeWidth: +options.strokeWidth,
        fill: options.fillStyle !== 'none' ? options.fill : undefined,
        fillStyle: options.fillStyle !== 'none' ? options.fillStyle : undefined,
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

const average = (a: number, b: number) => (a + b) / 2

type CreateElement = ({
  x1,
  y1,
  x2,
  y2,
  tool,
  id,
  options,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  tool: Tool
  id: string
  options: DrawingOptions
}) => PenDrawing | PolygonDrawing | TextDrawing | ImageDrawing
