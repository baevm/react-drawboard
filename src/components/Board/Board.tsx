import getStroke from 'perfect-freehand'
import React, { PointerEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './Board.module.css'
import rough from 'roughjs'

const roughGenerator = rough.generator()

const createElement = (x1: number, y1: number, x2: number, y2: number) => {
  const roughElement = roughGenerator.line(x1, y1, x2, y2)

  return { x1, y1, x2, y2, roughElement }
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

  /*   const [points, setPoints] = useState<number[][]>([])
  const [canvasItems, setCanvasItems] = useState<any[]>([])

  function handlePointerDown(e: any) {
    e.target.setPointerCapture(e.pointerId)
    setPoints([[e.pageX, e.pageY, e.pressure]])
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (e.buttons !== 1) return
    setPoints([...points, [e.pageX, e.pageY, e.pressure]])
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    ctx?.clearRect(0, 0, canvas!.width, canvas!.height)

    const stroke = getStroke(points, {
      size: 4,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    })

    const pathData = getSvgPathFromStroke(stroke)

    const myPath = new Path2D(pathData)

    ctx?.fill(myPath)

    return () => {}
  }, [points]) */

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    ctx?.clearRect(0, 0, canvas!.width, canvas!.height)

    const roughCanvas = rough.canvas(canvas!)

    drawings.forEach(({ roughElement }) => {
      roughCanvas.draw(roughElement)
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

    const index = drawings.length - 1

    const { x1, y1 } = drawings[index]
    const element = createElement(x1, y1, clientX, clientY)

    const elementsCopy = [...drawings]

    elementsCopy[index] = element
    setDrawings(elementsCopy)
  }

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
