import { createStore } from 'zustand'

type Tool = 'line' | 'circle' | 'rectangle' | 'pen'

interface UseTools {
  tool: Tool
  setTool: (t: Tool) => void
}

export const useTools = createStore<UseTools>((set) => ({
  tool: 'line',

  setTool: (tool) => set({ tool }),
}))
