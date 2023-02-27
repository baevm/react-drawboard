import { Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'

const LOCALSTORAGE_KEY = 'drawings'

interface DrawingsStore {
  drawings: Drawings
  historyDrawings: Drawings

  setStoreDrawings: (drawings: Drawings) => void
  undoDraw: () => void
  redoDraw: () => void
}

// used to sync localstorage with store drawings
const syncStorageDrawings = (newDrawings: Drawings) => {
  window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newDrawings))
}

const drawingsStore = create<DrawingsStore>((set, get) => ({
  drawings: [],
  historyDrawings: [],

  setStoreDrawings: (drawings: any) => set({ drawings, historyDrawings: [] }),

  undoDraw: () =>
    set((state) => {
      const last = state.drawings[state.drawings.length - 1]

      if (!last) return {}

      const newHistory = [...state.historyDrawings, last]
      const newDraw = state.drawings.slice(0, -1)

      syncStorageDrawings(newDraw)

      return {
        historyDrawings: newHistory,
        drawings: newDraw,
      }
    }),

  redoDraw: () =>
    set((state) => {
      if (state.historyDrawings.length === 0) {
        return {}
      }

      const newHistory = state.historyDrawings.slice(0, -1)
      const newDraw = [...state.drawings, state.historyDrawings[state.historyDrawings.length - 1]]

      syncStorageDrawings(newDraw)

      return {
        historyDrawings: newHistory,
        drawings: newDraw,
      }
    }),
}))

export const useDrawnings = () => {
  const { drawings, setStoreDrawings, undoDraw, redoDraw } = drawingsStore((state) => ({
    drawings: state.drawings,
    setStoreDrawings: state.setStoreDrawings,
    undoDraw: state.undoDraw,
    redoDraw: state.redoDraw,
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

  const clearDrawings = () => {
    setDrawings([])
    syncStorageDrawings([])
  }

  return { drawings, setDrawings, syncStorageDrawings, clearDrawings, undoDraw, redoDraw }
}
