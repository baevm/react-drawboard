import { useDrawnings } from '@/hooks/useDrawings'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useTools } from '@/hooks/useTools'
import { Action, Drawing, PenDrawing, PolygonDrawing, Tool } from '@/types'
import { generateId } from '@/utils/generateId'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import styles from './Board.module.css'
import { adjustDrawingCoordinates, getElementAtCoords, resizedCoordiantes } from './helpers/Coordinates'
import { cursorForPosition, eraserIcon } from './helpers/Cursor'
import { createElement, drawElement, getElementById, getIndexOfElement } from './helpers/Element'

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [action, setAction] = useState<Action>('none')
  const [selectedElement, setSelectedElement] = useState<DrawingWithOffset | null>(null)
  const { tool, options } = useTools((state) => ({ tool: state.tool, options: state.options }))
  const { drawings, setDrawings, syncStorageDrawings } = useDrawnings()
  const { width, height } = useResizeObserver()

  const canvasScale = window.devicePixelRatio

  // ??? uselayouteffect performs better than useEffect
  // for dom operations
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    ctx?.clearRect(0, 0, canvas!.width, canvas!.height)
    const roughCanvas = rough.canvas(canvas!)

    for (const element of drawings) {
      //BUG: should return so when writing new text
      // is not overlaping with old
      if (action === 'writing' && selectedElement?.id === element.id) {
        return
      }

      drawElement(roughCanvas, ctx!, element)
    }
  }, [drawings, width, height, selectedElement])

  //BUG: fires on blur on textarea mount
  useEffect(() => {
    const textArea = textAreaRef.current
    if (action === 'writing') {
      /* textArea.focus() */
      textArea!.value! = selectedElement!.text!
    }
  }, [action, selectedElement])

  const updateElement = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    tool: Tool,
    index: number,
    id: string,
    newOptions?: any
  ) => {
    const drawingsCopy = [...drawings] as any

    switch (tool) {
      case 'pen':
        drawingsCopy[index].points = [...drawingsCopy[index].points, { x: x2, y: y2 }]
        break
      case 'text':
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const width = ctx!.measureText(newOptions.text).width
        const height = 24

        drawingsCopy[index] = {
          ...createElement(x1, y1, x1 + width, y1 + height, tool, id, options),
          text: newOptions.text,
        }
        break
      default:
        drawingsCopy[index] = createElement(x1, y1, x2, y2, tool, id, options)
        break
    }

    setDrawings(drawingsCopy)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (action === 'writing') {
      return
    }

    let { clientX, clientY } = e

    // scale to high dpi
    clientX = clientX * canvasScale
    clientY = clientY * canvasScale

    const isEraser = tool === 'eraser'
    const isSelect = tool === 'select'
    const isDraw =
      tool === 'pen' ||
      tool === 'arrow' ||
      tool === 'circle' ||
      tool === 'line' ||
      tool === 'triangle' ||
      tool === 'rectangle' ||
      tool === 'rhombus' ||
      tool === 'text'

    if (isEraser) {
      const element = getElementAtCoords(clientX, clientY, drawings)

      if (!element) return

      const index = getIndexOfElement(element.id, drawings)
      const elementsCopy = [...drawings]
      elementsCopy.splice(index, 1)
      setDrawings(elementsCopy)
      return
    }

    if (isSelect) {
      const element = getElementAtCoords(clientX, clientY, drawings)

      if (!element) return

      if (element.tool === 'pen') {
        const offsetsX = element.points.map((point) => clientX - point.x)
        const offsetsY = element.points.map((point) => clientY - point.y)

        setSelectedElement({ ...element, offsetsX, offsetsY })
      } else {
        const offsetOfClickX = clientX - element.x1
        const offsetOfClickY = clientY - element.y1
        setSelectedElement({ ...element, offsetOfClickX, offsetOfClickY })
      }

      if (element.position === 'inside') {
        setAction('moving')
      } else {
        setAction('resizing')
      }
      return
    }

    if (isDraw) {
      const elementId = generateId()
      const newElement = createElement(clientX, clientY, clientX, clientY, tool, elementId, options) as any

      setDrawings([...drawings, newElement])
      setSelectedElement(newElement)
      setAction(tool === 'text' ? 'writing' : 'drawing')
      return
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    let { clientX, clientY } = e
    const { style } = e.target as HTMLElement

    // scale to high dpi
    clientX = clientX * canvasScale
    clientY = clientY * canvasScale

    const isDrawing = action === 'drawing'
    const isMoving = action === 'moving'
    const isResizing = action === 'resizing'

    switch (tool) {
      case 'select':
        const element = getElementAtCoords(clientX, clientY, drawings)
        style.cursor = element ? cursorForPosition(element.position) : 'default'
        break
      case 'eraser':
        style.cursor = eraserIcon
        break
      case 'move':
        style.cursor = 'grab'
        break
      case 'text':
        style.cursor = 'text'
        break
      default:
        style.cursor = 'crosshair'
        break
    }

    if (isDrawing) {
      const index = drawings.length - 1
      const { x1, y1, id } = drawings[index] as any

      updateElement(x1, y1, clientX, clientY, tool, index, id)
      return
    }

    if (isMoving) {
      if (selectedElement?.tool === 'pen') {
        const newPoints = selectedElement.points.map((point: any, index: number) => ({
          x: clientX - selectedElement.offsetsX![index],
          y: clientY - selectedElement.offsetsY![index],
        }))
        const drawingsCopy = [...drawings] as any
        const index = getIndexOfElement(selectedElement.id, drawings)
        drawingsCopy[index] = {
          ...drawingsCopy[index],
          points: newPoints,
        }
        setDrawings(drawingsCopy)
      } else {
        const { id, x1, x2, y1, y2, tool, offsetOfClickX, offsetOfClickY } = selectedElement as any

        const index = getIndexOfElement(id, drawings)
        const width = x2 - x1
        const height = y2 - y1
        const newX = clientX - offsetOfClickX
        const newY = clientY - offsetOfClickY

        const newOptions = tool === 'text' ? { text: selectedElement!.text } : {}

        updateElement(newX, newY, newX + width, newY + height, tool, index, id, newOptions)
      }
      return
    }

    if (isResizing) {
      const { id, tool, position, x1: oldX1, y1: oldY1, x2: oldX2, y2: oldY2 } = selectedElement as any
      const coordinates = {
        x1: oldX1,
        y1: oldY1,
        x2: oldX2,
        y2: oldY2,
      }
      const index = getIndexOfElement(id, drawings)
      const { x1, y1, x2, y2 } = resizedCoordiantes(clientX, clientY, position, coordinates)

      updateElement(x1, y1, x2, y2, tool, index, id)
      return
    }
  }

  // FIXME: TRIANGLE WRONG COORDS AFTER ADJUST
  const handleMouseUp = (e: React.MouseEvent) => {
    let { clientX, clientY } = e
    clientX = clientX * canvasScale
    clientY = clientY * canvasScale

    if (selectedElement) {
      if (
        selectedElement.tool === 'text' &&
        clientX - selectedElement.offsetOfClickX === selectedElement.x1 &&
        clientY - selectedElement.offsetOfClickY === selectedElement.y1
      ) {
        setAction('writing')
        return
      }

      const id = selectedElement.id
      const index = drawings.findIndex((element) => element.id === id)
      const element = getElementById(id, drawings) as PolygonDrawing

      if ((action === 'drawing' || action === 'resizing') && isAdjustable(element.tool)) {
        const { x1, y1, x2, y2 } = adjustDrawingCoordinates(element)
        updateElement(x1, y1, x2, y2, element!.tool, index, id)
      }
    }

    if (action === 'writing') {
      return
    }

    setAction('none')
    syncStorageDrawings(drawings)
    setSelectedElement(null)
  }

  const handleBlur = (e: any) => {
    const { id, x1, y1, tool } = selectedElement as any
    setAction('none')
    setSelectedElement(null)

    const index = drawings.findIndex((element) => element.id === id)
    updateElement(x1, y1, null as any, null as any, tool, index, id, { text: e.target.value })
  }

  return (
    <div className={styles.board_container}>
      {action === 'writing' ? (
        <textarea
          ref={textAreaRef}
          onBlur={handleBlur}
          style={{
            position: 'fixed',
            top: selectedElement?.y1! - 7,
            left: selectedElement?.x1,
            font: '24px SourceSansPro',
            outline: 0,
            border: '1px dashed lightgray',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            whiteSpace: 'pre',
            margin: 0,
            padding: 0,
          }}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className={styles.board_canvas}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        width={width * canvasScale}
        height={height * canvasScale}
        style={{
          width,
          height,
        }}
      />
    </div>
  )
}

export default Board

type DrawingWithOffset = Drawing & {
  offsetOfClickX?: any
  offsetOfClickY?: any
  offsetsX?: any[]
  offsetsY?: any[]
}

const isAdjustable = (tool: Tool) => {
  return (
    tool === 'pen' ||
    tool === 'arrow' ||
    tool === 'circle' ||
    tool === 'line' ||
    tool === 'triangle' ||
    tool === 'rectangle' ||
    tool === 'rhombus'
  )
}
