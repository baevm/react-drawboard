import { Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'

const LOCALSTORAGE_KEY = 'drawings'

interface DrawingsStore {
  drawings: Drawings
  pastDrawings: Drawings
  futureDrawings: Drawings

  setStoreDrawings: (drawings: Drawings) => void
  setPastDrawings: (drawings: Drawings) => void
  setFutureDrawings: (drawings: Drawings) => void
  undoDraw: () => void
  redoDraw: () => void
}

// used to sync localstorage with store drawings
const syncStorageDrawings = (newDrawings: Drawings) => {
  window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newDrawings))
}

const drawingsStore = create<DrawingsStore>((set, get) => ({
  drawings: [],
  pastDrawings: [],
  futureDrawings: [],

  setStoreDrawings: (drawings: any) => set({ drawings, futureDrawings: [] }),
  setPastDrawings: (pastDrawings: any) => set({ pastDrawings }),
  setFutureDrawings: (futureDrawings: any) => set({ futureDrawings }),

  undoDraw: () =>
    set((state) => {
      const last = state.drawings[state.drawings.length - 1]

      if (!last) return {}

      const newPast = [...state.pastDrawings, last]
      const newDraw = state.drawings.slice(0, -1)
      const newFuture = [...state.futureDrawings, last]

      syncStorageDrawings(newDraw)

      return {
        pastDrawings: newPast,
        drawings: newDraw,
        futureDrawings: newFuture,
      }
    }),

  redoDraw: () =>
    set((state) => {
      if (state.futureDrawings.length === 0) {
        return {}
      }

      const newPast = state.pastDrawings.slice(0, -1)
      const newDraw = [...state.drawings, state.futureDrawings[state.futureDrawings.length - 1]]
      const newFuture = state.futureDrawings.slice(0, -1)

      syncStorageDrawings(newDraw)

      return {
        pastDrawings: newPast,
        drawings: newDraw,
        futureDrawings: newFuture,
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
    window.localStorage.removeItem(LOCALSTORAGE_KEY)
  }

  return { drawings, setDrawings, syncStorageDrawings, clearDrawings, undoDraw, redoDraw }
}
