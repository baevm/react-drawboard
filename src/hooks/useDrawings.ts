import { DEFAULT_BOARD_KEY, BOARDS_LS_KEY } from '@/constants'
import { getBoardsFromLS, saveBoardsToLS, saveBoardToLS } from '@/helpers/boards'
import { resetImagesFromDb } from '@/helpers/image'
import { BoardHistory, Boards, Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

interface DrawingsStore {
  boards: Boards
  historyDrawings: BoardHistory
  boardsStateIndex: Record<string, number>

  createBoard: (name: string) => void
  updateBoardName: (oldName: string, newName: string) => void
  setBoards: (boards: Boards) => void
  deleteBoard: (key: string) => void

  setDrawings: (key: string, drawings: Drawings) => void
  resetDrawings: (key: string) => void

  setHistoryDrawings: (key: string, drawings: Drawings) => void
  setBoardsStateIndex: (key: string) => void

  undoDraw: (key: string) => void
  redoDraw: (key: string) => void
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

    resetDrawings: (key) =>
      set((state) => {
        return {
          boards: { ...state.boards, [key]: [] },
          historyDrawings: { ...state.historyDrawings, [key]: [[]] },
          boardsStateIndex: { ...state.boardsStateIndex, [key]: 0 },
        }
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

        saveBoardToLS(name, [])

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
          history[board] = [boards[board]]
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
        const historyDrawings = state.historyDrawings

        boards[newName] = boards[oldName]
        historyDrawings[newName] = historyDrawings[oldName]

        delete boards[oldName]
        delete historyDrawings[oldName]

        saveBoardsToLS(boards)

        return { boards, historyDrawings }
      }),

    deleteBoard: (key) =>
      set((state) => {
        const boards = state.boards

        if (key in boards) {
          delete boards[key]
        }

        saveBoardsToLS(boards)

        return {
          boards,
        }
      }),

    undoDraw: (key) =>
      set((state) => {
        if (state.historyDrawings[key].length === 0) {
          return {}
        }

        const oldIndex = state.boardsStateIndex[key]
        const newIndex = oldIndex !== 0 ? oldIndex - 1 : oldIndex

        const currentDrawings = state.historyDrawings[key][newIndex]

        saveBoardToLS(key, currentDrawings)

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

        saveBoardToLS(key, currentDrawings)

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

  function resetDrawings(board: string) {
    resetDrawingsStore(board)
    saveBoardToLS(DEFAULT_BOARD_KEY, [])
  }

  // get drawings from localstorage on mount
  useEffect(() => {
    const items = getBoardsFromLS()

    if (items) {
      setDrawings(board, items[board])
      setBoards(items)
    } else {
      resetDrawings(board)
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
    resetDrawings,
    createBoard,
    updateBoardName,
    deleteBoard,
  } = drawingsStore(
    (state) => ({
      setDrawings: state.setDrawings,
      undoDraw: state.undoDraw,
      redoDraw: state.redoDraw,
      setHistoryDrawings: state.setHistoryDrawings,
      setBoardsStateIndex: state.setBoardsStateIndex,
      resetDrawings: state.resetDrawings,
      createBoard: state.createBoard,
      updateBoardName: state.updateBoardName,
      deleteBoard: state.deleteBoard,
    }),
    shallow
  )

  const clearDrawings = (board: string) => {
    resetDrawings(board)
    saveBoardToLS(board, [])
    resetImagesFromDb()
  }

  const syncStorageDrawings = (board: string, drawings: Drawings) => {
    saveBoardToLS(board, drawings)
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
    deleteBoard,
  }
}
