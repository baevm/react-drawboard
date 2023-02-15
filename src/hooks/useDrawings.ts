import { useEffect, useState } from 'react'
import { Drawable } from 'roughjs/bin/core'
import { create } from 'zustand'

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

interface DrawingsStore {
  drawings: Drawings
  setStateDrawings: (drawings: Drawings) => void
}

const drawingsStore = create<DrawingsStore>((set) => ({
  drawings: [],

  setStateDrawings: (drawings: any) => set({ drawings }),
}))

export const useDrawnings = () => {
  const { drawings, setStoreDrawings } = drawingsStore((state) => ({
    drawings: state.drawings,
    setStoreDrawings: state.setStateDrawings,
  }))

  // get drawings from localstorage on mount
  useEffect(() => {
    const items = localStorage.getItem(LOCALSTORAGE_KEY)
    if (items) {
      const parsedItems = JSON.parse(items) as Drawings
      setDrawings(parsedItems)
    } else {
      setDrawings([])
    }
  }, [])

  const setDrawings = (newDrawings: Drawings) => {
    setStoreDrawings(newDrawings)
  }

  // used to set localstorage after mouseUp
  const syncStorageDrawings = (newDrawings: Drawings) => {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newDrawings))
  }

  const clearDrawings = () => {
    setDrawings([])
    window.localStorage.removeItem(LOCALSTORAGE_KEY)
  }

  const undoDrawing = () => {}

  const redoDrawing = () => {}

  return { drawings, setDrawings, syncStorageDrawings, clearDrawings, undoDrawing, redoDrawing }
}
