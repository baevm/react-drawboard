import { LOCALSTORAGE_KEY } from '@/constants'
import { resetImagesFromDb } from '@/helpers/image'
import { Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

type Boards = Record<string, Drawings>
type BoardHistory = Record<string, Drawings[]>

interface DrawingsStore {
  boards: Boards
  historyDrawings: BoardHistory
  boardsStateIndex: Record<string, number>

  createBoard: (name: string) => void
  updateBoardName: (oldName: string, newName: string) => void
  setBoards: (boards: Boards) => void

  setDrawings: (key: string, drawings: Drawings) => void
  resetDrawings: () => void

  setHistoryDrawings: (key: string, drawings: Drawings) => void
  resetHistory: () => void
  setBoardsStateIndex: (key: string) => void

  undoDraw: (key: string) => void
  redoDraw: (key: string) => void
}

const saveBoardsToLS = (boards: Boards) => {
  window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(boards))
}

// used to sync localstorage with store drawings
const saveDrawingsToLocalStorage = (board: string, newDrawings: Drawings) => {
  let oldBoards = window.localStorage.getItem(LOCALSTORAGE_KEY)

  if (oldBoards) {
    let currentBoards: Record<string, Drawings> = JSON.parse(oldBoards)

    currentBoards[board] = newDrawings

    saveBoardsToLS(currentBoards)
  } else {
    saveBoardsToLS({ [board]: newDrawings })
  }
}

// remove devtools later
const drawingsStore = create<DrawingsStore>()(
  devtools((set, get) => ({
    boards: {},
    historyDrawings: {},
    boardsStateIndex: {},

    setDrawings: (key, drawings) =>
      set({
        boards: { ...get().boards, [key]: drawings },
      }),

    setHistoryDrawings: (key, drawings) =>
      set((state) => {
        const history = state.historyDrawings[key]

        history.push(drawings)

        return {
          historyDrawings: { ...state.historyDrawings, [key]: history },
        }
      }),

    resetHistory: () =>
      set({
        historyDrawings: { default: [[]] },
      }),

    resetDrawings: () =>
      set({
        boards: { default: [] },
      }),

    setBoardsStateIndex: (key) =>
      set({
        boardsStateIndex: { ...get().boardsStateIndex, [key]: get().boardsStateIndex[key] + 1 },
      }),

    createBoard: (name) =>
      set((state) => {
        if (state.boards[name]) {
          return {}
        }

        saveDrawingsToLocalStorage(name, [])

        return {
          boards: { ...state.boards, [name]: [] },
          boardsStateIndex: { ...state.boardsStateIndex, [name]: 0 },
          historyDrawings: { ...state.historyDrawings, [name]: [[]] },
        }
      }),

    setBoards: (boards) =>
      set(() => {
        const indexes: Record<string, number> = {}
        const history: Record<any, any> = {}

        Object.keys(boards).map((board) => {
          indexes[board] = 0
          history[board] = [[]]
        })

        return {
          boards,
          boardsStateIndex: indexes,
          historyDrawings: history,
        }
      }),

    updateBoardName: (oldName, newName) =>
      set((state) => {
        if (oldName === newName) {
          return {}
        }

        const boards = state.boards

        boards[newName] = boards[oldName]
        delete boards[oldName]

        saveBoardsToLS(boards)

        return { boards }
      }),

    undoDraw: (key) =>
      set((state) => {
        if (state.historyDrawings[key].length === 0) {
          return {}
        }

        const oldIndex = state.boardsStateIndex[key]
        const newIndex = oldIndex !== 0 ? oldIndex - 1 : oldIndex

        console.log(oldIndex, newIndex, state.historyDrawings)

        const currentDrawings = state.historyDrawings[key][newIndex]

        saveDrawingsToLocalStorage(key, currentDrawings)

        return {
          boardsStateIndex: { ...state.boardsStateIndex, [key]: newIndex },
          boards: { ...state.boards, [key]: currentDrawings },
        }
      }),

    redoDraw: (key) =>
      set((state) => {
        const historyLength = state.historyDrawings[key].length
        if (historyLength === 0) {
          return {}
        }

        const oldIndex = state.boardsStateIndex[key]

        const newIndex = oldIndex !== historyLength - 1 ? oldIndex + 1 : oldIndex

        const currentDrawings = state.historyDrawings[key][newIndex]

        saveDrawingsToLocalStorage(key, currentDrawings)

        return {
          boardsStateIndex: { ...state.boardsStateIndex, [key]: newIndex },
          boards: { ...state.boards, [key]: currentDrawings },
        }
      }),
  }))
)

export const useDrawings = (board: string) => {
  const { drawings, boards, setDrawings, setBoards, resetDrawingsStore } = drawingsStore(
    (state) => ({
      drawings: state.boards[board],
      boards: state.boards,
      setDrawings: state.setDrawings,
      setBoards: state.setBoards,
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
        setBoards(parsedItems)
      } catch (error) {
        resetDrawings()
      }
    } else {
      resetDrawings()
    }
  }, [])

  return { drawings, boards }
}

// https://github.com/pmndrs/zustand/issues/679#issuecomment-982084740
export const useDrawingsActions = () => {
  const {
    setDrawings,
    setHistoryDrawings,
    undoDraw,
    redoDraw,
    setBoardsStateIndex,
    resetHistory,
    resetDrawings,
    createBoard,
    updateBoardName,
  } = drawingsStore(
    (state) => ({
      setDrawings: state.setDrawings,
      undoDraw: state.undoDraw,
      redoDraw: state.redoDraw,
      setHistoryDrawings: state.setHistoryDrawings,
      setBoardsStateIndex: state.setBoardsStateIndex,
      resetHistory: state.resetHistory,
      resetDrawings: state.resetDrawings,
      createBoard: state.createBoard,
      updateBoardName: state.updateBoardName,
    }),
    shallow
  )
  const clearDrawings = (board: string) => {
    resetDrawings()
    resetHistory()
    saveDrawingsToLocalStorage(board, [])
    resetImagesFromDb()
  }

  const syncStorageDrawings = (board: string, drawings: Drawings) => {
    saveDrawingsToLocalStorage(board, drawings)
    setHistoryDrawings(board, drawings)
    setBoardsStateIndex(board)
  }

  return {
    setDrawings,
    undoDraw,
    redoDraw,
    clearDrawings,
    createBoard,
    updateBoardName,
    syncStorageDrawings,
  }
}
