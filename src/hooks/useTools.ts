import { create } from 'zustand'

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

export const useTools = create<UseTools>((set) => ({
  tool: 'line',

  setTool: (tool) => set({ tool }),
}))
