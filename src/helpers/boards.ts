import { BOARDS_LS_KEY } from '@/constants'
import { Boards, Drawings } from '@/types'
import { debounce } from '@/utils/debounce'

export const saveBoardsToLS = (boards: Boards) => {
  window.localStorage.setItem(BOARDS_LS_KEY, JSON.stringify(boards))
}

export const getBoardsFromLS = (): Record<string, Drawings> | null => {
  const boardsStr = window.localStorage.getItem(BOARDS_LS_KEY)

  if (boardsStr) {
    try {
      return JSON.parse(boardsStr) as Record<string, Drawings>
    } catch (error) {
      console.error(error)
      return null
    }
  } else {
    return null
  }
}

// used to sync localstorage with store drawings
export const saveBoardToLS = (board: string, newDrawings: Drawings) => {
  let oldBoards = getBoardsFromLS()

  if (oldBoards) {
    oldBoards[board] = newDrawings
    saveBoardsToLS(oldBoards)
  } else {
    saveBoardsToLS({ [board]: newDrawings })
  }
}

// debounce saving to local storage because
// its takes too much time to save and parse
// from local storage if we draw frequently
export const debouncedSaveToLS = debounce((board: string, newDrawings: Drawings) => {
  saveBoardToLS(board, newDrawings)
}, 200)
