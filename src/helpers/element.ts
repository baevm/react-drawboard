import { DrawingOptions, Drawings, Point, ThreePoints, Tool, TwoPoints } from '@/types'
import getStroke from 'perfect-freehand'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { Drawable } from 'roughjs/bin/core'
import { Circle } from './geometry/Circle'
import { Line } from './geometry/Line'
import { Rectangle } from './geometry/Rectangle'
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


export const createElement = ({
  tp,
  tool,
  id,
  options,
}: {
  tp: TwoPoints
  tool: Tool
  id: string
  options: DrawingOptions
}) => {
  let roughElement: Drawable

  const drawingOptions = getToolOptions(tool, options)

  switch (tool) {
    case 'pen':
      return {
        tool,
        points: [{ x: tp.x2, y: tp.y2 }],
        id,
        options: drawingOptions,
      }

    case 'text':
      return {
        tool,
        x1: tp.x1,
        y1: tp.y1,
        x2: tp.x2,
        y2: tp.y2,
        id,
        text: '',
        options: drawingOptions,
      }

    case 'image':
      return {
        tool,
        x1: tp.x1,
        y1: tp.y1,
        x2: tp.x2,
        y2: tp.y2,
        id,
        width: 0,
        height: 0,
        options: drawingOptions,
      }

    case 'circle':
      roughElement = Circle.createRoughCircle(tp, drawingOptions)
      break

    case 'rectangle':
      roughElement = Rectangle.createRoughRectangle(tp, drawingOptions)
      break

    case 'triangle':
      let { element, eq } = Triangle.createRoughEqTriangle(tp, drawingOptions)
      roughElement = element
      return {
        tool,
        x1: tp.x1,
        y1: tp.y1,
        x2: tp.x2,
        y2: tp.y2,
        x3: eq[2][0],
        y3: eq[2][1],
        id,
        options: roughElement.options,
        sets: roughElement.sets,
        shape: roughElement.shape,
      }

    case 'rhombus':
      roughElement = Rhombus.createRoughRhombus(tp, drawingOptions)
      break

    case 'arrow':
      roughElement = Line.createRoughArrow(tp, options)
      break

    case 'line':
      roughElement = Line.createRoughLine(tp, options)
      break

    default:
      throw new Error(`Invalid tool: ${tool}`)
  }

  return {
    tool,
    x1: tp.x1,
    y1: tp.y1,
    x2: tp.x2,
    y2: tp.y2,
    id,
    options: roughElement.options,
    sets: roughElement.sets,
    shape: roughElement.shape,
  }
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
  penPoints?: Point[]
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
      if (!penPoints) break

      const pointsX = penPoints.map((p) => p.x)
      const pointsY = penPoints.map((p) => p.y)
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

const average = (a: number, b: number) => (a + b) / 2
