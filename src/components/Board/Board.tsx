import { DEVICE_PIXEL_RATIO } from '@/constants'
import { setCursor, updateCurrentCursor } from '@/helpers/cursor'
import {
  createElement,
  drawElement,
  getElementById,
  getIndexOfElement,
  setSelectedElementBorder,
} from '@/helpers/element'
import { openBase64File } from '@/helpers/files'
import { loadHTMLImage, saveImageToDb } from '@/helpers/image'
import {
  addPoints,
  adjustDrawingPoints,
  calcElementOffsets,
  diffPoints,
  getElementAtPoints,
  resizePoints,
  scalePoints,
} from '@/helpers/points'
import { isAdjustableTool, isDrawableTool } from '@/helpers/tool'
import { useDrawings, useDrawingsActions } from '@/hooks/useDrawings'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useBoardState } from '@/hooks/useBoardState'
import { ZOOM_TYPE, useZoom } from '@/hooks/useZoom'
import { Action, DrawingOptions, DrawingWithOffset, Tool } from '@/types'
import { generateId } from '@/utils/generateId'
import { getCanvas } from '@/utils/getCanvas'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import styles from './Board.module.css'

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const { tool, currentBoard, options, setTool } = useBoardState((state) => ({
    tool: state.tool,
    currentBoard: state.currentBoard,
    options: state.options,
    setTool: state.setTool,
  }))
  const { width, height } = useResizeObserver()
  const { drawings } = useDrawings(currentBoard)
  const { setDrawings, syncStorageDrawings } = useDrawingsActions()
  const { canvasScale, viewportTopLeft, handleZoom, setViewportTopLeft } = useZoom()

  const [action, setAction] = useState<Action>('none')
  const [selectedElement, setSelectedElement] = useState<DrawingWithOffset | null>(null)

  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const lastOffsetRef = useRef({ x: 0, y: 0 })

  // draw
  useLayoutEffect(() => {
    async function drawElements() {
      if (!drawings) {
        return
      }

      const { canvas, context } = getCanvas()

      const storedTransform = context.getTransform()
      context.canvas.width = context.canvas.width
      context.setTransform(storedTransform)
      context.save()

      const roughCanvas = rough.canvas(canvas!)

      for (const element of drawings) {
        const isActive = selectedElement?.id === element.id
        const isWritting = action === 'writing' && isActive
        const isDrawing = action === 'drawing'

        if (isActive && !isDrawing) {
          setSelectedElementBorder(
            context,
            element.tool,
            {
              x1: element.x1!,
              y1: element.y1!,
              x2: element.x2!,
              y2: element.y2!,
              x3: element.x3,
              y3: element.y3,
            },
            element.points
          )
        }

        if (isWritting) {
          continue
        }

        context.restore()
        context.save()

        await drawElement(roughCanvas, context, element)
      }
    }

    drawElements()
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

  // set value and size in textarea
  useEffect(() => {
    if (action === 'writing') {
      textAreaRef.current!.value! = selectedElement!.text!
      resizeTextarea(selectedElement!.text!)
    }
  }, [action, selectedElement, textAreaRef])

  // scale to high dpi & zoom & pan
  const getScaledXY = (x: number, y: number) => {
    return {
      clientX: (x * DEVICE_PIXEL_RATIO) / canvasScale + viewportTopLeft.x,
      clientY: (y * DEVICE_PIXEL_RATIO) / canvasScale + viewportTopLeft.y,
    }
  }

  // update element when drawing
  const updateElement: UpdateElement = (x1, y1, x2, y2, tool, index, id, oldOptions, text) => {
    const drawingsCopy = [...drawings] as any

    switch (tool) {
      case 'pen': {
        drawingsCopy[index].points = [...drawingsCopy[index].points, { x: x2, y: y2 }]
        break
      }

      case 'text': {
        const { context } = getCanvas()
        const width = context.measureText(text).width
        const height = +oldOptions.fontSize!

        drawingsCopy[index] = {
          ...drawingsCopy[index],
          x1,
          y1,
          x2: x1 + width,
          y2: y1 + height,
          tool,
          id,
          options: oldOptions,
          text,
        }
        break
      }

      case 'image': {
        const width = x2 - x1
        const height = y2 - y1

        drawingsCopy[index] = { ...drawingsCopy[index], x1, y1, x2, y2, width, height, tool, id, options: oldOptions }
        break
      }

      default: {
        drawingsCopy[index] = createElement({ x1, y1, x2, y2, tool, id, options: oldOptions })
        break
      }
    }

    setDrawings(currentBoard, drawingsCopy)
    return drawingsCopy[index]
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const { clientX, clientY } = getScaledXY(e.clientX, e.clientY)

    if (action === 'writing' || e.button > 1) {
      return
    }

    if (selectedElement) {
      const clickedElement = getElementAtPoints(clientX, clientY, drawings)

      if (!clickedElement) {
        setSelectedElement(null)
      } else if (clickedElement.position !== 'inside') {
        setAction('resizing')
      }
    }

    const isEraser = tool === 'eraser'
    const isSelect = tool === 'select'
    const isPan = tool === 'pan' || e.button === 1
    const isDraw = isDrawableTool(tool)
    const isImage = tool === 'image'

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
      setDrawings(currentBoard, elementsCopy)
      return
    }

    if (isSelect) {
      const element = getElementAtPoints(clientX, clientY, drawings)

      if (!element) return

      const { offsetX, offsetY } = calcElementOffsets(element, { x: clientX, y: clientY })
      setSelectedElement({ ...(element as DrawingWithOffset), offsetX, offsetY })

      if (element.position === 'inside') {
        setAction('moving')
      }

      return
    }

    if (isDraw) {
      const elementId = generateId()
      const newElement = createElement({
        x1: clientX,
        y1: clientY,
        x2: clientX,
        y2: clientY,
        tool,
        id: elementId,
        options,
      }) as any

      setDrawings(currentBoard, [...drawings, newElement])
      setSelectedElement(newElement)
      setAction(tool === 'text' ? 'writing' : 'drawing')
      return
    }

    if (isImage) {
      async function setImageElement() {
        const base64Image = await openBase64File()
        const id = generateId()

        saveImageToDb({ id, dataURL: base64Image as string })

        const HTMLImage = await loadHTMLImage(base64Image as string)

        const element = {
          tool,
          id,
          x1: clientX,
          y1: clientY,
          x2: HTMLImage.width + clientX,
          y2: HTMLImage.height + clientY,
          width: HTMLImage.width,
          height: HTMLImage.height,
          options,
        }

        setDrawings(currentBoard, [...drawings, element as any])
        setTool('pan')
        return
      }

      setImageElement()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = getScaledXY(e.clientX, e.clientY)
    const { style } = e.target as HTMLElement

    const isDrawing = action === 'drawing'
    const isMovingPen = action === 'moving' && selectedElement?.tool === 'pen'
    const isMovingPolygon = action === 'moving' && isAdjustableTool(selectedElement?.tool)
    const isResizing = action === 'resizing' && selectedElement
    const isPanning = action === 'panning'

    updateCurrentCursor(tool, clientX, clientY, drawings, selectedElement, style)

    if (isDrawing) {
      // get index from last element
      // because we just added new element
      const index = drawings.length - 1
      const { x1, y1, id, options } = drawings[index] as any

      const elem = updateElement(x1, y1, clientX, clientY, tool, index, id, options)
      setSelectedElement(elem)
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
      setDrawings(currentBoard, drawingsCopy)
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
      const { id, tool, position, x1: oldX1, y1: oldY1, x2: oldX2, y2: oldY2, options } = selectedElement

      const points = {
        x1: oldX1!,
        y1: oldY1!,
        x2: oldX2!,
        y2: oldY2!,
      }

      const index = getIndexOfElement(id, drawings)

      const { x1, y1, x2, y2 } = resizePoints(clientX, clientY, position, points)

      updateElement(x1, y1, x2, y2, tool, index, id, options!)
      return
    }

    if (isPanning) {
      const lastMousePos = lastMousePosRef.current
      const currentMousePos = { x: e.pageX, y: e.pageY }
      lastMousePosRef.current = currentMousePos

      const mouseDiff = diffPoints(currentMousePos, lastMousePos)
      setOffset((prevOffset) => addPoints(prevOffset, mouseDiff))
      setCursor(style, 'grabbing')

      return
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    // avoid saving text element with empty text
    if (selectedElement?.tool === 'text' && selectedElement.text === '') {
      setAction('none')
      return
    }

    const { clientX, clientY } = getScaledXY(e.clientX, e.clientY)

    const isDrawing = action === 'drawing'
    const isResizing = action === 'resizing'

    if (selectedElement) {
      const isJustCreatedText =
        selectedElement.tool === 'text' && clientX === selectedElement.x1 && clientY === selectedElement.y1

      if (isJustCreatedText) {
        setAction('writing')
        return
      }

      const isTextEditMode =
        selectedElement.tool === 'text' &&
        clientX - selectedElement.offsetX === selectedElement.x1 &&
        clientY - selectedElement.offsetY === selectedElement.y1

      if (isTextEditMode) {
        setAction('writing')
        return
      }

      const id = selectedElement.id
      const index = getIndexOfElement(id, drawings)
      const element = getElementById(id, drawings) as any

      if ((isDrawing || isResizing) && isAdjustableTool(element.tool)) {
        const { x1, y1, x2, y2 } = adjustDrawingPoints(element)
        updateElement(x1, y1, x2, y2, element.tool, index, id, element.options)
      }

      if (isDrawing) {
        setSelectedElement(null)
      }
    }

    setAction('none')
    syncStorageDrawings(currentBoard, drawings)
  }

  const handleTextAreaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    console.log(e)

    if (e.target.value === '') {
      return
    }

    const { id, x1, y1, tool, options } = selectedElement as any
    const text = e.target.value

    const index = getIndexOfElement(id, drawings)
    updateElement(x1, y1, null as any, null as any, tool, index, id, options, text)

    setAction('none')
    setSelectedElement(null)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const resizeTextarea = (text: string) => {
    const { context } = getCanvas()

    // set context font to current font
    // because on first mount it contains incorrect font
    // even though it shows right
    context.font = `${options.fontSize}px ${options.fontFamily}`

    // now measure width of text with correct font,
    // if width is 0 (just created text element) then
    // set width to default textarea size: 100
    const width = context!.measureText(text).width || 100

    // set width of textarea with offset of 5 px
    textAreaRef.current!.style.width = width + 5 + 'px'
  }

  return (
    <div className={styles.board_container}>
      <canvas
        id='canvas'
        ref={canvasRef}
        className={styles.board_canvas}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={(e) => handleZoom(e.deltaY, ZOOM_TYPE.wheel)}
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
          onBlur={handleTextAreaBlur}
          onChange={(e) => resizeTextarea(e.target.value)}
          style={{
            position: 'fixed',
            top: selectedElement?.y1! - 7,
            left: selectedElement?.x1,
            font: `${options.fontSize}px ${options.fontFamily}`,
            color: options.stroke,
            outline: 0,
            border: '1px dashed #bf94ff',
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
) => any
