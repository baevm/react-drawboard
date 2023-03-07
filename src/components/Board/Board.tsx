import { DEVICE_PIXEL_RATIO } from '@/constants'
import { useDrawings } from '@/hooks/useDrawings'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useTools } from '@/hooks/useTools'
import { useZoom } from '@/hooks/useZoom'
import { Action, Drawing, DrawingOptions, Point, PolygonDrawing, Tool } from '@/types'
import { generateId } from '@/utils/generateId'
import { getCanvas } from '@/utils/getCanvas'
import { db } from '@/utils/indexdb'
import { fileOpen } from 'browser-fs-access'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import styles from './Board.module.css'
import { cursorForPosition, eraserIcon } from './helpers/Cursor'
import { createElement, drawElement, getElementById, getIndexOfElement } from './helpers/Element'
import {
  addPoints,
  adjustDrawingPoints,
  diffPoints,
  getElementAtPoints,
  resizePoints,
  scalePoints,
} from './helpers/Points'

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { tool, options, setTool } = useTools((state) => ({
    tool: state.tool,
    options: state.options,
    setTool: state.setTool,
  }))
  const { width, height } = useResizeObserver()
  const { drawings, setDrawings, syncStorageDrawings } = useDrawings()
  const { canvasScale, viewportTopLeft, handleZoom, setViewportTopLeft } = useZoom()

  const [action, setAction] = useState<Action>('none')
  const [selectedElement, setSelectedElement] = useState<DrawingWithOffset | null>(null)

  const [offset, setOffset] = useState({ x: 0, y: 0 })
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
      const offsetDiff = scalePoints(diffPoints(offset, lastOffsetRef.current), canvasScale)
      context.translate(offsetDiff.x, offsetDiff.y)
      const diffPointCoords = diffPoints(viewportTopLeft, offsetDiff)
      setViewportTopLeft(diffPointCoords)
    }
  }, [offset, canvasScale])

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset
  }, [offset])

  // set value in textarea
  useEffect(() => {
    if (action === 'writing') {
      textAreaRef.current!.value! = selectedElement!.text!
    }
  }, [action, selectedElement, textAreaRef])

  // scale to high dpi & zoom & pan
  const getXY = (x: number, y: number) => {
    return {
      clientX: (x * DEVICE_PIXEL_RATIO) / canvasScale + viewportTopLeft.x,
      clientY: (y * DEVICE_PIXEL_RATIO) / canvasScale + viewportTopLeft.y,
    }
  }

  // update element when drawing
  const updateElement: UpdateElement = (x1, y1, x2, y2, tool, index, id, oldOptions, text) => {
    const drawingsCopy = [...drawings] as any

    switch (tool) {
      case 'pen':
        drawingsCopy[index].points = [...drawingsCopy[index].points, { x: x2, y: y2 }]
        break

      case 'text':
        const { context } = getCanvas()
        const width = context.measureText(text).width
        const height = +oldOptions.fontSize
        drawingsCopy[index] = {
          ...createElement(x1, y1, x1 + width, y1 + height, tool, id, oldOptions),
          text,
        }
        break

      default:
        drawingsCopy[index] = createElement(x1, y1, x2, y2, tool, id, oldOptions)
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
    const isPan = tool === 'pan' || e.button === 1
    const isDraw = isDrawableTool(tool)
    const isImage = tool === 'image'

    const { clientX, clientY } = getXY(e.clientX, e.clientY)

    if (isPan) {
      // pageX, pageY used because
      // clientX, and clientY already scaled, and
      // it's going to offset when panning
      lastMousePosRef.current = { x: e.pageX, y: e.pageY }
      setAction('panning')
      return
    }

    if (isEraser) {
      const element = getElementAtPoints(clientX, clientY, drawings)

      if (!element) return

      const index = getIndexOfElement(element.id, drawings)
      const elementsCopy = [...drawings]
      elementsCopy.splice(index, 1)
      setDrawings(elementsCopy)
      return
    }

    if (isSelect) {
      const element = getElementAtPoints(clientX, clientY, drawings)

      if (!element) return

      const { offsetX, offsetY } = calcOffsets(element, { x: clientX, y: clientY })
      setSelectedElement({ ...element, offsetX, offsetY })

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

    if (isImage) {
      async function setImageElement() {
        const base64Image = await openBase64File()
        const id = generateId()
        await db.files.add({
          id,
          dataURL: base64Image,
        })
        const element = { tool, id, x1: clientX, y1: clientY }

        setDrawings([...drawings, element as any])
        setTool('pan')
        return
      }

      setImageElement()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = getXY(e.clientX, e.clientY)
    const { style } = e.target as HTMLElement

    const isDrawing = action === 'drawing'
    const isMovingPen = action === 'moving' && selectedElement?.tool === 'pen'
    const isMovingPolygon = action === 'moving' && isPolygon(selectedElement?.tool)
    const isResizing = action === 'resizing'
    const isPanning = action === 'panning'

    switch (tool) {
      case 'select':
        const element = getElementAtPoints(clientX, clientY, drawings)
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
      // get index from last element
      // because we just added new element
      const index = drawings.length - 1
      const { x1, y1, id, options } = drawings[index] as any

      updateElement(x1, y1, clientX, clientY, tool, index, id, options)
      return
    }

    if (isMovingPen) {
      const newPoints = selectedElement.points.map((_: any, idx: number) => ({
        x: clientX - selectedElement.offsetX![idx],
        y: clientY - selectedElement.offsetY![idx],
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
      const { id, x1, x2, y1, y2, tool, offsetX, offsetY, options } = selectedElement as any

      const index = getIndexOfElement(id, drawings)
      const width = x2 - x1
      const height = y2 - y1
      const newX = clientX - offsetX
      const newY = clientY - offsetY

      // moving text
      const text = tool === 'text' ? selectedElement!.text : null

      updateElement(newX, newY, newX + width, newY + height, tool, index, id, options, text)
      return
    }

    if (isResizing) {
      const { id, tool, position, x1: oldX1, y1: oldY1, x2: oldX2, y2: oldY2, options } = selectedElement as any

      const points = {
        x1: oldX1,
        y1: oldY1,
        x2: oldX2,
        y2: oldY2,
      }
      const index = getIndexOfElement(id, drawings)
      const { x1, y1, x2, y2 } = resizePoints(clientX, clientY, position, points)

      updateElement(x1, y1, x2, y2, tool, index, id, options)
      return
    }

    if (isPanning) {
      const lastMousePos = lastMousePosRef.current
      const currentMousePos = { x: e.pageX, y: e.pageY }
      lastMousePosRef.current = currentMousePos

      const mouseDiff = diffPoints(currentMousePos, lastMousePos)
      setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))

      return
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const { clientX, clientY } = getXY(e.clientX, e.clientY)

    if (selectedElement) {
      if (
        selectedElement.tool === 'text' &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1
      ) {
        setAction('writing')
        return
      }

      const id = selectedElement.id
      const index = drawings.findIndex((element) => element.id === id)
      const element = getElementById(id, drawings) as any

      if ((action === 'drawing' || action === 'resizing') && isPolygon(element.tool)) {
        const { x1, y1, x2, y2 } = adjustDrawingPoints(element)
        updateElement(x1, y1, x2, y2, element.tool, index, id, element.options)
      }
    }

    setAction('none')
    syncStorageDrawings(drawings)
    setSelectedElement(null)
  }

  const handleBlur = (e: any) => {
    const { id, x1, y1, tool, options } = selectedElement as any
    const text = e.target.value
    setAction('none')
    setSelectedElement(null)

    const index = getIndexOfElement(id, drawings)
    updateElement(x1, y1, null as any, null as any, tool, index, id, options, text)
  }

  const handleContextMenu = (e: any) => {
    e.preventDefault()
  }

  const resizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { context } = getCanvas()

    // set context font to current font
    // because on first mount it contains incorrect font
    // even though it shows right
    context.font = `${options.fontSize}px ${options.fontFamily}`

    // now measure width of text with correct font
    const width = context!.measureText(e.target.value).width

    // set width of textarea with offset of 5 px
    textAreaRef.current!.style.width = width + 5 + 'px'
  }

  // TODO: infinite canvas move
  return (
    <div className={styles.board_container}>
      <canvas
        id='canvas'
        ref={canvasRef}
        className={styles.board_canvas}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={(e) => handleZoom(e.deltaY, 'wheel')}
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
          onChange={resizeTextarea}
          style={{
            position: 'fixed',
            top: selectedElement?.y1! - 7,
            left: selectedElement?.x1,
            font: `${options.fontSize}px ${options.fontFamily}`,
            color: options.stroke,
            outline: 0,
            border: '1px dashed black',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            whiteSpace: 'pre',
            margin: 0,
            padding: 0,
            width: '100px',
            resize: 'none',
          }}
        />
      ) : null}
    </div>
  )
}

export default Board

type DrawingWithOffset = Drawing & {
  offsetX?: any | any[]
  offsetY?: any | any[]
}

type UpdateElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tool: Tool,
  index: number,
  id: string,
  oldOptions: DrawingOptions,
  text?: any
) => void

const calcOffsets = (element: Drawing, { x, y }: Point) => {
  if (element.tool === 'pen') {
    return {
      offsetX: element.points.map((point) => x - point.x),
      offsetY: element.points.map((point) => y - point.y),
    }
  } else {
    return {
      offsetX: x - element.x1,
      offsetY: y - element.y1,
    }
  }
}

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

export async function openBase64File() {
  const blob = await fileOpen({
    mimeTypes: ['image/*'],
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
  }).catch((e) => console.error(e))

  if (!blob) return

  const base64Image = await readFileAsUrl(blob)

  return base64Image
}

export function readFileAsUrl(file: any) {
  return new Promise(function (resolve, reject) {
    let fr = new FileReader()

    fr.readAsDataURL(file)

    fr.onload = function () {
      resolve(fr.result)
    }

    fr.onerror = function () {
      reject(fr)
    }
  })
}
