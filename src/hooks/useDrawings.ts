import { LOCALSTORAGE_KEY } from '@/constants'
import { resetImagesFromDb } from '@/helpers/image'
import { Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

interface DrawingsStore {
  drawings: Drawings
  historyDrawings: Drawings[]
  currentStateIndex: number

  setDrawings: (drawings: Drawings) => void
  setHistoryDrawings: (drawings: Drawings) => void
  resetHistory: () => void
  setCurrentStateIndex: () => void
  undoDraw: () => void
  redoDraw: () => void
}

// used to sync localstorage with store drawings
const saveDrawingsToLocalStorage = (newDrawings: Drawings) => {
  window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newDrawings))
}

const drawingsStore = create<DrawingsStore>((set, get) => ({
  drawings: [],
  historyDrawings: [[]],
  currentStateIndex: 0,

  setDrawings: (drawings) => set({ drawings }),
  setHistoryDrawings: (historyDrawings) => set({ historyDrawings: [...get().historyDrawings, historyDrawings] }),
  resetHistory: () => set({ historyDrawings: [[]] }),
  setCurrentStateIndex: () => set({ currentStateIndex: get().currentStateIndex + 1 }),

  undoDraw: () =>
    set((state) => {
      if (state.historyDrawings.length === 0) {
        return {}
      }

      const newIndex = state.currentStateIndex !== 0 ? state.currentStateIndex - 1 : state.currentStateIndex
      const currentDrawings = state.historyDrawings[newIndex]

      saveDrawingsToLocalStorage(currentDrawings)

      return {
        currentStateIndex: newIndex,
        drawings: currentDrawings,
      }
    }),

  redoDraw: () =>
    set((state) => {
      const historyLength = state.historyDrawings.length
      if (historyLength === 0) {
        return {}
      }

      const newIndex =
        state.currentStateIndex !== historyLength - 1 ? state.currentStateIndex + 1 : state.currentStateIndex

      const currentDrawings = state.historyDrawings[newIndex]

      saveDrawingsToLocalStorage(currentDrawings)

      return {
        currentStateIndex: newIndex,
        drawings: currentDrawings,
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
  const { setDrawings, setHistoryDrawings, undoDraw, redoDraw, setCurrentStateIndex, resetHistory } = drawingsStore(
    (state) => ({
      setDrawings: state.setDrawings,
      undoDraw: state.undoDraw,
      redoDraw: state.redoDraw,
      setHistoryDrawings: state.setHistoryDrawings,
      setCurrentStateIndex: state.setCurrentStateIndex,
      resetHistory: state.resetHistory,
    }),
    shallow
  )
  const clearDrawings = () => {
    setDrawings([])
    resetHistory()
    saveDrawingsToLocalStorage([])
    resetImagesFromDb()
  }

  const syncStorageDrawings = (drawings: Drawings) => {
    saveDrawingsToLocalStorage(drawings)
    setHistoryDrawings(drawings)
    setCurrentStateIndex()
  }

  return { setDrawings, undoDraw, redoDraw, clearDrawings, syncStorageDrawings }
}
