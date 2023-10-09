import { DrawingOptions, Tool } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UseBoardState {
  tool: Tool
  options: DrawingOptions
  currentBoard: string
  setTool: (t: Tool) => void
  setOptions: (o: Partial<DrawingOptions>) => void
  setCurrentBoard: (b: string) => void
}

export const useBoardState = create<UseBoardState>()(
  persist(
    (set, get) => ({
      tool: 'pen',
      options: {
        stroke: '#000000',
        fill: '#ffffff',
        strokeWidth: '1',
        fillStyle: 'none',
        fontFamily: 'SourceSansPro',
        fontSize: '24',
      },
      currentBoard: 'default',
      setTool: (tool) => set({ tool }),
      setOptions: (newOptions) => set({ options: { ...get().options, ...newOptions } }),
      setCurrentBoard: (board) => set({ currentBoard: board }),
    }),
    {
      name: 'current-state',
      partialize: (state) => ({ tool: state.tool, options: state.options, currentBoard: state.currentBoard }),
    }
  )
)
