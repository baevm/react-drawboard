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
  const { tool, options } = useTools((state) => ({
    tool: state.tool,
    options: state.options,
  }))
  const { drawings, setDrawings, syncStorageDrawings } = useDrawnings()
  const { width, height } = useResizeObserver()

  const [action, setAction] = useState<Action>('none')
  const [selectedElement, setSelectedElement] = useState<DrawingWithOffset | null>(null)

  const [canvasScale, setCanvasScale] = useState(window.devicePixelRatio)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [viewportTopLeft, setViewportTopLeft] = useState({ x: 0, y: 0 })
  const isResetRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const lastOffsetRef = useRef({ x: 0, y: 0 })

  // draw
  useLayoutEffect(() => {
    const { canvas, context } = getCanvas()

    const storedTransform = context.getTransform()
    context.canvas.width = context.canvas.width
    context.setTransform(storedTransform)

    const roughCanvas = rough.canvas(canvas!)

    for (const element of drawings) {
      if (action === 'writing' && selectedElement?.id === element.id) {
        continue
      }

      drawElement(roughCanvas, context, element)
    }
  }, [drawings, width, height, selectedElement, action, canvasScale, offset, viewportTopLeft])

  // pan canvas when scale changes
  useLayoutEffect(() => {
    if (lastOffsetRef.current) {
      const { context } = getCanvas()
      const offsetDiff = scalePoint(diffPoints(offset, lastOffsetRef.current), canvasScale)
      context.translate(offsetDiff.x, offsetDiff.y)
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff))
      isResetRef.current = false
    }
  }, [offset, canvasScale])

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset
  }, [offset])

  // set value in textarea on open
  useEffect(() => {
    if (action === 'writing') {
      textAreaRef.current!.value! = selectedElement!.text!
    }
  }, [action, selectedElement, textAreaRef])

  // mouse move event listener
  useEffect(() => {
    const canvasElem = canvasRef.current
    if (canvasElem === null) {
      return
    }

    function handleUpdateMouse(event: MouseEvent) {
      event.preventDefault()
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY }
        const topLeftCanvasPos = {
          x: canvasRef.current.offsetLeft,
          y: canvasRef.current.offsetTop,
        }
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos))
      }
    }

    canvasElem.addEventListener('mousemove', handleUpdateMouse)
    canvasElem.addEventListener('wheel', handleUpdateMouse)
    return () => {
      canvasElem.removeEventListener('mousemove', handleUpdateMouse)
      canvasElem.removeEventListener('wheel', handleUpdateMouse)
    }
  }, [])

  // get canvas and context from ref
  function getCanvas() {
    const canvas = canvasRef.current!
    return { canvas, context: canvas.getContext('2d')! }
  }

  // scale to high dpi
  function getCoords(x: number, y: number) {
    return { clientX: x * DEVICE_PIXEL_RATIO + offset.x, clientY: y * DEVICE_PIXEL_RATIO + offset.y }
  }

  // update element when drawing
  const updateElement: UpdateElement = (x1, y1, x2, y2, tool, index, id, text) => {
    const drawingsCopy = [...drawings] as any

    switch (tool) {
      case 'pen':
        drawingsCopy[index].points = [...drawingsCopy[index].points, { x: x2, y: y2 }]

        break
      case 'text':
        const { context } = getCanvas()
        const width = context!.measureText(text).width
        const height = +options.fontSize
        drawingsCopy[index] = {
          ...createElement(x1, y1, x1 + width, y1 + height, tool, id, options),
          text,
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

    const isEraser = tool === 'eraser'
    const isSelect = tool === 'select'
    const isPan = tool === 'pan'
    const isDraw = isDrawableTool(tool)

    const { clientX, clientY } = getCoords(e.clientX, e.clientY)

    if (e.button === 1 || isPan) {
      lastMousePosRef.current = { x: e.pageX, y: e.pageY }
      setAction('panning')
      return
    }

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
      const newElement = createElement(
        clientX + offset.x,
        clientY + offset.y,
        clientX + offset.x,
        clientY + offset.y,
        tool,
        elementId,
        options
      ) as any

      setDrawings([...drawings, newElement])
      setSelectedElement(newElement)

      setAction(tool === 'text' ? 'writing' : 'drawing')
      return
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = getCoords(e.clientX, e.clientY)
    const { style } = e.target as HTMLElement

    const isDrawing = action === 'drawing'
    const isMovingPen = action === 'moving' && selectedElement?.tool === 'pen'
    const isMovingPolygon = action === 'moving' && isPolygon(selectedElement?.tool)
    const isResizing = action === 'resizing'
    const isPanning = action === 'panning'

    switch (tool) {
      case 'select':
        const element = getElementAtCoords(clientX, clientY, drawings)
        style.cursor = element ? cursorForPosition(element.position) : 'default'
        break
      case 'eraser':
        style.cursor = eraserIcon
        break
      case 'pan':
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

      updateElement(x1, y1, clientX + offset.x, clientY + offset.y, tool, index, id)
      return
    }

    if (isMovingPen) {
      const newPoints = selectedElement.points.map((_: any, idx: number) => ({
        x: clientX - selectedElement.offsetsX![idx],
        y: clientY - selectedElement.offsetsY![idx],
      }))
      const drawingsCopy = [...drawings] as any
      const index = getIndexOfElement(selectedElement.id, drawings)
      drawingsCopy[index] = {
        ...drawingsCopy[index],
        points: newPoints,
      }
      setDrawings(drawingsCopy)
      return
    }

    if (isMovingPolygon) {
      const { id, x1, x2, y1, y2, tool, offsetOfClickX, offsetOfClickY } = selectedElement as any

      const index = getIndexOfElement(id, drawings)
      const width = x2 - x1
      const height = y2 - y1
      const newX = clientX - offsetOfClickX
      const newY = clientY - offsetOfClickY

      const text = tool === 'text' ? selectedElement!.text : null

      updateElement(newX, newY, newX + width, newY + height, tool, index, id, text)
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

    if (isPanning) {
      const { context } = getCanvas()

      if (context) {
        const lastMousePos = lastMousePosRef.current
        const currentMousePos = { x: e.pageX, y: e.pageY } // use document so can pan off element
        lastMousePosRef.current = currentMousePos

        const mouseDiff = diffPoints(currentMousePos, lastMousePos)
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))
      }
      return
    }
  }

  // FIXME: TRIANGLE WRONG COORDS AFTER ADJUST
  const handleMouseUp = (e: React.MouseEvent) => {
    const { clientX, clientY } = getCoords(e.clientX, e.clientY)

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

      if ((action === 'drawing' || action === 'resizing') && isPolygon(element.tool)) {
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
    const text = e.target.value
    setAction('none')
    setSelectedElement(null)

    const index = getIndexOfElement(id, drawings)
    updateElement(x1, y1, null as any, null as any, tool, index, id, text)
  }

  const handleContextMenu = (e: any) => {
    e.preventDefault()
  }

  const handleWheel = (e: React.WheelEvent) => {
    const { context } = getCanvas()

    const zoom = 1 - e.deltaY / ZOOM_SENSITIVITY

    const viewportTopLeftDelta = {
      x: (mousePos.x / canvasScale) * (1 - 1 / zoom),
      y: (mousePos.y / canvasScale) * (1 - 1 / zoom),
    }
    const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta)

    context.translate(viewportTopLeft.x, viewportTopLeft.y)
    context.scale(zoom, zoom)
    context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y)

    setViewportTopLeft(newViewportTopLeft)
    setCanvasScale(canvasScale * zoom)
    isResetRef.current = false
  }

  // TODO: infinite canvas move
  return (
    <div className={styles.board_container}>
      <canvas
        ref={canvasRef}
        className={styles.board_canvas}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        width={width * DEVICE_PIXEL_RATIO}
        height={height * DEVICE_PIXEL_RATIO}
        style={{
          width,
          height,
        }}
      />

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

type UpdateElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tool: Tool,
  index: number,
  id: string,
  text?: any
) => void

type Point = {
  x: number
  y: number
}

const ZOOM_SENSITIVITY = 500
const DEVICE_PIXEL_RATIO = window.devicePixelRatio

const isDrawableTool = (tool: Tool) => {
  return (
    tool === 'pen' ||
    tool === 'arrow' ||
    tool === 'circle' ||
    tool === 'line' ||
    tool === 'triangle' ||
    tool === 'rectangle' ||
    tool === 'rhombus' ||
    tool === 'text'
  )
}

const isPolygon = (tool: Tool | undefined) => {
  return (
    tool === 'arrow' ||
    tool === 'circle' ||
    tool === 'line' ||
    tool === 'triangle' ||
    tool === 'rectangle' ||
    tool === 'rhombus' ||
    tool === 'text'
  )
}

function scalePoint(p1: Point, scale: number) {
  return { x: p1.x / scale, y: p1.y / scale }
}

function addPoints(p1: Point, p2: Point) {
  return { x: p1.x + p2.x, y: p1.y + p2.y }
}

function diffPoints(p1: Point, p2: Point) {
  return { x: p1.x - p2.x, y: p1.y - p2.y }
}

function getEventLocation(e: any) {
  if (e.touches && e.touches.length == 1) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else {
    return { x: e.clientX, y: e.clientY }
  }
}
