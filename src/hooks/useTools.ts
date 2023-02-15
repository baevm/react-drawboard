import { Tool } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HEX = `#${string}`

type Options = {
  lineColor: HEX
  backgroundFillColor: HEX
  lineWidth: string
  lineOpacity: number
}

interface UseTools {
  tool: Tool
  options: Options
  setTool: (t: Tool) => void
  setOptions: (o: Options) => void
}

export const useTools = create<UseTools>()(
  persist(
    (set, get) => ({
      tool: 'pen',
      options: {
        lineColor: '#000000',
        backgroundFillColor: '#ffffff',
        lineWidth: '1',
        lineOpacity: 100,
      },
      setTool: (tool) => set({ tool }),
      setOptions: (options) => set({ options }),
    }),
    {
      name: 'current-tool',
      partialize: (state) => ({ tool: state.tool, options: state.options }),
    }
  )
)
