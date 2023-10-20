import { DrawingOptions, Drawings, Point, ThreePoints, Tool, TwoPoints } from '@/types'
import getStroke from 'perfect-freehand'
import rough from 'roughjs'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { Circle } from './geometry/Circle'
import { Line } from './geometry/Line'
import { Rhombus } from './geometry/Rhombus'
import { Triangle } from './geometry/Triangle'
import { getMemoizedHTMLImage } from './image'
import {
  createCircleResizeHandles,
  createLineResizeHandles,
  createPenResizeHandles,
  createResizeHandles,
  createTriangleResizeHandles,
} from './resize'
import { getToolOptions } from './tool'

const roughGenerator = rough.generator()
const ROUGH_SEED = 100

export const createElement = ({
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
}) => {
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
        width: 0,
        height: 0,
        options: drawingOptions,
      }

    case 'circle':
      const { centerX, centerY } = Circle.center({ x1, y1, x2, y2 })
      roughElement = roughGenerator.ellipse(centerX, centerY, x2 - x1, y2 - y1, { ...drawingOptions, seed: ROUGH_SEED })
      break

    case 'rectangle':
      roughElement = roughGenerator.rectangle(x1, y1, x2 - x1, y2 - y1, { ...drawingOptions, seed: ROUGH_SEED })
      break

    case 'triangle':
      const eq = Triangle.createEquilateral({ x1, y1, x2, y2 })
      roughElement = roughGenerator.polygon([...(eq as any)], { ...drawingOptions, seed: ROUGH_SEED })
      return {
        tool,
        x1,
        y1,
        x2,
        y2,
        x3: eq[2][0],
        y3: eq[2][1],
        id,
        options: roughElement.options,
        sets: roughElement.sets,
        shape: roughElement.shape,
      }

    case 'rhombus':
      const rhombus = Rhombus.create({ x1, y1, x2, y2 })
      roughElement = roughGenerator.polygon([...(rhombus as any)], { ...drawingOptions, seed: ROUGH_SEED })
      break

    case 'arrow':
      const arrow = Line.createLineWithArrow({ x1, y1, x2, y2 })
      roughElement = roughGenerator.polygon([...(arrow as any)], { ...drawingOptions, seed: ROUGH_SEED })
      break

    case 'line':
      roughElement = roughGenerator.line(x1, y1, x2, y2, { ...drawingOptions, seed: ROUGH_SEED })
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
          thinning: 0.6,
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
      try {
        const image = await getMemoizedHTMLImage(element.id)
        context.drawImage(image, element.x1, element.y1, element.width, element.height)
      } catch (error) {
        console.error(error)
      }
      break

    default:
      roughCanvas.draw(element)
      break
  }
}

export const setSelectedElementBorder = (
  context: CanvasRenderingContext2D,
  tool: Tool,
  { x1, y1, x2, y2, x3, y3 }: ThreePoints,
  points?: Point[]
) => {
  const OFFSET = 10 // offset between element and border
  context.strokeStyle = '#bf94ff'
  context.lineWidth = 1

  switch (tool) {
    case 'rectangle':
    case 'rhombus':
    case 'image': {
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

    case 'triangle': {
      context.beginPath()
      // element handles
      createTriangleResizeHandles(context, {
        x1,
        y1,
        x2,
        y2,
        x3,
        y3,
      })
      // element border

      context.moveTo(x3 as number, y3 as number)
      context.lineTo(x1, y1)
      context.lineTo(x2, y2)
      context.closePath()
      context.stroke()
      break
    }

    case 'circle': {
      context.beginPath()
      // element handles
      createCircleResizeHandles(context, { x1, y1, x2, y2 })
      // element border
      context.rect(x1, y1, x2 - x1, y2 - y1)
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
      const minX = Math.min(...pointsX)
      const maxX = Math.max(...pointsX)
      const minY = Math.min(...pointsY)
      const maxY = Math.max(...pointsY)

      context.beginPath()
      createPenResizeHandles(context, { x1: minX, y1: minY, x2: maxX, y2: maxY })
      context.stroke()
      context.strokeRect(minX, minY, maxX - minX, maxY - minY)
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

export const average = (a: number, b: number) => (a + b) / 2
