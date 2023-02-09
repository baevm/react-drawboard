import { Tool, useTools } from '@/hooks/useTools'
import getStroke from 'perfect-freehand'
import React, { useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import { RoughCanvas } from 'roughjs/bin/canvas'
import styles from './Board.module.css'

const roughGenerator = rough.generator()

const createElement = (x1: number, y1: number, x2: number, y2: number, tool: Tool) => {
  let roughElement

  switch (tool) {
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
    case 'pen':
      return {
        tool,
        points: [{ x: x2, y: y2 }],
      }

    default:
      throw new Error('Invalid tool')
  }

  return { x1, y1, x2, y2, roughElement, tool }
}

const drawElement = (roughCanvas: RoughCanvas, context: CanvasRenderingContext2D, element: any) => {
  if (element.tool === 'pen') {
    const stroke = getSvgPathFromStroke(
      getStroke(element.points, { size: 4, thinning: 0.5, smoothing: 0.5, streamline: 0.5 })
    )
    context.fillStyle = 'black'
    context.fill(new Path2D(stroke))
  } else {
    roughCanvas.draw(element.roughElement)
  }
}

const average = (a: any, b: any) => (a + b) / 2

function getSvgPathFromStroke(points: any, closed = true) {
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

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawings, setDrawings] = useState<any[]>([])
  const tool = useTools((state) => state.tool)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    ctx?.clearRect(0, 0, canvas!.width, canvas!.height)

    const roughCanvas = rough.canvas(canvas!)

    drawings.forEach((element) => {
      drawElement(roughCanvas, ctx!, element)
    })
  }, [drawings])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    const { clientX, clientY } = e

    const newElement = createElement(clientX, clientY, clientX, clientY, tool)

    setDrawings((prev) => [...prev, newElement])
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return

    const { clientX, clientY } = e

    if (tool === 'pen') {
      const index = drawings.length - 1
      const { x1, y1 } = drawings[index]

      const element = createElement(x1, y1, clientX, clientY, tool)

      const elementsCopy = [...drawings]

      elementsCopy[index] = {
        ...element,
        points: [...elementsCopy[index].points, { x: clientX, y: clientY }],
      }
      setDrawings(elementsCopy)
    } else {
      const index = drawings.length - 1

      const { x1, y1 } = drawings[index]
      const element = createElement(x1, y1, clientX, clientY, tool)

      const elementsCopy = [...drawings]

      elementsCopy[index] = element
      setDrawings(elementsCopy)
    }
  }

  console.log({ drawings })
  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  return (
    <div className={styles.board_container}>
      <canvas
        ref={canvasRef}
        className={styles.board_canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  )
}

export default Board
