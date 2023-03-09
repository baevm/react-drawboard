import { LOCALSTORAGE_KEY } from '@/constants'
import { Drawings } from '@/types'
import { db } from '@/utils/indexdb'
import { useEffect } from 'react'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

interface DrawingsStore {
  drawings: Drawings
  historyDrawings: Drawings

  setDrawings: (drawings: Drawings) => void
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

  setDrawings: (drawings: any) => set({ drawings, historyDrawings: [] }),

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

export const useDrawings = () => {
  const { drawings, setDrawings } = drawingsStore(
    (state) => ({
      drawings: state.drawings,
      setDrawings: state.setDrawings,
    }),
    shallow
  )

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

  return { drawings }
}

// https://github.com/pmndrs/zustand/issues/679#issuecomment-982084740
export const useDrawingsActions = () => {
  const { setDrawings, undoDraw, redoDraw } = drawingsStore(
    (state) => ({ setDrawings: state.setDrawings, undoDraw: state.undoDraw, redoDraw: state.redoDraw }),
    shallow
  )
  const clearDrawings = () => {
    setDrawings([])
    syncStorageDrawings([])
    db.files.clear()
  }
  return { setDrawings, undoDraw, redoDraw, clearDrawings, syncStorageDrawings }
}
