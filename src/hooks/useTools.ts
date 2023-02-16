import { DrawingOptions, Tool } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UseTools {
  tool: Tool
  options: DrawingOptions
  setTool: (t: Tool) => void
  setOptions: (o: Partial<DrawingOptions>) => void
}

export const useTools = create<UseTools>()(
  persist(
    (set, get) => ({
      tool: 'pen',
      options: {
        lineColor: '#000000',
        backgroundFillColor: '#ffffff',
        lineWidth: '1',
        lineOpacity: 1,
        backgroundFillStyle: 'none',
      },
      setTool: (tool) => set({ tool }),
      setOptions: (newOptions) => set({ options: { ...get().options, ...newOptions } }),
    }),
    {
      name: 'current-tool',
      partialize: (state) => ({ tool: state.tool, options: state.options }),
    }
  )
)
