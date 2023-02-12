import { useEffect, useState } from 'react'
import { Drawable } from 'roughjs/bin/core'
import { create } from 'zustand'
import { Tool } from './useTools'

const LOCALSTORAGE_KEY = 'drawings'

type BaseDrawing = {
  id: string
}

export type LinearDrawing = BaseDrawing & {
  tool:
    | 'select'
    | 'line'
    | 'circle'
    | 'rectangle'
    | 'text'
    | 'eraser'
    | 'move'
    | 'image'
    | 'triangle'
    | 'arrow'
    | 'rhombus'
  x1: number
  x2: number
  y1: number
  y2: number
  roughElement: Drawable
}

export type PenDrawing = BaseDrawing & {
  tool: 'pen'
  points: { x: number; y: number }[]
}

type Drawings = (PenDrawing | LinearDrawing)[]

export const useDrawnings = () => {
  const [drawings, setStateDrawings] = useState<Drawings>([])

  useEffect(() => {
    const items = localStorage.getItem(LOCALSTORAGE_KEY)
    if (items) {
      const parsedItems = JSON.parse(items) as Drawings
      setStateDrawings(parsedItems)
    } else {
      setStateDrawings([])
    }
  }, [])

  const syncStorageDrawings = () => {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(drawings))
  }

  const setDrawings = (drawings: Drawings) => {
    console.log({ drawings })
    setStateDrawings(drawings)
  }

  return { drawings, setDrawings, syncStorageDrawings }
}
