import { LOCALSTORAGE_KEY } from '@/constants'
import { resetImagesFromDb } from '@/helpers/image'
import { Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

interface DrawingsStore {
  drawings: Record<string, Drawings>
  historyDrawings: Record<string, Drawings[]>
  currentStateIndex: number

  setDrawings: (key: string, drawings: Drawings) => void
  setHistoryDrawings: (key: string, drawings: Drawings) => void
  resetHistory: () => void
  resetDrawings: () => void
  setCurrentStateIndex: () => void
  undoDraw: (key: string) => void
  redoDraw: (key: string) => void
}

// used to sync localstorage with store drawings
const saveDrawingsToLocalStorage = (board: string, newDrawings: Drawings) => {
  let oldBoards = window.localStorage.getItem(LOCALSTORAGE_KEY)

  if (oldBoards) {
    let parsed: Record<string, Drawings> = JSON.parse(oldBoards)

    parsed[board] = newDrawings

    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(parsed))
  } else {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ [board]: newDrawings }))
  }

  //window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(newDrawings))
}

const drawingsStore = create<DrawingsStore>((set, get) => ({
  drawings: { default: [] },
  historyDrawings: { default: [[]] },
  currentStateIndex: 0,

  setDrawings: (key, drawings) => set({ drawings: { [key]: drawings } }),
  setHistoryDrawings: (key, historyDrawings) =>
    set({ historyDrawings: { [key]: [...get().historyDrawings[key], historyDrawings] } }),
  resetHistory: () => set({ historyDrawings: { default: [[]] } }),
  resetDrawings: () => set({ drawings: { default: [] } }),
  setCurrentStateIndex: () => set({ currentStateIndex: get().currentStateIndex + 1 }),

  undoDraw: (key) =>
    set((state) => {
      if (state.historyDrawings[key].length === 0) {
        return {}
      }

      const newIndex = state.currentStateIndex !== 0 ? state.currentStateIndex - 1 : state.currentStateIndex
      const currentDrawings = state.historyDrawings[key][newIndex]

      saveDrawingsToLocalStorage(key, currentDrawings)

      return {
        currentStateIndex: newIndex,
        drawings: { ...state.drawings, [key]: currentDrawings },
      }
    }),

  redoDraw: (key) =>
    set((state) => {
      const historyLength = state.historyDrawings[key].length
      if (historyLength === 0) {
        return {}
      }

      const newIndex =
        state.currentStateIndex !== historyLength - 1 ? state.currentStateIndex + 1 : state.currentStateIndex

      const currentDrawings = state.historyDrawings[key][newIndex]

      saveDrawingsToLocalStorage(key, currentDrawings)

      return {
        currentStateIndex: newIndex,
        drawings: { ...state.drawings, [key]: currentDrawings },
      }
    }),
}))

export const useDrawings = (board: string) => {
  const { drawings, setDrawings, resetDrawingsStore } = drawingsStore(
    (state) => ({
      drawings: state.drawings[board],
      setDrawings: state.setDrawings,
      resetDrawingsStore: state.resetDrawings,
    }),
    shallow
  )

  function resetDrawings() {
    resetDrawingsStore()
    saveDrawingsToLocalStorage('default', [])
  }

  // get drawings from localstorage on mount
  useEffect(() => {
    const items = localStorage.getItem(LOCALSTORAGE_KEY)

    if (items) {
      try {
        const parsedItems = JSON.parse(items) as Record<string, Drawings>
        setDrawings(board, parsedItems[board])
      } catch (error) {
        resetDrawings()
      }
    } else {
      resetDrawings()
    }
  }, [])

  return { drawings }
}

// https://github.com/pmndrs/zustand/issues/679#issuecomment-982084740
export const useDrawingsActions = () => {
  const { setDrawings, setHistoryDrawings, undoDraw, redoDraw, setCurrentStateIndex, resetHistory, resetDrawings } =
    drawingsStore(
      (state) => ({
        setDrawings: state.setDrawings,
        undoDraw: state.undoDraw,
        redoDraw: state.redoDraw,
        setHistoryDrawings: state.setHistoryDrawings,
        setCurrentStateIndex: state.setCurrentStateIndex,
        resetHistory: state.resetHistory,
        resetDrawings: state.resetDrawings,
      }),
      shallow
    )
  const clearDrawings = () => {
    resetDrawings()
    resetHistory()
    saveDrawingsToLocalStorage('default', [])
    resetImagesFromDb()
  }

  const syncStorageDrawings = (board: string, drawings: Drawings) => {
    saveDrawingsToLocalStorage(board, drawings)
    setHistoryDrawings(board, drawings)
    setCurrentStateIndex()
  }

  return { setDrawings, undoDraw, redoDraw, clearDrawings, syncStorageDrawings }
}
