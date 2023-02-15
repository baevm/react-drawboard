import { LinearDrawing, useDrawnings } from '@/hooks/useDrawings'
import { useTools } from '@/hooks/useTools'
import { Action, Tool } from '@/types'
import { generateId } from '@/utils/generateId'
import React, { useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import styles from './Board.module.css'
import { adjustDrawingCoordinates, getElementAtCoords, resizedCoordiantes } from './helpers/Coordinates'
import { cursorForPosition } from './helpers/Cursor'
import { createElement, drawElement } from './helpers/Element'

const getElementById = (id: string, drawings: any) => {
  return drawings.find((element: any) => element.id === id)
}

const getIndexOfElement = (id: string, drawings: any) => {
  return drawings.findIndex((element: any) => element.id === id)
}

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [action, setAction] = useState<Action>('none')
  const [selectedElement, setSelectedElement] = useState<any>(null)
  const tool = useTools((state) => state.tool)
  const { drawings, setDrawings, syncStorageDrawings } = useDrawnings()

  // uselayouteffect performs better than useEffect
  // for dom operations
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    ctx?.clearRect(0, 0, canvas!.width, canvas!.height)
    const roughCanvas = rough.canvas(canvas!)

    for (const element of drawings) {
      drawElement(roughCanvas, ctx!, element)
    }
  }, [drawings])

  const updateElement = (x1: number, y1: number, x2: number, y2: number, tool: Tool, index: number, id: string) => {
    const drawingsCopy = [...drawings] as any

    switch (tool) {
      case 'pen':
        drawingsCopy[index].points = [...drawingsCopy[index].points, { x: x2, y: y2 }]
        break
      case 'text':
        break
      default:
        drawingsCopy[index] = createElement(x1, y1, x2, y2, tool, id)
        break
    }

    setDrawings(drawingsCopy)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = e

    if (tool === 'eraser') {
      const element = getElementAtCoords(clientX, clientY, drawings)

      if (element) {
        const index = drawings.indexOf(element)
        const elementsCopy = [...drawings]
        elementsCopy.splice(index, 1)
        setDrawings(elementsCopy)
      }
    } else if (tool === 'select') {
      const element = getElementAtCoords(clientX, clientY, drawings)

      if (element) {
        const offsetOfClickX = clientX - element.x1
        const offsetOfClickY = clientY - element.y1
        setSelectedElement({ ...element, offsetOfClickX, offsetOfClickY })

        if (element.position === 'inside') {
          setAction('moving')
        } else {
          setAction('resizing')
        }
      }
    } else {
      const { clientX, clientY } = e
      const elementId = generateId()
      const newElement = createElement(clientX, clientY, clientX, clientY, tool, elementId) as LinearDrawing

      setSelectedElement(newElement)
      setDrawings([...drawings, newElement])
      setAction('drawing')
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e

    const { style } = e.target as HTMLElement

    switch (tool) {
      case 'select':
        const element = getElementAtCoords(clientX, clientY, drawings)
        style.cursor = element ? cursorForPosition(element.position) : 'default'
        break
      case 'eraser':
        style.cursor =
          "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAARRJREFUOE/dlDFLxEAQhd+BVouFZ3vlQuwSyI+5a7PBRkk6k9KzTOwStJFsWv0xgaQzkNLWszim0kL2OOFc9oKRYHFTz37Lm/dmJhi5JiPzcBjAOYDz7WheADz3jalP8oIxds85P3Zd90RBqqpad133SUSXAJ5M4H3AhWVZd1EUzYQQP96VZYkkSV7btr02QY1Axtgqz/NTz/OM6qSUCMNwRURneoMJOLdt+7Gu643MfeU4zrppmgt9pibgjRBiWRRFb0R934eUcgngdrfxX4CjSwZj7C3Lsqnu8Lc05XQQBO9ENP2NKapnE5s4jme608rhNE2HxWb7qwr2A+f8SAv2BxFdDQ32rpLRVu9Pl+0wztcg6V/VPW4Vw1FsawAAAABJRU5ErkJggg==') 10 10, auto"
        break
      case 'move':
        style.cursor = 'grab'
        break
      default:
        style.cursor = 'crosshair'
        break
    }

    if (action === 'drawing') {
      const index = drawings.length - 1
      const { x1, y1, id } = drawings[index] as LinearDrawing

      updateElement(x1, y1, clientX, clientY, tool, index, id)
    } else if (action === 'moving') {
      const { id, x1, x2, y1, y2, tool, offsetOfClickX, offsetOfClickY } = selectedElement

      const index = getIndexOfElement(id, drawings)
      const width = x2 - x1
      const height = y2 - y1
      const newX = clientX - offsetOfClickX
      const newY = clientY - offsetOfClickY

      updateElement(newX, newY, newX + width, newY + height, tool, index, id)
    } else if (action === 'resizing') {
      const { id, tool, position } = selectedElement
      const coordinates = {
        x1: selectedElement.x1,
        y1: selectedElement.y1,
        x2: selectedElement.x2,
        y2: selectedElement.y2,
      }
      const index = getIndexOfElement(id, drawings)
      const { x1, y1, x2, y2 } = resizedCoordiantes(clientX, clientY, position, coordinates)

      updateElement(x1, y1, x2, y2, tool, index, id)
    }
  }

  const handleMouseUp = () => {
    const id = selectedElement.id
    const index = drawings.findIndex((element) => element.id === id)

    if ((action === 'drawing' || action === 'resizing') && tool !== 'pen') {
      const element = getElementById(id, drawings)
      const { x1, y1, x2, y2 } = adjustDrawingCoordinates(element)
      updateElement(x1, y1, x2, y2, element.tool, index, id)
    }

    setAction('none')
    syncStorageDrawings(drawings)
    setSelectedElement(null)
  }

  return (
    <div className={styles.board_container}>
      <canvas
        ref={canvasRef}
        className={styles.board_canvas}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ backgroundColor: '#F8F9FB' }}
      />
    </div>
  )
}

export default Board
