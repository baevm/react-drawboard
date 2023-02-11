import { Tool, useTools } from '@/hooks/useTools'
import { generateId } from '@/utils/generateId'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import styles from './Board.module.css'
import { createElement, drawElement, getElementAtPoints } from './helpers/Element'

type Action = 'drawing' | 'erasing' | 'moving' | 'selecting' | 'none'

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [action, setAction] = useState<Action>('none')
  const [drawings, setDrawings] = useState<any[]>([])
  const [selectedElement, setSelectedElement] = useState<any>(null)
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
    const { clientX, clientY } = e

    if (tool === 'eraser') {
      const element = getElementAtPoints(clientX, clientY, drawings)

      if (element) {
        const index = drawings.indexOf(element)
        const elementsCopy = [...drawings]

        elementsCopy.splice(index, 1)

        setDrawings(elementsCopy)
      }
    } else if (tool === 'select') {
      const element = getElementAtPoints(clientX, clientY, drawings)

      if (element) {
        const offsetOfClickX = clientX - element.x1
        const offsetOfClickY = clientY - element.y1

        setSelectedElement({ ...element, offsetOfClickX, offsetOfClickY })
        setAction('moving')
      }
    } else {
      const { clientX, clientY } = e

      const elementId = generateId()
      const newElement = createElement(clientX, clientY, clientX, clientY, tool, elementId)

      setDrawings((prev) => [...prev, newElement])

      setAction('drawing')
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const index = drawings.length - 1

    if (tool === 'select') {
      ;(e.target as HTMLElement).style.cursor = getElementAtPoints(clientX, clientY, drawings) ? 'move' : 'default'
    }

    if (action === 'drawing') {
      if (tool === 'pen') {
        const elementsCopy = [...drawings]

        elementsCopy[index] = {
          ...elementsCopy[index],
          points: [...elementsCopy[index].points, { x: clientX, y: clientY }],
        }

        setDrawings(elementsCopy)
      } else {
        const { x1, y1 } = drawings[index]
        const elementsCopy = [...drawings]

        const currentId = elementsCopy[index].id

        elementsCopy[index] = createElement(x1, y1, clientX, clientY, tool, currentId)

        setDrawings(elementsCopy)
      }
    } else if (action === 'erasing') {
      const element = getElementAtPoints(clientX, clientY, drawings)
      if (!element) return

      ;(e.target as HTMLElement).style.cursor = element
        ? "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==') 10 10, auto"
        : 'default'
    } else if (action === 'moving') {
      const { id, x1, x2, y1, y2, tool, offsetOfClickX, offsetOfClickY } = selectedElement
      const elementsCopy = [...drawings]

      const index = elementsCopy.findIndex((element) => element.id === id)

      const width = x2 - x1
      const height = y2 - y1

      const newX = clientX - offsetOfClickX
      const newY = clientY - offsetOfClickY

      elementsCopy[index] = createElement(newX, newY, newX + width, newY + height, tool, id)
      setDrawings(elementsCopy)
    }
  }

  const handleMouseUp = () => {
    setAction('none')
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
