import { DEFAULT_BOARD_KEY } from '@/constants'
import { debouncedSaveToLS, getBoardsFromLS, saveBoardToLS, saveBoardsToLS } from '@/helpers/boards'
import { resetImagesFromDb } from '@/helpers/image'
import { BoardHistory, Boards, Drawings } from '@/types'
import { useEffect } from 'react'
import { create } from 'zustand'
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

const drawingsStore = create<DrawingsStore>((set) => ({
  boards: {},
  historyDrawings: {},
  boardsStateIndex: {},

  setDrawings: (key, drawings) =>
    set((state) => {
      state.boards[key] = drawings

      return {
        boards: state.boards,
      }
    }),

  setHistoryDrawings: (key, drawings) =>
    set((state) => {
      // if history length is higher than current index, remove all items in history after current index
      if (state.historyDrawings[key].length > state.boardsStateIndex[key]) {
        state.historyDrawings[key] = state.historyDrawings[key].slice(0, state.boardsStateIndex[key])
        state.boardsStateIndex[key] = state.historyDrawings[key].length - 1

        console.log({ history: state.historyDrawings, index: state.boardsStateIndex[key] })

        return {
          historyDrawings: state.historyDrawings,
          boardsStateIndex: state.boardsStateIndex,
        }
      }

      const history = state.historyDrawings[key]

      history.push(drawings)

      state.historyDrawings[key] = history

      return {
        historyDrawings: state.historyDrawings,
      }
    }),

  resetDrawings: (key) =>
    set((state) => {
      state.boards[key] = []
      state.historyDrawings[key] = [[]]
      state.boardsStateIndex[key] = 0

      return {
        boards: state.boards,
        historyDrawings: state.historyDrawings,
        boardsStateIndex: state.boardsStateIndex,
      }
    }),

  setBoardsStateIndex: (key) =>
    set((state) => {
      state.boardsStateIndex[key] += 1

      console.log('new INDEX', { key, state: state.boardsStateIndex[key], history: state.historyDrawings })

      return {
        boardsStateIndex: state.boardsStateIndex,
      }
    }),

  createBoard: (name) =>
    set((state) => {
      if (state.boards[name]) {
        return {}
      }

      saveBoardToLS(name, [])

      state.boards[name] = []
      state.boardsStateIndex[name] = 0
      state.historyDrawings[name] = [[]]

      return {
        boards: state.boards,
        boardsStateIndex: state.boardsStateIndex,
        historyDrawings: state.historyDrawings,
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
      console.log('UNDO', { history: state.historyDrawings, newIndex, oldIndex })

      saveBoardToLS(key, currentDrawings)

      state.boardsStateIndex[key] = newIndex
      state.boards[key] = currentDrawings

      return {
        boards: state.boards,
        boardsStateIndex: state.boardsStateIndex,
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

      console.log('REDO', { history: state.historyDrawings, newIndex, oldIndex })

      saveBoardToLS(key, currentDrawings)

      state.boardsStateIndex[key] = newIndex
      state.boards[key] = currentDrawings

      return {
        boards: state.boards,
        boardsStateIndex: state.boardsStateIndex,
      }
    }),
}))

export const useDrawings = (board: string) => {
  const { drawings, boards, setDrawings, setBoards, resetDrawingsStore } = drawingsStore(
    (state) => ({
      drawings: state.boards[board],
      boards: state.boards,
      setDrawings: state.setDrawings,
      setBoards: state.setBoards,
      resetDrawingsStore: state.resetDrawings,
      historyDrawings: state.historyDrawings,
    }),
    shallow,
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
    shallow,
  )

  const clearDrawings = (board: string) => {
    resetDrawings(board)
    saveBoardToLS(board, [])
    resetImagesFromDb()
  }

  const syncStorageDrawings = (board: string, drawings: Drawings) => {
    debouncedSaveToLS(board, drawings)
    setBoardsStateIndex(board)
    setHistoryDrawings(board, drawings)
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
