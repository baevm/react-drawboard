import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Tool =
  | 'select'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'pen'
  | 'text'
  | 'eraser'
  | 'move'
  | 'image'
  | 'triangle'
  | 'arrow'
  | 'rhombus'

interface UseTools {
  tool: Tool
  setTool: (t: Tool) => void
}

export const useTools = create<UseTools>()(
  persist(
    (set, get) => ({
      tool: 'pen',
      setTool: (tool) => set({ tool }),
    }),
    {
      name: 'current-tool',
      partialize: (state) => ({ tool: state.tool }),
    }
  )
)
