import { Tool } from '@/types'
import getStroke from 'perfect-freehand'
import rough from 'roughjs'
import { RoughCanvas } from 'roughjs/bin/canvas'

const roughGenerator = rough.generator()

export const createElement = (x1: number, y1: number, x2: number, y2: number, tool: Tool, id: string, options: any) => {
  let roughElement

  switch (tool) {
    case 'pen':
      return {
        tool,
        points: [{ x: x2, y: y2 }],
        id,
        ...options,
      }
    case 'circle':
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2
      const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2
      const d = r * 2
      roughElement = roughGenerator.circle(cx, cy, d)
      break
    case 'rectangle':
      roughElement = roughGenerator.rectangle(x1, y1, x2 - x1, y2 - y1)
      break
    case 'line':
      roughElement = roughGenerator.line(x1, y1, x2, y2)
      break
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
      roughElement = roughGenerator.polygon([...(equilateral as any)])
      break
    case 'rhombus':
      const rhombus = [
        [x1, y1 + (y2 - y1) / 2],
        [x1 + (x2 - x1) / 2, y1],
        [x2, y1 + (y2 - y1) / 2],
        [x1 + (x2 - x1) / 2, y2],
      ]
      roughElement = roughGenerator.polygon([...(rhombus as any)])
      break
    case 'arrow':
      const arrow = [[x1, y1]]
      roughElement = roughGenerator.polygon([...(arrow as any)])
      break
    case 'eraser':
      break
    case 'text':
      break
    default:
      throw new Error('Invalid tool')
  }

  return { x1, y1, x2, y2, roughElement, tool, id, ...options }
}

export const drawElement = (roughCanvas: RoughCanvas, context: CanvasRenderingContext2D, element: any) => {
  if (element.tool === 'pen') {
    const stroke = getSvgPathFromStroke(
      getStroke(element.points, { size: 4, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
    )
    context.fillStyle = element.lineColor
    context.fill(new Path2D(stroke))
  } else {
    roughCanvas.draw(element.roughElement)
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
